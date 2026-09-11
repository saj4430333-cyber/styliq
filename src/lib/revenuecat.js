// حالة الاشتراك/الكريديت من السيرفر. الشراء نفسه يتم عبر RevenueCat SDK في lib/iap.js،
// والكريديت يُمنح من revenuecat-webhook بعد تحقّق RevenueCat من الإيصال مع آبل.
import { base44 } from '@/api/base44Client';
import { restoreIAP } from '@/lib/iap';

// المنتج Consumable: لا يُنشئ Entitlement في RevenueCat، فحالة Pro والرصيد
// يمنحهما revenuecat-webhook عند حدث NON_RENEWING_PURCHASE.
export const RC_PRODUCT_ID = 'com.styliq.premium';
export const CREDITS_PER_PACK = 5;

// حالة Entitlement + الرصيد الحالي من كيان المستخدم.
export async function fetchState() {
  const res = await base44.functions.invoke('revenuecat-state', {});
  return res?.data || res || {};
}

// الويبهوك غير فوري، فننتظر ظهور الكريديت بعد نجاح الشراء.
export async function waitForCredits({ since = 0, attempts = 8, delayMs = 1500 } = {}) {
  for (let i = 0; i < attempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));
    try {
      const st = await fetchState();
      const credits = Number(st?.credits) || 0;
      if (credits > since) return credits;
    } catch {
      /* نعيد المحاولة */
    }
  }
  return 0;
}

// استرجاع المشتريات: نزامن مع آبل ثم نعيد قراءة الحالة من السيرفر.
export async function restorePurchases() {
  try {
    await restoreIAP();
  } catch {
    /* على الويب أو بدون مشتريات سابقة */
  }
  return fetchState();
}
