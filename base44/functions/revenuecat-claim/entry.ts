// إثبات شراء أصلي (Apple StoreKit / Google Play) إلى RevenueCat.
// يستقبله الواجهة بعد window.NativeIAP.purchase → يرسل الإيصال إلى
// RevenueCat /v1/receipts مع app_user_id = معرّف المستخدم الحالي،
// ما يُطلق الحدث NON_RENEWING_PURCHASE في الـ webhook → يُضاف الكريديت.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const PRODUCT_ID = 'com.styliq.premium';
const VALID_PLATFORMS = ['apple', 'google'];

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);

  // 1) مصادقة إلزامية
  let me: any;
  try {
    me = await base44.auth.me();
  } catch {
    return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
  }
  if (!me) return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });

  // 2) قراءة الحمولة
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const platform: string = String(body?.platform || '').toLowerCase();
  const receipt: string = String(body?.receipt || '');

  if (!VALID_PLATFORMS.includes(platform)) {
    return Response.json({ error: 'منصة الشراء غير صالحة', code: 'invalid_platform' }, { status: 400 });
  }
  if (!receipt || receipt.length < 8) {
    return Response.json({ error: 'إيصال الشراء مطلوب', code: 'receipt_required' }, { status: 400 });
  }

  // 3) إرسال الإيصال إلى RevenueCat للتحقق الأصلي مع Apple/Google
  const rcSecret = secrets.get('REVENUECAT_SECRET_KEY');
  try {
    const res = await fetch('https://api.revenuecat.com/v1/receipts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rcSecret}`,
        'Content-Type': 'application/json',
        'X-Platform': platform,
      },
      body: JSON.stringify({
        app_user_id: me.id,
        fetch_token: receipt,
        product_id: PRODUCT_ID,
      }),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('revenuecat-claim RC error:', JSON.stringify(data));
      return Response.json({ error: 'فشل التحقق من الإيصال في RevenueCat', rc_error: data }, { status: 502 });
    }
    return Response.json({ ok: true, product_id: PRODUCT_ID, platform, rc: data });
  } catch (error: any) {
    console.error('revenuecat-claim fetch error:', error?.message || error);
    return Response.json({ error: 'تعذّر الاتصال بـ RevenueCat' }, { status: 502 });
  }
}