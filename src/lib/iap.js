// شراء داخل التطبيق عبر RevenueCat SDK (يعرض شاشة الشراء الرسمية من آبل).
// RevenueCat يتحقق من الإيصال مع آبل ثم يُطلق revenuecat-webhook الذي يمنح الكريديت،
// لذلك لا نرسل أي إيصال من الواجهة.
import { Capacitor } from '@capacitor/core';
import { Purchases, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';

// مفتاح RevenueCat العام لمنصة Apple — مخصص للعميل وليس سرّاً.
const RC_APPLE_API_KEY = 'appl_ivIADgzaXYBgcGSHQNKLkwBjlvn';

export const IAP_PRODUCT_ID = 'com.styliq.premium';

export class PurchaseCancelledError extends Error {
  constructor() {
    super('PURCHASE_CANCELLED');
    this.name = 'PurchaseCancelledError';
    this.cancelled = true;
  }
}

// iOS فقط حالياً: المفتاح المتاح هو مفتاح Apple. لتفعيل أندرويد أضف مفتاح goog_
// من لوحة RevenueCat واختره حسب المنصة هنا.
export function isNativeIAPAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

let configuredUserId = null;

// لا بد أن يكون app_user_id في RevenueCat مساوياً لمعرّف مستخدم Base44،
// وإلا لن يجد الويبهوك المستخدم ليضيف له الكريديت.
export async function configureIAP(appUserID) {
  if (!isNativeIAPAvailable() || !appUserID) return false;
  const id = String(appUserID);
  if (configuredUserId === id) return true;

  const { isConfigured } = await Purchases.isConfigured();
  if (isConfigured) {
    await Purchases.logIn({ appUserID: id });
  } else {
    await Purchases.configure({ apiKey: RC_APPLE_API_KEY, appUserID: id });
  }
  configuredUserId = id;
  return true;
}

// باقة الكريديت من الـ Current Offering المضبوط في لوحة RevenueCat.
export async function getLooksPackage() {
  if (!isNativeIAPAvailable()) return null;
  const { current } = await Purchases.getOfferings();
  const packages = current?.availablePackages || [];
  return packages.find((p) => p.product?.identifier === IAP_PRODUCT_ID) || packages[0] || null;
}

// يفتح شاشة الشراء من آبل ويعيد نتيجة RevenueCat بعد التحقق.
export async function purchaseLooks() {
  if (!isNativeIAPAvailable()) {
    throw new Error('IAP_WEB_UNSUPPORTED');
  }
  const pkg = await getLooksPackage();
  if (!pkg) throw new Error('IAP_NO_OFFERING');

  try {
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    return {
      platform: 'apple',
      productIdentifier: result?.productIdentifier || IAP_PRODUCT_ID,
      customerInfo: result?.customerInfo || null,
    };
  } catch (e) {
    if (e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || e?.userCancelled) {
      throw new PurchaseCancelledError();
    }
    throw e;
  }
}

// رسائل مفهومة لأشهر أسباب فشل الشراء.
export function purchaseErrorText(e) {
  const code = e?.message || '';
  if (code === 'IAP_WEB_UNSUPPORTED') {
    return 'الشراء متاح حالياً داخل تطبيق الآيفون فقط.';
  }
  if (code === 'IAP_NO_OFFERING') {
    return 'لم تُحمّل الباقات من App Store. تأكد أن المنتج معتمد في App Store Connect ومربوط بـ Offering في RevenueCat.';
  }
  return String(e?.message || e);
}

// استرجاع المشتريات من آبل ومزامنتها مع RevenueCat.
export async function restoreIAP() {
  if (!isNativeIAPAvailable()) return null;
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo || null;
}
