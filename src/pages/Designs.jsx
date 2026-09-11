import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Shirt, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/PullToRefresh';
import { useI18n } from '@/lib/i18n-store';
import { styleDisplayName, occasionDisplayName, seasonDisplayName } from '@/lib/translate';

export default function Designs() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const o = await base44.entities.StylingOrder.list('-created_date', 50);
      setOrders(o || []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // الضغط مجدداً على تبويب التصاميم يمرّر الصفحة للأعلى
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === '/designs') window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('active-tab-reselected', handler);
    return () => window.removeEventListener('active-tab-reselected', handler);
  }, []);

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const statusLabel = (s) => (s === 'paid' ? t.st_paid : s === 'pending' ? t.st_pending : s === 'failed' ? t.st_failed : s);

  return (
    <PullToRefresh onRefresh={reload} className="px-5 pt-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t.designs_badge}
        </span>
        <h1 className="font-display text-3xl font-bold">{t.designs_title}</h1>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
          <p className="text-muted-foreground text-sm">{t.designs_loading}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
            <Shirt className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">{t.designs_empty_t}</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">{t.designs_empty_d}</p>
          <Button onClick={() => navigate('/styling')} className="h-12 px-7 rounded-2xl">{t.designs_new}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const first = order.outfits?.[0];
            const img = first?.image_mannequin || first?.image_flat || first?.image_url;
            const count = order.outfits?.length || 0;
            return (
              <motion.button
                key={order.id}
                onClick={() => navigate(`/results?order_id=${order.id}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="w-full text-start bg-card border border-border rounded-3xl overflow-hidden flex active:scale-[0.99] transition-transform"
              >
                <div className="w-24 shrink-0 bg-muted">
                  {img ? (
                    <Image src={img} alt={first?.title} className="w-full h-full aspect-[3/4]" fittingType="fill" />
                  ) : (
                    <div className="w-full aspect-[3/4] flex items-center justify-center">
                      <Shirt className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold">{styleDisplayName(order.style, lang)} · {occasionDisplayName(order.occasion, lang)}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${order.payment_status === 'paid' ? 'bg-accent/10 text-accent' : 'bg-secondary text-secondary-foreground'}`}>
                      {statusLabel(order.payment_status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {formatDate(order.created_date)} · {seasonDisplayName(order.season, lang)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count > 0 ? `${count} ${t.designs_outfits}` : t.designs_not_gen}
                  </p>
                </div>
                <div className="flex items-center pr-4 pl-2">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </PullToRefresh>
  );
}