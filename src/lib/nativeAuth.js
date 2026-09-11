// تسجيل الدخول بـ Google/Apple داخل التطبيق الأصلي.
//
// على iOS نستخدم ASWebAuthenticationSession (NativeAuthPlugin): عند التحويل
// إلى scheme التطبيق تُغلق الجلسة ويُعاد الرابط ومعه access_token مباشرة.
// مسار الويب (redirect كامل) ومسار SFSafariViewController لا ينفعان هنا:
// مزوّدو OAuth يحظرون الـ WebView، وBase44 يرفض أي from_url خارج نطاق التطبيق،
// وSFSafariViewController لا يسلّم الرابط العميق عند إغلاق النافذة بزر X.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { isNative, backendOrigin } from '@/lib/native';
import { appParams } from '@/lib/app-params';

const AUTH_SCHEME = 'com.base6a80314d63be247cee56fa4f.app';
export const AUTH_REDIRECT_URL = `${AUTH_SCHEME}://auth`;

const NativeAuth = registerPlugin('NativeAuth');

function authBridgeUrl() {
  return `${backendOrigin()}/api/apps/${appParams.appId}/functions/auth-bridge`;
}

export function isNativeAuthAvailable() {
  return isNative();
}

export class AuthCancelledError extends Error {
  constructor() {
    super('cancelled');
    this.name = 'AuthCancelledError';
    this.cancelled = true;
  }
}

function providerLoginUrl(provider) {
  const providerPath = provider === 'google' ? '' : `/${provider}`;
  const params = new URLSearchParams({
    app_id: appParams.appId,
    from_url: authBridgeUrl(),
  });
  return `${backendOrigin()}/api/apps/auth${providerPath}/login?${params}`;
}

export function extractAccessToken(url) {
  if (!url || typeof url !== 'string') return null;
  const readFrom = (part) => {
    if (!part) return null;
    const q = part.indexOf('?');
    const search = q >= 0 ? part.slice(q + 1) : part;
    try {
      return new URLSearchParams(search).get('access_token');
    } catch {
      return null;
    }
  };

  const hashIndex = url.indexOf('#');
  const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const afterHash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';

  const fromQueryOrHash = readFrom(beforeHash) || readFrom(afterHash);
  if (fromQueryOrHash) return fromQueryOrHash;

  // iOS أحياناً يحذف الـ query من الـ custom scheme، فنضع التوكن في المسار أيضاً.
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last.startsWith('eyJ')) return decodeURIComponent(last);
  } catch {
    /* ليست URL قياسية */
  }
  return null;
}

/** يبدأ Google/Apple ويعيد access_token بعد نجاح التحويل من auth-bridge. */
export async function loginWithProviderNative(provider) {
  const url = providerLoginUrl(provider);

  if (Capacitor.getPlatform() === 'ios') {
    try {
      const result = await NativeAuth.startLogin({ url, callbackScheme: AUTH_SCHEME });
      const token = extractAccessToken(result?.url);
      if (!token) throw new Error('لم يُرجع تسجيل الدخول رمزاً. أعد المحاولة.');
      return token;
    } catch (e) {
      const msg = String(e?.message || e?.code || e);
      if (msg.includes('cancelled') || e?.cancelled) {
        throw new AuthCancelledError();
      }
      throw e;
    }
  }

  // أندرويد: Custom Tabs + رابط عميق.
  return waitForToken(() => Browser.open({ url, presentationStyle: 'popover' }));
}

function waitForToken(openBrowser) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let listenerHandle = null;
    const finish = async (fn) => {
      if (settled) return;
      settled = true;
      try {
        await listenerHandle?.remove();
      } catch {
        /* مقبول */
      }
      fn();
    };

    App.addListener('appUrlOpen', async ({ url }) => {
      const token = extractAccessToken(url);
      if (!token) return;
      try {
        await Browser.close();
      } catch {
        /* مقبول */
      }
      finish(() => resolve(token));
    }).then((handle) => {
      listenerHandle = handle;
      return openBrowser();
    }).catch(reject);

    setTimeout(() => {
      finish(() => reject(new Error('انتهت مهلة تسجيل الدخول. أعد المحاولة.')));
    }, 180000);
  });
}

export async function clearAuthSession() {
  try {
    window.localStorage.removeItem('base44_access_token');
    window.localStorage.removeItem('token');
  } catch {
    /* مقبول */
  }

  try {
    const axios = (await import('axios')).default;
    delete axios.defaults.headers.common.Authorization;
  } catch {
    /* مقبول */
  }

  // تنظيف كوكيز الجلسة على السيرفر دون مغادرة الـ WebView (لا نتابع التحويل).
  try {
    await fetch(`${backendOrigin()}/api/apps/auth/logout`, {
      method: 'GET',
      credentials: 'include',
      redirect: 'manual',
    });
  } catch {
    /* الخروج المحلي يكفي */
  }
}

export async function nativeLogout() {
  await clearAuthSession();
}

export function initNativeAuthListener(onToken) {
  if (!isNative()) return () => {};

  const handle = App.addListener('appUrlOpen', async ({ url }) => {
    const token = extractAccessToken(url);
    if (!token) return;
    try {
      await Browser.close();
    } catch {
      /* مقبول */
    }
    try {
      await onToken(token);
    } catch (e) {
      console.error('native auth token handling failed:', e);
    }
  });

  return () => {
    handle.then((h) => h.remove()).catch(() => {});
  };
}
