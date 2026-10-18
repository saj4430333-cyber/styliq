// يعيد حالة RevenueCat للمستخدم الحالي: Entitlements النشطة + رصيد الكريديت.
// يُستخدم لعرض شاشة الاشتراك/الكريديت ولزر "استرجاع المشتريات".
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const ENTITLEMENT = 'styliq_pro';

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);

  let me: any;
  try {
    me = await base44.auth.me();
  } catch {
    return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
  }
  if (!me) return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });

  const rcSecret = secrets.get('REVENUECAT_SECRET_KEY');
  const userId = me.id;

  // الباقات والأسعار تأتي للواجهة من RevenueCat SDK مباشرةً (أسعار App Store المحلية)،
  // فلا حاجة لجلب Offerings هنا. هذه الدالة تعيد الحالة والرصيد فقط.

  // Entitlements للعميل (مفتاح سري)
  let entitlements: any = {};
  let subscriber: any = null;
  try {
    const r = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}/entitlements`,
      { headers: { 'Authorization': `Bearer ${rcSecret}` } },
    );
    if (r.ok) {
      const d = await r.json();
      subscriber = d?.subscriber || d;
      entitlements = subscriber?.entitlements || {};
    }
  } catch (e) {
    console.error('revenuecat-state entitlements error:', String(e));
  }

  // REST v1 يعيد expires_date فقط (لا حقل isActive): غياب التاريخ = صلاحية دائمة.
  const ent = entitlements?.[ENTITLEMENT];
  const entitlementActive = !!ent
    && (!ent.expires_date || new Date(ent.expires_date).getTime() > Date.now());

  // الرصيد يُحدَّث عبر asServiceRole على كيان User — auth.me() قد يبقى قديماً.
  let credits = Number(me.credits) || 0;
  let isProFlag = !!me.is_pro;
  try {
    const fresh = await base44.asServiceRole.entities.User.get(userId);
    if (fresh) {
      credits = Number(fresh.credits) || 0;
      isProFlag = !!fresh.is_pro;
    }
  } catch (e) {
    console.error('revenuecat-state user get error:', String(e));
  }

  // نرفع is_pro فقط هنا. الإلغاء/الانتهاء يتكفّل به revenuecat-webhook،
  // وإلا فإن المنتج الاستهلاكي (Consumable) — الذي لا يُنشئ Entitlement أصلاً —
  // كان يمسح is_pro الذي منحه الويبهوك للتوّ بعد الشراء.
  const isPro = entitlementActive || isProFlag;
  try {
    if (entitlementActive && !isProFlag) {
      await base44.asServiceRole.entities.User.update(userId, { is_pro: true });
    }
  } catch (e) {
    console.error('revenuecat-state sync error:', String(e));
  }

  return Response.json({
    ok: true,
    entitlements,
    is_pro: isPro,
    credits,
  });
}