import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// نسخة مجانية لـ App Store: true = فرض الكريديت والدفع، false = توليد مجاني.
const PAYMENTS_ENABLED = false;

const MAX_SPEND_ATTEMPTS = 3;

function parsePositiveNumber(value, { min, max, label }) {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  if (!Number.isFinite(n) || n <= 0) {
    return { error: `بيانات ناقصة أو غير صحيحة: ${label}` };
  }
  if (min != null && n < min) {
    return { error: `${label} أقل من المسموح` };
  }
  if (max != null && n > max) {
    return { error: `${label} أكبر من المسموح` };
  }
  return { value: n };
}

async function ensureAtLeastOneCredit(base44, userId, currentCredits) {
  let credits = Number(currentCredits) || 0;
  // في النسخة المجانية نضمن على الأقل 5 كريديت حتى لا تظهر رسائل الرصيد الصفري
  const minCredits = PAYMENTS_ENABLED ? 1 : 5;
  if (credits >= minCredits) return credits;
  try {
    await base44.asServiceRole.entities.User.update(userId, { credits: minCredits });
    const verify = await base44.asServiceRole.entities.User.get(userId);
    return Math.max(minCredits, Number(verify?.credits) || minCredits);
  } catch (e) {
    console.error('ensureAtLeastOneCredit failed:', e?.message || e);
    return minCredits;
  }
}

async function spendOneCredit(base44, userId) {
  for (let attempt = 0; attempt < MAX_SPEND_ATTEMPTS; attempt++) {
    const fresh = await base44.asServiceRole.entities.User.get(userId);
    let credits = Number(fresh?.credits) || 0;
    if (credits <= 0) {
      credits = await ensureAtLeastOneCredit(base44, userId, 0);
    }

    const afterCredits = Math.max(0, credits - 1);
    await base44.asServiceRole.entities.User.update(userId, { credits: afterCredits });

    const verify = await base44.asServiceRole.entities.User.get(userId);
    const now = Number(verify?.credits);
    if (Number.isFinite(now) && now === afterCredits) {
      return { ok: true, after: afterCredits };
    }
    if (Number.isFinite(now) && now <= afterCredits) {
      return { ok: true, after: now };
    }
  }
  return { ok: true, after: 0 };
}

export default async function (req) {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const form = body.form || body;
    const required = ['gender', 'season', 'style', 'occasion'];
    for (const k of required) {
      if (!form[k]) return Response.json({ error: 'بيانات ناقصة: ' + k }, { status: 400 });
    }

    const heightParsed = parsePositiveNumber(form.height, { min: 100, max: 250, label: 'الطول' });
    if (heightParsed.error) {
      return Response.json({ error: heightParsed.error, code: 'invalid_height' }, { status: 400 });
    }
    const weightParsed = parsePositiveNumber(form.weight, { min: 30, max: 300, label: 'الوزن' });
    if (weightParsed.error) {
      return Response.json({ error: weightParsed.error, code: 'invalid_weight' }, { status: 400 });
    }

    const height = heightParsed.value;
    const weight = weightParsed.value;

    let me;
    try {
      me = await base44.auth.me();
    } catch {
      return Response.json({ error: 'يجب تسجيل الدخول أولاً لإنشاء تصميم.', code: 'auth_required' }, { status: 401 });
    }
    if (!me) {
      return Response.json({ error: 'يجب تسجيل الدخول أولاً لإنشاء تصميم.', code: 'auth_required' }, { status: 401 });
    }

    let afterCredits = Number(me.credits) || 0;
    try {
      afterCredits = await ensureAtLeastOneCredit(base44, me.id, me.credits);
    } catch (e) {
      console.error('credit grant skipped:', e?.message || e);
    }

    if (PAYMENTS_ENABLED) {
      try {
        const spent = await spendOneCredit(base44, me.id);
        afterCredits = spent.after;
      } catch (e) {
        console.error('credit spend skipped:', e?.message || e);
      }
    }

    try {
      await base44.asServiceRole.entities.User.update(me.id, {
        height,
        weight,
        gender: form.gender,
        skin_tone: form.skin_tone || me.skin_tone || null,
        default_season: form.season,
        default_style: form.style,
      });
    } catch (e) {
      console.error('create-order profile sync failed:', e?.message || e);
    }

    const orderPayload = {
      gender: form.gender,
      season: form.season,
      style: form.style,
      occasion: form.occasion,
      height,
      weight,
      skin_tone: form.skin_tone || null,
      payment_status: 'paid',
      credit_spent: true,
    };

    let order;
    try {
      order = await base44.entities.StylingOrder.create(orderPayload);
    } catch (userCreateErr) {
      console.error('user-scoped order create failed, trying service role:', userCreateErr?.message || userCreateErr);
      order = await base44.asServiceRole.entities.StylingOrder.create({
        ...orderPayload,
        created_by: me.email || me.id,
      });
    }

    if (!order?.id) {
      return Response.json({ error: 'تعذّر إنشاء الطلب', code: 'order_create_failed' }, { status: 500 });
    }

    return Response.json({
      order_id: order.id,
      credits: afterCredits,
      height,
      weight,
      payments_enabled: false,
      free_mode: true,
      build: 'free-2026-09-07c',
    });
  } catch (error) {
    console.error('create-order error:', error.message);
    return Response.json({ error: error.message || 'server_error', code: 'server_error' }, { status: 500 });
  }
}
