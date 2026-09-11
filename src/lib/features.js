// مفتاح تشغيل الدفع داخل التطبيق (IAP / Paywall / الكريديت).
//
// النسخة الحالية مجانية لـ App Store: اتركه false لإخفاء الدفع والسماح
// بالتوليد بدون شراء. كل كود الدفع (iap / RevenueCat / Pricing / PayWall)
// يبقى في المشروع — لإرجاع الدفع في إصدار لاحق غيّر القيمة إلى true
// وانشر دوال الباك اند بنفس القيمة في create-order و unlock-generation
// و generate-outfits.
export const PAYMENTS_ENABLED = false;

export function isPaymentsEnabled() {
  return PAYMENTS_ENABLED === true;
}
