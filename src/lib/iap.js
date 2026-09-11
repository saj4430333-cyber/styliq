// شراء داخل التطبيق عبر RevenueCat SDK (يعرض شاشة الشراء الرسمية من آبل).
// RevenueCat يتحقق من الإيصال مع آبل ثم يُطلق revenuecat-webhook الذي يمنح الكريديت،
// لذلك لا نرسل أي إيصال من الواجهة.
//
// النسخة المجانية (PAYMENTS_ENABLED=false): لا نستورد ولا نستدعي StoreKit/RevenueCat
// أصلاً — الاستيراد ديناميكي فقط عند تفعيل الدفع. الكود يبقى هنا للإصدار القادم.
import { Capacitor } from '@capacitor/core';
import { isPaymentsEnabled } from '@/lib/features';

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

export function isNativeIAPAvailable() {
  if (!isPaymentsEnabled()) return false;
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

let configuredUserId = null;

/** يحمّل RevenueCat فقط عند تفعيل الدفع — لا يُربط StoreKit في النسخة المجانية. */
async function loadPurchases() {
  if (!isPaymentsEnabled()) {
    throw new Error('IAP_DISABLED');
  }
  // اسم الحزمة عبر متغير حتى لا يفشل البناء عندما تكون الحزمة غير مثبتة في النسخة المجانية.
  const pkg = '@revenuecat/' + 'purchases-capacitor';
  const mod = await import(/* @vite-ignore */ pkg);
  return mod;
}

export async function configureIAP(appUserID) {
  if (!isNativeIAPAvailable() || !appUserID) return false;
  const id = String(appUserID);
  if (configuredUserId === id) return true;

  const { Purchases } = await loadPurchases();
  const { isConfigured } = await Purchases.isConfigured();
  if (isConfigured) {
    await Purchases.logIn({ appUserID: id });
  } else {
    await Purchases.configure({ apiKey: RC_APPLE_API_KEY, appUserID: id });
  }
  configuredUserId = id;
  return true;
}

export async function getLooksPackage() {
  if (!isNativeIAPAvailable()) return null;
  const { Purchases } = await loadPurchases();
  const { current } = await Purchases.getOfferings();
  const packages = current?.availablePackages || [];
  return packages.find((p) => p.product?.identifier === IAP_PRODUCT_ID) || packages[0] || null;
}

export async function purchaseLooks() {
  if (!isNativeIAPAvailable()) {
    throw new Error('IAP_WEB_UNSUPPORTED');
  }
  const pkg = await getLooksPackage();
  if (!pkg) throw new Error('IAP_NO_OFFERING');

  const { Purchases, PURCHASES_ERROR_CODE } = await loadPurchases();
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

export function purchaseErrorText(e) {
  const code = e?.message || '';
  if (code === 'IAP_DISABLED') {
    return 'الدفع غير مفعّل في هذه النسخة.';
  }
  if (code === 'IAP_WEB_UNSUPPORTED') {
    return 'الشراء متاح حالياً داخل تطبيق الآيفون فقط.';
  }
  if (code === 'IAP_NO_OFFERING') {
    return 'لم تُحمّل الباقات من App Store. تأكد أن المنتج معتمد في App Store Connect ومربوط بـ Offering في RevenueCat.';
  }
  return String(e?.message || e);
}

export async function restoreIAP() {
  if (!isNativeIAPAvailable()) return null;
  const { Purchases } = await loadPurchases();
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo || null;
}
