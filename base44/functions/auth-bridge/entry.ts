// جسر عودة تسجيل الدخول إلى تطبيق iOS الأصلي.
//
// لماذا نحتاجه: Base44 يرفض أي from_url خارج نطاقات التطبيق
// ("Invalid redirect domain")، فلا يمكن تمرير رابط عميق (deep link) مباشرةً.
// لذلك نمرّر عنوان هذه الدالة — وهي على نطاق التطبيق نفسه — ثم تحوّل هي
// المتصفح إلى scheme التطبيق فيلتقطه Capacitor ويكمل تسجيل الدخول.
//
// الدالة لا تقرأ ولا تكتب أي بيانات: تعيد توجيهاً فقط، وتمرّر ما أرسله Base44
// كما هو (access_token و is_new_user وغيرها) دون تسجيله.

const APP_SCHEME = 'com.base6a80314d63be247cee56fa4f.app';
const CALLBACK_HOST = 'auth';

export default async function (req: Request): Promise<Response> {
  const incoming = new URL(req.url).searchParams;

  // لا نعيد التوجيه إلا مع توكن فعلي، حتى لا يُستخدم الرابط لفتح التطبيق عبثاً.
  if (!incoming.get('access_token')) {
    return new Response(
      'Missing access_token. This endpoint only forwards a completed Base44 sign-in to the iOS app.',
      { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const target = `${APP_SCHEME}://${CALLBACK_HOST}?${incoming.toString()}`;

  // 302 إلى الـ scheme: ASWebAuthenticationSession على iOS تلتقط هذا التحويل
  // وتغلق الجلسة. صفحة HTML تبقى احتياطاً للمتصفحات التي لا تتبع التحويل.
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${target}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>جارٍ العودة إلى StyliQ…</title>
</head>
<body>
  <p>جارٍ إعادتك إلى التطبيق…</p>
  <a href="${target}">العودة إلى StyliQ</a>
  <script>window.location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;

  return new Response(html, {
    status: 302,
    headers: {
      Location: target,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
