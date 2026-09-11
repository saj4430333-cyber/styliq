import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { STYLES, HIJABI_STYLE } from '@/lib/styles';
import { useI18n } from '@/lib/i18n-store';
import { styleDisplayName, skinToneDisplayName } from '@/lib/translate';
import CreditPurchase from '@/components/CreditPurchase';

const seasons = ['ربيع', 'صيف', 'خريف', 'شتاء'];

const occasions = ['يومي', 'عمل', 'مناسبة اجتماعية', 'موعد', 'سفر'];
const genders = ['ذكر', 'أنثى'];
const skinTones = ['أبيض', 'فاتح', 'حنطي', 'أسمر', 'غامق'];
const skinToneColors = {
  'أبيض': '#f7e0cf',
  'فاتح': '#f0c8a0',
  'حنطي': '#d9a066',
  'أسمر': '#b87850',
  'غامق': '#6f4530'
};

function Pill({ label, selected, onClick }) {
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

export default function StylingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useI18n();
  const STEPS = [t.sf_step1, t.sf_step2, t.sf_step3, t.sf_step4];
  const [form, setForm] = useState({ height: '', weight: '', skin_tone: '', gender: '', season: '', style: '', occasion: '' });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill) {
      setForm({
        height: prefill.height != null ? String(prefill.height) : '',
        weight: prefill.weight != null ? String(prefill.weight) : '',
        gender: prefill.gender || '',
        skin_tone: prefill.skin_tone || '',
        season: prefill.season || '',
        style: prefill.style || '',
        occasion: prefill.occasion || '',
      });
      return;
    }
    (async () => {
      try {
        const u = await base44.auth.me();
        const d = u?.data || {};
        setForm((p) => ({
          height: d.height != null ? String(d.height) : p.height,
          weight: d.weight != null ? String(d.weight) : p.weight,
          gender: d.gender || p.gender,
          skin_tone: d.skin_tone || p.skin_tone,
          season: d.default_season || p.season,
          style: d.default_style || p.style,
          occasion: p.occasion,
        }));
      } catch (e) {
        /* ignore */
      }
    })();
  }, [location.state]);

  // إعادة الضغط على تبويب الإنشاء يعيد الخطوة للبداية ويمسح الأخطاء
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === '/styling') {
        setStep(0);
        setErrors({});
      }
    };
    window.addEventListener('active-tab-reselected', handler);
    return () => window.removeEventListener('active-tab-reselected', handler);
  }, []);

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const bodyRef = useRef(null);
  const occasionRef = useRef(null);
  const nextBtnRef = useRef(null);

  const select = (key, value, targetRef) => {
    set(key, value);
    if (targetRef?.current) {
      setTimeout(() => targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 90);
    }
  };

  const availableStyles = form.gender === 'أنثى' ? [...STYLES, HIJABI_STYLE] : STYLES;

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.gender) errs.gender = t.sf_e_gender;
      if (!form.height) errs.height = t.sf_e_height;
      if (!form.weight) errs.weight = t.sf_e_weight;
    } else if (s === 1) {
      if (!form.season) errs.season = t.sf_e_season;
      if (!form.occasion) errs.occasion = t.sf_e_occ;
    } else if (s === 2) {
      if (!form.style) errs.style = t.sf_e_style;
    }
    return errs;
  };

  const next = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep((p) => Math.min(p + 1, STEPS.length - 1));
  };
  const back = () => setStep((p) => Math.max(p - 1, 0));

  const handleSubmit = () => {
    const errs = {};
    if (!form.height) errs.height = t.sf_e_height;
    if (!form.weight) errs.weight = t.sf_e_weight;
    if (!form.gender) errs.gender = t.sf_e_gender;
    if (!form.season) errs.season = t.sf_e_season;
    if (!form.style) errs.style = t.sf_e_style;
    if (!form.occasion) errs.occasion = t.sf_e_occ;
    if (Object.keys(errs).length) { setErrors(errs); setStep(0); return; }

    setSubmitting(true);
    setCheckoutError('');

    base44.auth.updateMe({
      height: Number(form.height),
      weight: Number(form.weight),
      gender: form.gender,
      skin_tone: form.skin_tone || null,
      default_season: form.season,
      default_style: form.style,
    }).catch(() => {});

    base44.analytics.track({ eventName: 'styling_submit', properties: { style: form.style, season: form.season } });

    runCreateOrder();
  };

  const runCreateOrder = async () => {
    setSubmitting(true);
    setCheckoutError('');
    try {
      const res = await base44.functions.invoke('create-order', { form });
      const orderId = res.data?.order_id;
      if (!orderId) throw new Error(res.data?.error || 'تعذّر إنشاء الطلب');
      navigate('/results?order_id=' + orderId);
    } catch (err) {
      const status = err?.response?.status || err?.status;
      const code = err?.response?.data?.code;
      if (status === 401 || code === 'auth_required') {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      if (status === 402 || code === 'no_credits') {
        setSubmitting(false);
        setPaywallOpen(true);
        return;
      }
      setCheckoutError(err?.response?.data?.error || err.message || t.sf_e_create);
      setSubmitting(false);
    }
  };

  const onPurchaseSuccess = () => {
    setPaywallOpen(false);
    runCreateOrder();
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="px-5 pt-5">
      {/* Header + progress */}
      <div className="flex items-center gap-3 mb-1">
        {step > 0 ? (
          <button onClick={back} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shrink-0 active:scale-95">
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <span className="w-10 h-10 shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <span className="font-medium text-foreground">{t.sf_step_of} {step + 1} / {STEPS.length}</span>
            <span>· {STEPS[step]}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      </div>

      <div className="py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-7">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">{t.sf_about_t}</h2>
                  <p className="text-muted-foreground text-sm">{t.sf_about_d}</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t.gender}</Label>
                  <div className="flex gap-3">
                    {genders.map((g) => (
                      <Pill
                        key={g}
                        label={t.gender_vals[g]}
                        selected={form.gender === g}
                        onClick={() => {
                          select('gender', g, bodyRef);
                          if (g === 'ذكر' && form.style === HIJABI_STYLE) set('style', '');
                        }}
                      />
                    ))}
                  </div>
                  {errors.gender && <p className="text-destructive text-sm">{errors.gender}</p>}
                </div>
                <div ref={bodyRef} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t.height}</Label>
                    <Input type="number" inputMode="numeric" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="175" className="h-14 rounded-2xl text-base" />
                    {errors.height && <p className="text-destructive text-sm">{errors.height}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t.weight}</Label>
                    <Input type="number" inputMode="numeric" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="70" className="h-14 rounded-2xl text-base" />
                    {errors.weight && <p className="text-destructive text-sm">{errors.weight}</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t.sf_skin}</Label>
                  <div className="flex flex-wrap gap-3">
                    {skinTones.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => select('skin_tone', tone, nextBtnRef)}
                        aria-label={skinToneDisplayName(tone, lang)}
                        className={`w-12 h-12 rounded-full border-2 transition-all active:scale-90 ${
                          form.skin_tone === tone ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                        }`}
                        style={{ backgroundColor: skinToneColors[tone] }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-7">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">{t.sf_oc_t}</h2>
                  <p className="text-muted-foreground text-sm">{t.sf_oc_d}</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t.season}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {seasons.map((s) => <Pill key={s} label={t.season_vals[s]} selected={form.season === s} onClick={() => select('season', s, occasionRef)} />)}
                  </div>
                  {errors.season && <p className="text-destructive text-sm">{errors.season}</p>}
                </div>
                <div ref={occasionRef} className="space-y-3">
                  <Label className="text-sm font-medium">{t.occasion}</Label>
                  <div className="flex flex-wrap gap-3">
                    {occasions.map((o) => <Pill key={o} label={t.occasion_vals[o]} selected={form.occasion === o} onClick={() => select('occasion', o, nextBtnRef)} />)}
                  </div>
                  {errors.occasion && <p className="text-destructive text-sm">{errors.occasion}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">{t.sf_st_t}</h2>
                  <p className="text-muted-foreground text-sm">{t.sf_st_d}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableStyles.map((s) => <Pill key={s} label={styleDisplayName(s, lang)} selected={form.style === s} onClick={() => select('style', s, nextBtnRef)} />)}
                </div>
                {errors.style && <p className="text-destructive text-sm">{errors.style}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-7">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">{t.sf_rv_t}</h2>
                  <p className="text-muted-foreground text-sm">{t.sf_rv_d}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <Row label={t.sf_sum_gender} value={t.gender_vals[form.gender] || form.gender} />
                  <Row label={t.sf_sum_height} value={`${form.height} cm`} />
                  <Row label={t.sf_sum_weight} value={`${form.weight} kg`} />
                  <Row label={t.sf_sum_skin} value={skinToneDisplayName(form.skin_tone, lang) || '—'} />
                  <Row label={t.sf_sum_season} value={t.season_vals[form.season] || form.season} />
                  <Row label={t.sf_sum_occ} value={t.occasion_vals[form.occasion] || form.occasion} />
                  <Row label={t.sf_sum_style} value={styleDisplayName(form.style, lang)} />
                </div>
                <div className="rounded-2xl bg-accent/5 border border-accent/15 p-4 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-accent shrink-0" />
                  <p className="text-sm text-muted-foreground">{t.sf_brand}</p>
                </div>
                {checkoutError && (
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{checkoutError}</div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer action */}
      {step < STEPS.length - 1 ? (
        <Button ref={nextBtnRef} onClick={next} size="lg" className="w-full h-14 rounded-2xl text-base">
          {t.sf_next}
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>
      ) : (
        <Button onClick={handleSubmit} size="lg" disabled={submitting} className="w-full h-14 rounded-2xl text-base">
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              {t.creating}
            </>
          ) : (
            <>
              {t.create}
              <ArrowLeft className="w-5 h-5 mr-2" />
            </>
          )}
        </Button>
      )}

      <CreditPurchase
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSuccess={onPurchaseSuccess}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}