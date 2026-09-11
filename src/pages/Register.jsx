import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, Sparkles, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import FacebookIcon from "@/components/FacebookIcon";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { safeReturnTo } from "@/lib/authReturnTo";
import { isNativeAuthAvailable, loginWithProviderNative, AuthCancelledError } from "@/lib/nativeAuth";

export default function Register() {
  const navigate = useNavigate();
  const { checkUserAuth, completeNativeLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showPass, setShowPass] = useState(false);

  const returnTo = safeReturnTo();
  const pendingCreate = (returnTo || '').includes('create=1');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 8) {
      setError("يجب أن تكون كلمة المرور ٨ أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "تعذّر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      await checkUserAuth();
      navigate(returnTo || '/', { replace: true });
    } catch (err) {
      setError(err.message || "رمز التحقق غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "أُرسل الرمز", description: "تحقق من بريدك الإلكتروني للرمز الجديد." });
    } catch (err) {
      setError(err.message || "تعذّر إعادة إرسال الرمز");
    }
  };

  // على iOS نفتح Safari ونعود برابط عميق؛ مزوّدو OAuth يحظرون الـ WebView.
  const handleProvider = async (provider) => {
    setError("");
    if (isNativeAuthAvailable()) {
      setLoading(true);
      try {
        const token = await loginWithProviderNative(provider);
        await completeNativeLogin(token);
        navigate(returnTo || "/", { replace: true });
      } catch (err) {
        if (err instanceof AuthCancelledError || err?.cancelled) return;
        setError(err?.message || "تعذّر بدء تسجيل الدخول");
      } finally {
        setLoading(false);
      }
      return;
    }
    base44.auth.loginWithProvider(provider, returnTo);
  };

  if (showOtp) {
    return (
      <AuthLayout icon={ShieldCheck} title="تأكيد البريد الإلكتروني" subtitle={`أرسلنا رمزاً إلى ${email}`}>
        <div dir="rtl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}
          <div className="flex justify-center mb-6">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full h-12 rounded-xl text-base font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
            {loading ? (<><Loader2 className="w-4 h-4 ml-2 animate-spin" />جارٍ التحقق...</>) : "تأكيد"}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            لم يصلك الرمز؟{" "}
            <button onClick={handleResend} className="text-primary font-medium hover:underline">إعادة الإرسال</button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Sparkles}
      title="أنشئ حسابك"
      subtitle="انضم إلى StyliQ واكتشف تنسيقاتك المخصّصة"
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")} className="text-primary font-medium hover:underline">
            تسجيل الدخول
          </Link>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => navigate(pendingCreate ? "/styling" : "/", { replace: true })}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              المتابعة كزائر
            </button>
          </div>
        </>
      }
    >
      <div dir="rtl">
        {pendingCreate && (
          <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20 text-sm text-center">
            بياناتك محفوظة. أنشئ حساباً أو سجّل الدخول لإنشاء الإطلالات والصور.
          </div>
        )}
        {/* مزوّدو الدخول — رأسي، Apple في الأعلى */}
        <div className="space-y-3 mb-5">
          <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-medium" onClick={() => handleProvider("apple")} disabled={loading}>
            <AppleIcon className="w-5 h-5 ml-2" />
            التسجيل عبر Apple
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-medium" onClick={() => handleProvider("google")}>
            <GoogleIcon className="w-5 h-5 ml-2" />
            التسجيل عبر Google
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-medium" onClick={() => handleProvider("facebook")}>
            <FacebookIcon className="w-5 h-5 ml-2" />
            Facebook
          </Button>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground">أو عبر البريد الإلكتروني</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10 h-12" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="password" type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="px-10 h-12" required />
              <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="إظهار كلمة المرور">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="confirm" type={showPass ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="px-10 h-12" required />
              {confirmPassword && password === confirmPassword && (
                <Check className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              )}
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium" disabled={loading}>
            {loading ? (<><Loader2 className="w-4 h-4 ml-2 animate-spin" />جارٍ الإنشاء...</>) : "إنشاء الحساب"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
          بإنشائك حساباً فإنك توافق على{" "}
          <Link to="/terms" className="text-primary hover:underline">شروط الخدمة</Link>
          {" "}و{" "}
          <Link to="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>.
        </p>
      </div>
    </AuthLayout>
  );
}