// مفتاح تشغيل الدفع داخل التطبيق (IAP / Paywall / الكريديت).
//
// النسخة الحالية مجانية لـ App Store: اتركه false لإخفاء الدفع والسماح
// بالتوليد بدون شراء. كود الواجهة (Pricing / PayWall / CreditPurchase / iap.js)
// يبقى في المشروع.
//
// لإرجاع الدفع في إصدار لاحق:
// 1) PAYMENTS_ENABLED = true هنا
// 2) PAYMENTS_ENABLED = true في create-order / unlock-generation / generate-outfits
// 3) npm i @revenuecat/purchases-capacitor && npx cap sync ios
// 4) انشر دوال الباك اند وابنِ نسخة جديدة
export const PAYMENTS_ENABLED = false;

export function isPaymentsEnabled() {
  return PAYMENTS_ENABLED === true;
}
