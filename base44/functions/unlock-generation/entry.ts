import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// معرّف منتج الشراء داخل التطبيق (Apple StoreKit / Google Play Billing) — Consumable
export const PRODUCT_ID = 'com.styliq.premium';

const MAX_SPEND_ATTEMPTS = 3;

async function spendOneCredit(base44, userId) {
  for (let attempt = 0; attempt < MAX_SPEND_ATTEMPTS; attempt++) {
    const fresh = await base44.asServiceRole.entities.User.get(userId);
    const credits = Number(fresh?.credits) || 0;
    if (credits <= 0) {
      return { ok: false, code: 'no_credits', credits: 0 };
    }

    const afterCredits = credits - 1;
    await base44.asServiceRole.entities.User.update(userId, { credits: afterCredits });

    const verify = await base44.asServiceRole.entities.User.get(userId);
    const now = Number(verify?.credits);
    if (Number.isFinite(now) && now <= afterCredits) {
      return { ok: true, after: Math.max(0, now) };
    }
  }
  return { ok: false, code: 'spend_conflict', credits: 0 };
}

export default async function(req) {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    if (!body.order_id) {
      return Response.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    let me;
    try {
      me = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
    }
    if (!me) return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });

    const order = await base44.asServiceRole.entities.StylingOrder.get(body.order_id);
    if (!order) return Response.json({ error: 'الطلب غير موجود' }, { status: 404 });

    if (order.created_by_id !== me.id) {
      return Response.json({ error: 'غير مصرّح بالوصول إلى هذا الطلب' }, { status: 403 });
    }

    if (order.payment_status === 'paid') {
      return Response.json({
        ok: true,
        already_paid: true,
        product_id: PRODUCT_ID,
        credit_spent: !!order.credit_spent,
      });
    }

    // رصيد مجاني من فشل توليد سابق: نفتح بدون خصم إضافي.
    if (order.credited) {
      await base44.asServiceRole.entities.StylingOrder.update(order.id, {
        payment_status: 'paid',
        credit_spent: true,
      });
      return Response.json({ ok: true, credited: true, product_id: PRODUCT_ID });
    }

    // لازم نخصم كريديت واحد هنا — وإلا يُفتح التوليد دون استهلاك الباقة.
    const spent = await spendOneCredit(base44, me.id);
    if (!spent.ok) {
      return Response.json(
        { error: 'لا تملك رصيد كريديت. أكمل الشراء أولاً.', code: spent.code || 'no_credits' },
        { status: 402 },
      );
    }

    await base44.asServiceRole.entities.StylingOrder.update(order.id, {
      payment_status: 'paid',
      iap_platform: 'apple',
      credit_spent: true,
    });

    return Response.json({
      ok: true,
      product_id: PRODUCT_ID,
      credits: spent.after,
    });
  } catch (error) {
    console.error('unlock-generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
