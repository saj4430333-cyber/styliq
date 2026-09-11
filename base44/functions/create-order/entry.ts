import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MAX_SPEND_ATTEMPTS = 3;

async function spendOneCredit(base44, userId) {
  for (let attempt = 0; attempt < MAX_SPEND_ATTEMPTS; attempt++) {
    const fresh = await base44.asServiceRole.entities.User.get(userId);
    const credits = Number(fresh?.credits) || 0;
    if (credits <= 0) {
      return { ok: false, code: 'no_credits', credits: 0 };
    }

    const expected = credits;
    const afterCredits = credits - 1;
    await base44.asServiceRole.entities.User.update(userId, { credits: afterCredits });

    // تأكيد الخصم: لو طلب متزامن كتب فوقنا نعيد المحاولة.
    const verify = await base44.asServiceRole.entities.User.get(userId);
    const now = Number(verify?.credits);
    if (Number.isFinite(now) && now === afterCredits) {
      return { ok: true, before: expected, after: afterCredits };
    }
    if (Number.isFinite(now) && now < afterCredits) {
      // خصم متزامن آخر نجح أيضاً — رصيدنا خُصم ضمنياً.
      return { ok: true, before: expected, after: now };
    }
  }
  return { ok: false, code: 'spend_conflict', credits: 0 };
}

export default async function(req) {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const form = body.form || body;
    const required = ['height', 'weight', 'gender', 'season', 'style', 'occasion'];
    for (const k of required) {
      if (!form[k]) return Response.json({ error: 'بيانات ناقصة: ' + k }, { status: 400 });
    }

    let me;
    try {
      me = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'يجب تسجيل الدخول أولاً لإنشاء تصميم.', code: 'auth_required' }, { status: 401 });
    }
    if (!me) return Response.json({ error: 'يجب تسجيل الدخول أولاً لإنشاء تصميم.', code: 'auth_required' }, { status: 401 });

    const spent = await spendOneCredit(base44, me.id);
    if (!spent.ok) {
      return Response.json({
        error: 'لا تملك رصيد كريديت كافٍ. اشترِ باقة للحصول على ٥ إطلالات جديدة.',
        code: spent.code || 'no_credits',
      }, { status: 402 });
    }

    // الطلب مدفوع لأن الكريديت خُصم بالفعل. نستخدم عميل المستخدم ليُسجَّل created_by_id.
    let order;
    try {
      order = await base44.entities.StylingOrder.create({
        gender: form.gender,
        season: form.season,
        style: form.style,
        occasion: form.occasion,
        height: Number(form.height),
        weight: Number(form.weight),
        skin_tone: form.skin_tone || null,
        payment_status: 'paid',
        credit_spent: true,
      });
    } catch (createErr) {
      // استرجاع الكريديت إن فشل إنشاء الطلب بعد الخصم
      try {
        const cur = await base44.asServiceRole.entities.User.get(me.id);
        const current = Number(cur?.credits) || 0;
        await base44.asServiceRole.entities.User.update(me.id, { credits: current + 1 });
      } catch {
        /* نترك الخطأ الأصلي */
      }
      throw createErr;
    }

    return Response.json({ order_id: order.id, credits: spent.after });
  } catch (error) {
    console.error('create-order error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
