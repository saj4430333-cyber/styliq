import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { setOnboarded, setOnboardingPrefs, getLang } from '@/lib/language';
import { setLang } from '@/lib/i18n-store';
import { LANGUAGES, t } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { STYLES, HIJABI_STYLE } from '@/lib/styles';
import { styleDisplayName } from '@/lib/translate';
import CreditPurchase from '@/components/CreditPurchase';

const SEASON_VALUES = ['ربيع', 'صيف', 'خريف', 'شتاء'];
const OCCASION_VALUES = ['يومي', 'عمل', 'مناسبة اجتماعية', 'موعد', 'سفر'];
const GENDER_VALUES = ['ذكر', 'أنثى'];

function Pill({ label, value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-3.5 rounded-2xl border text-sm font-medium transition-all active:scale-95 ${
        selected ? 'bg-primary text-primary-foreground border-primary shadow' : 'bg-card text-foreground border-border'
      }`}
    >
      {label}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [lang, setLangState] = useState(getLang());
  const [form, setForm] = useState({ height: '', weight: '', gender: '', season: '', style: '', occasion: '' });
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then((authed) => { if (authed && getLang()) setStep(1); })
      .catch(() => {})
      .finally(() => setAuthChecking(false));
  }, []);

  const s = t(lang);
  const isRTL = lang === 'ar';
  const Back = isRTL ? ArrowRight : ArrowLeft;
  const Fwd = isRTL ? ArrowLeft : ArrowRight;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const availableStyles = form.gender === 'أنثى' ? [...STYLES, HIJABI_STYLE] : STYLES;

  const pickLang = async (l) => {
    setLang(l);
    setLangState(l);
    setOnboarded();
    try {
      const authed = await base44.auth.isAuthenticated();
      if (authed) setStep(1);
      else navigate('/register?returnTo=/');
    } catch (e) {
      navigate('/register?returnTo=/');
    }
  };

  const validate = () => {
    const e = {};
    if (!form.gender) e.gender = s.required;
    if (!form.height) e.height = s.required;
    if (!form.weight) e.weight = s.required;
    if (!form.season) e.season = s.required;
    if (!form.occasion) e.occasion = s.required;
    if (!form.style) e.style = s.required;
    return e;
  };

  const goCreate = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setOnboardingPrefs(form);
    setOnboarded();
    runCreateOrder();
  };

  const runCreateOrder = async () => {
    setCreating(true);
    try {
      const res = await base44.functions.invoke('create-order', { form });
      const orderId = res.data?.order_id;
      if (!orderId) throw new Error(res.data?.error || 'error');
      navigate('/results?order_id=' + orderId);
    } catch (err) {
      const status = err?.response?.status || err?.status;
      const code = err?.response?.data?.code;
      setCreating(false);
      if (status === 402 || code === 'no_credits') {
        setPaywallOpen(true);
        return;
      }
      if (status === 401 || code === 'auth_required') {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setErrors((p) => ({ ...p, submit: err?.response?.data?.error || err.message || 'error' }));
    }
  };

  const onPurchaseSuccess = () => {
    setPaywallOpen(false);
    runCreateOrder();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-5 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        {/* Header */}
        <div className="py-6 flex items-center justify-between">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95">
              <Back className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              {/* Step 0: Language selection */}
              {step === 0 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                      <Globe className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="font-display text-3xl font-bold mb-2">StyliQ</h1>
                    <p className="text-muted-foreground">{s.lang_sub}</p>
                  </div>
                  <div className="space-y-2.5">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => pickLang(l.code)}
                        className="w-full p-4 rounded-2xl border border-border bg-card flex items-center justify-between active:scale-95 transition-transform"
                      >
                        <span className={isRTL ? 'text-right' : 'text-left'}>
                          <span className="block font-bold text-lg">{l.name}</span>
                          <span className="text-sm text-muted-foreground">{l.native}</span>
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium uppercase">{l.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Design preferences */}
              {step === 1 && (
                <div className="py-2">
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> {s.dsn_badge}
                    </span>
                    <h1 className="font-display text-2xl font-bold mb-1">{s.dsn_title}</h1>
                    <p className="text-muted-foreground text-sm">{s.dsn_desc}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{s.gender}</Label>
                      <div className="flex gap-3">
                        {GENDER_VALUES.map((g) => (
                          <Pill
                            key={g}
                            label={s.gender_vals[g]}
                            value={g}
                            selected={form.gender === g}
                            onClick={() => {
                              set('gender', g);
                              if (g === 'ذكر' && form.style === HIJABI_STYLE) set('style', '');
                            }}
                          />
                        ))}
                      </div>
                      {errors.gender && <p className="text-destructive text-sm">{errors.gender}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{s.height}</Label>
                        <Input type="number" inputMode="numeric" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="175" className="h-14 rounded-2xl text-base" />
                        {errors.height && <p className="text-destructive text-sm">{errors.height}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{s.weight}</Label>
                        <Input type="number" inputMode="numeric" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="70" className="h-14 rounded-2xl text-base" />
                        {errors.weight && <p className="text-destructive text-sm">{errors.weight}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{s.season}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {SEASON_VALUES.map((v) => <Pill key={v} label={s.season_vals[v]} value={v} selected={form.season === v} onClick={() => set('season', v)} />)}
                      </div>
                      {errors.season && <p className="text-destructive text-sm">{errors.season}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{s.occasion}</Label>
                      <div className="flex flex-wrap gap-3">
                        {OCCASION_VALUES.map((v) => <Pill key={v} label={s.occasion_vals[v]} value={v} selected={form.occasion === v} onClick={() => set('occasion', v)} />)}
                      </div>
                      {errors.occasion && <p className="text-destructive text-sm">{errors.occasion}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{s.style}</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {availableStyles.map((st) => <Pill key={st} label={styleDisplayName(st, lang)} value={st} selected={form.style === st} onClick={() => set('style', st)} />)}
                      </div>
                      {errors.style && <p className="text-destructive text-sm">{errors.style}</p>}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="pt-4">
            {errors.submit && <p className="text-destructive text-sm text-center mb-3">{errors.submit}</p>}
            <Button onClick={goCreate} disabled={creating} className="w-full h-14 rounded-2xl text-base">
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ marginInlineEnd: '0.5rem' }} />
                  {s.creating}
                </>
              ) : (
                <>
                  {s.create}
                  <Fwd className="w-5 h-5" style={{ marginInlineStart: '0.5rem' }} />
                </>
              )}
            </Button>
            <button onClick={() => navigate('/login')} className="w-full text-center text-sm text-muted-foreground mt-4 py-2">
              {s.have_account}
            </button>
          </div>
        )}
      </div>
      <CreditPurchase
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSuccess={onPurchaseSuccess}
      />
    </div>
  );
}