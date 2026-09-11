import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Ruler, Save, ShoppingBag, Check, CreditCard, LogOut, Shield, FileText, MessageSquare, ArrowRight, RefreshCw, Globe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n-store';
import { LANGUAGES } from '@/lib/i18n';
import { styleDisplayName, occasionDisplayName } from '@/lib/translate';

const seasons = ['ربيع', 'صيف', 'خريف', 'شتاء'];
const styles = ['كاجوال', 'رسمي', 'رياضي', 'بوهيمي', 'كلاسيكي', 'عصري', 'هيب هوب', 'ستريت', 'مينيمال', 'فاخر', 'فينتاج', 'روك'];
const genders = ['ذكر', 'أنثى'];

function Pill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl border text-sm font-medium transition-all active:scale-95 ${
        selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
      }`}
    >
      {label}
    </button>
  );
}

const DEL = {
  ar: { btn: 'حذف الحساب', title: 'حذف الحساب؟', desc: 'سيتم حذف حسابك وكل بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.', confirm: 'حذف نهائي', deleting: 'جارٍ الحذف...' },
  en: { btn: 'Delete account', title: 'Delete account?', desc: 'Your account and all your data will be permanently removed. This cannot be undone.', confirm: 'Delete permanently', deleting: 'Deleting...' },
  fr: { btn: 'Supprimer le compte', title: 'Supprimer le compte ?', desc: 'Votre compte et toutes vos données seront définitivement supprimés. Action irréversible.', confirm: 'Supprimer définitivement', deleting: 'Suppression...' },
  es: { btn: 'Eliminar cuenta', title: '¿Eliminar cuenta?', desc: 'Tu cuenta y todos tus datos se eliminarán de forma permanente. No se puede deshacer.', confirm: 'Eliminar permanentemente', deleting: 'Eliminando...' },
  de: { btn: 'Konto löschen', title: 'Konto löschen?', desc: 'Dein Konto und alle Daten werden dauerhaft gelöscht. Dies kann nicht rückgängig gemacht werden.', confirm: 'Dauerhaft löschen', deleting: 'Wird gelöscht...' },
  it: { btn: 'Elimina account', title: "Eliminare l'account?", desc: 'Il tuo account e tutti i tuoi dati saranno rimossi definitivamente. Operazione irreversibile.', confirm: 'Elimina definitivamente', deleting: 'Eliminazione...' },
  pt: { btn: 'Excluir conta', title: 'Excluir conta?', desc: 'Sua conta e todos os seus dados serão removidos permanentemente. Isso não pode ser desfeito.', confirm: 'Excluir permanentemente', deleting: 'Excluindo...' },
  tr: { btn: 'Hesabı sil', title: 'Hesabı sil?', desc: 'Hesabın ve tüm verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz.', confirm: 'Kalıcı olarak sil', deleting: 'Siliniyor...' },
  ru: { btn: 'Удалить аккаунт', title: 'Удалить аккаунт?', desc: 'Ваш аккаунт и все данные будут удалены навсегда. Это действие необратимо.', confirm: 'Удалить навсегда', deleting: 'Удаление...' },
  id: { btn: 'Hapus akun', title: 'Hapus akun?', desc: 'Akun dan semua data Anda akan dihapus permanen. Tidak dapat dibatalkan.', confirm: 'Hapus permanen', deleting: 'Menghapus...' },
};

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, dir, lang, setLang: changeLang } = useI18n();
  const [profile, setProfile] = useState({ height: '', weight: '', gender: '', default_season: '', default_style: '' });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const d = u?.data || {};
        setProfile({
          height: d.height != null ? String(d.height) : '',
          weight: d.weight != null ? String(d.weight) : '',
          gender: d.gender || '',
          default_season: d.default_season || '',
          default_style: d.default_style || '',
        });
        setLastUpdated(d.updated_date || u?.updated_date || null);
        const ords = await base44.entities.StylingOrder.list('-created_date', 50);
        setOrders(ords || []);
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // الضغط مجدداً على تبويب الحساب يمرّر الصفحة للأعلى
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === '/account') window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('active-tab-reselected', handler);
    return () => window.removeEventListener('active-tab-reselected', handler);
  }, []);

  const set = (k, v) => { setProfile((p) => ({ ...p, [k]: v })); setSaved(false); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        gender: profile.gender || null,
        default_season: profile.default_season || null,
        default_style: profile.default_style || null,
      });
      setSaved(true);
      setLastUpdated(new Date().toISOString());
    } catch (e) {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const locale = lang === 'ar' ? 'ar-EG' : lang;
  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const statusLabel = { paid: t.st_paid, pending: t.st_pending, failed: t.st_failed };

  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const dl = DEL[lang] || DEL.en;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke('delete-account', {});
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="px-5 pt-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-1">{t.acc_title}</h1>
        <p className="text-muted-foreground text-sm truncate">{user?.email}</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Profile */}
          <section className="bg-card border border-border rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Ruler className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-bold text-base">{t.acc_prof_t}</h2>
                <p className="text-xs text-muted-foreground">{t.acc_prof_d}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t.height}</Label>
                <Input type="number" inputMode="numeric" value={profile.height} onChange={(e) => set('height', e.target.value)} placeholder={dir === 'rtl' ? '١٧٥' : '175'} className="h-12 rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t.weight}</Label>
                <Input type="number" inputMode="numeric" value={profile.weight} onChange={(e) => set('weight', e.target.value)} placeholder={dir === 'rtl' ? '٧٠' : '70'} className="h-12 rounded-2xl" />
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <Label className="text-sm font-medium">{t.gender}</Label>
              <div className="flex gap-2">
                {genders.map((g) => <Pill key={g} label={t.gender_vals[g] || g} selected={profile.gender === g} onClick={() => set('gender', g)} />)}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <Label className="text-sm font-medium">{t.season}</Label>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => <Pill key={s} label={t.season_vals[s] || s} selected={profile.default_season === s} onClick={() => set('default_season', s)} />)}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <Label className="text-sm font-medium">{t.style}</Label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => <Pill key={s} label={styleDisplayName(s, lang)} selected={profile.default_style === s} onClick={() => set('default_style', s)} />)}
              </div>
            </div>

            <Button onClick={saveProfile} disabled={saving} className="w-full h-12 rounded-2xl">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : saved ? <Check className="w-4 h-4 ml-2" /> : <Save className="w-4 h-4 ml-2" />}
              {saved ? t.acc_saved : t.acc_save}
            </Button>

            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center mt-3">
                <RefreshCw className="w-3 h-3" />
                {t.acc_updated}: {formatDate(lastUpdated)}
              </div>
            )}
          </section>

          {/* Purchases */}
          <section className="bg-card border border-border rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-bold text-base">{t.acc_pur_t}</h2>
                <p className="text-xs text-muted-foreground">{t.acc_pur_d}</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">{t.acc_pur_empty}</p>
                <Button variant="outline" onClick={() => navigate('/styling')} className="rounded-2xl">{t.acc_new}</Button>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {orders.map((o) => (
                  <div key={o.id} className="min-w-[200px] shrink-0 border border-border rounded-2xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-sm leading-tight">{styleDisplayName(o.style, lang)} · {occasionDisplayName(o.occasion, lang)}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${o.payment_status === 'paid' ? 'bg-accent/10 text-accent' : 'bg-secondary text-secondary-foreground'}`}>
                        {statusLabel[o.payment_status] || o.payment_status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3" />
                      {formatDate(o.created_date)} · {o.outfits?.length || 0} {t.home_outfits}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/results?order_id=${o.id}`)} className="rounded-xl w-full mt-1">
                      {t.acc_view}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Language */}
          <section className="bg-card border border-border rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-bold text-base">{t.acc_lang_t}</h2>
                <p className="text-xs text-muted-foreground">{t.acc_lang_d}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
                    lang === l.code ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
                  }`}
                >
                  <span className={dir === 'rtl' ? 'text-right min-w-0' : 'text-left min-w-0'}>
                    <span className="block font-semibold text-sm truncate">{l.name}</span>
                    <span className={`text-xs truncate ${lang === l.code ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{l.native}</span>
                  </span>
                  {lang === l.code && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </section>

          {/* Links */}
          <div className="bg-card border border-border rounded-3xl divide-y divide-border overflow-hidden">
            <button onClick={() => navigate('/privacy')} className="w-full flex items-center gap-3 p-4 active:bg-accent/5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><Shield className="w-4 h-4 text-accent" /></div>
              <span className={`text-sm font-medium flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.acc_privacy}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => navigate('/terms')} className="w-full flex items-center gap-3 p-4 active:bg-accent/5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><FileText className="w-4 h-4 text-accent" /></div>
              <span className={`text-sm font-medium flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.acc_terms}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => navigate('/contact')} className="w-full flex items-center gap-3 p-4 active:bg-accent/5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-accent" /></div>
              <span className={`text-sm font-medium flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.acc_contact}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Logout */}
          <Button variant="outline" onClick={() => setShowLogout(true)} className="w-full h-12 rounded-2xl text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4 ml-2" />
            {t.acc_logout}
          </Button>

          {/* Delete account */}
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            disabled={deleting}
            className="w-full text-sm text-muted-foreground/70 underline underline-offset-4 active:text-destructive py-2 disabled:opacity-50"
          >
            {dl.btn}
          </button>

          <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
            <AlertDialogContent dir={dir} className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-xl text-center">{t.acc_logout_t}</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  {t.acc_logout_d}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                <AlertDialogAction
                  onClick={() => navigate('/register?returnTo=%2F')}
                  className="h-12 rounded-2xl bg-primary text-primary-foreground"
                >
                  {t.acc_register}
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="h-12 rounded-2xl bg-transparent border border-border text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  {t.acc_logout}
                </AlertDialogAction>
                <AlertDialogCancel className="mt-1 h-11 rounded-2xl">{t.acc_cancel}</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
            <AlertDialogContent dir={dir} className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-xl text-center text-destructive">{dl.title}</AlertDialogTitle>
                <AlertDialogDescription className="text-center">{dl.desc}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                <Button onClick={handleDelete} disabled={deleting} className="h-12 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Trash2 className="w-4 h-4 ml-2" />}
                  {deleting ? dl.deleting : dl.confirm}
                </Button>
                <AlertDialogCancel className="mt-1 h-11 rounded-2xl" disabled={deleting}>{t.acc_cancel}</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}