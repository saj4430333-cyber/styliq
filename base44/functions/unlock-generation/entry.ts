import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// فتح طلب معلّق بخصم كريديت واحد من رصيد السيرفر فقط.
// الكريديت يُمنح حصرياً عبر revenuecat-webhook بعد تحقق RevenueCat من إيصال آبل/جوجل.
// أي receipt / platform / transaction_id يرسله العميل يُرفض ولا يُعتبر إثبات دفع.
export const PRODUCT_ID = 'com.styliq.premium';

const MAX_SPEND_ATTEMPTS = 3;

const CLIENT_PAYMENT_PROOF_KEYS = [
  'receipt',
  'iap_receipt',
  'purchase_token',
  'transaction_id',
  'transactionId',
  'platform',
  'iap_platform',
  'signed_transaction',
  'signedTransactionInfo',
];

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

export default async function (req) {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // رفض صريح لأي «إثبات شراء» من العميل — لا نثق بإيصالات غير متحققة.
    const offeredProof = CLIENT_PAYMENT_PROOF_KEYS.filter((k) => body?.[k] != null && body[k] !== '');
    if (offeredProof.length) {
      console.warn('unlock-generation rejected client payment proof', { keys: offeredProof });
      return Response.json(
        {
          error: 'إثبات الشراء من العميل غير مقبول. أكمل الشراء عبر التطبيق ثم انتظر إضافة الكريديت.',
          code: 'receipt_not_accepted',
        },
        { status: 400 },
      );
    }

    if (!body.order_id) {
      return Response.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    let me;
    try {
      me = await base44.auth.me();
    } catch {
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

    // رصيد مجاني من فشل توليد سابق: نفتح بدون خصم إضافي (يُعيَّن من السيرفر فقط).
    if (order.credited) {
      await base44.asServiceRole.entities.StylingOrder.update(order.id, {
        payment_status: 'paid',
        credit_spent: true,
      });
      return Response.json({ ok: true, credited: true, product_id: PRODUCT_ID });
    }

    // الخصم من رصيد السيرفر فقط — مصدر الكريديت هو RevenueCat webhook.
    const spent = await spendOneCredit(base44, me.id);
    if (!spent.ok) {
      return Response.json(
        { error: 'لا تملك رصيد كريديت. أكمل الشراء أولاً.', code: spent.code || 'no_credits' },
        { status: 402 },
      );
    }

    await base44.asServiceRole.entities.StylingOrder.update(order.id, {
      payment_status: 'paid',
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
