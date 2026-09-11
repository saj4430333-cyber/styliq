import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Check, Heart, Share2, Lightbulb, ShoppingBag, Shirt, Footprints, Gem } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/lib/i18n-store';
import { colorDisplayName } from '@/lib/translate';

const roleIcon = { top: Shirt, bottom: Shirt, shoes: Footprints, accessory: Gem, outerwear: Shirt, dress: Shirt };

export default function OutfitCard({ outfit, index, selected, onSelect, onSave, saved }) {
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const products = outfit.products || [];
  const [view, setView] = React.useState('model');
  const roleLabel = { top: t.oc_role_top, bottom: t.oc_role_bottom, shoes: t.oc_role_shoes, accessory: t.oc_role_accessory, outerwear: t.oc_role_outerwear, dress: t.oc_role_dress };

  const handleShare = async () => {
    const text = `${outfit.title} — ${products.map((p) => `${p.brand} ${p.product_name}`).join('، ')}`;
    if (navigator.share) {
      try { await navigator.share({ title: outfit.title, text }); } catch {}
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(text); toast({ title: t.oc_copied }); } catch {}
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`bg-card border rounded-3xl overflow-hidden flex flex-col transition-all ${
        selected ? 'border-accent ring-2 ring-accent/30 shadow-glow' : 'border-border hover:border-accent/30'
      }`}
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-3">
        <span className="font-display text-sm font-bold leading-none shrink-0 w-9 h-9 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight">{outfit.title}</h3>
          {outfit.description ? <p className="text-muted-foreground text-sm leading-relaxed mt-0.5">{outfit.description}</p> : null}
        </div>
        {selected && (
          <span className="inline-flex items-center gap-1 bg-accent text-white px-2.5 py-1 rounded-full text-xs font-medium shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t.oc_selected}
          </span>
        )}
      </div>

      {/* Image gallery — مبدّل على الموديل / مسطحة داخل الصورة */}
      {(outfit.image_url || outfit.flat_image_url) && (
        <div className="px-5">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted">
            <Image
              src={view === 'flat' && outfit.flat_image_url ? outfit.flat_image_url : outfit.image_url}
              alt={outfit.title}
              className="w-full h-full"
              fittingType="fill"
            />
          </div>
          {(outfit.image_url && outfit.flat_image_url) ? (
            <div className="mt-2.5 flex justify-center gap-1 rounded-full bg-muted/60 p-1 w-fit mx-auto">
              <button
                type="button"
                onClick={() => setView('model')}
                className={`px-4 py-1 rounded-full text-[11px] font-medium transition-all ${
                  view === 'model' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
                }`}
              >{t.oc_model}</button>
              <button
                type="button"
                onClick={() => setView('flat')}
                className={`px-4 py-1 rounded-full text-[11px] font-medium transition-all ${
                  view === 'flat' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'
                }`}
              >{t.oc_flat}</button>
            </div>
          ) : null}
        </div>
      )}

      {/* Products */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <ShoppingBag className="w-3.5 h-3.5" /> {products.some((p) => p.real) ? t.oc_shoppable : t.oc_suggest}
        </div>
        <div className="flex flex-col gap-2">
          {products.map((p, i) => {
            const Icon = roleIcon[p.role] || Shirt;
            const label = roleLabel[p.role];
            const Wrapper = p.product_url ? 'a' : 'div';
            const wrapperProps = p.product_url ? { href: p.product_url, target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <Wrapper key={i} {...wrapperProps} className={`group flex items-center gap-2.5 border rounded-2xl bg-muted/40 px-3 py-2.5 transition-colors ${p.product_url ? 'border-transparent hover:border-accent/40 hover:bg-accent/5' : 'border-border'}`}>
                <span className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-accent" />
                </span>
                <span className="text-[10px] font-bold text-accent shrink-0 uppercase tracking-wide">{p.brand}</span>
                <span className="text-xs font-medium leading-snug line-clamp-1 flex-1">{p.product_name}</span>
                {p.color && <span className="text-[10px] text-muted-foreground/80 shrink-0">{colorDisplayName(p.color, lang)}</span>}
                {p.product_url ? (
                  <span className="text-[10px] text-accent font-medium shrink-0 group-hover:underline">{t.oc_buy} ↗</span>
                ) : label ? (
                  <span className="text-[9px] text-muted-foreground/70 shrink-0">{label}</span>
                ) : null}
              </Wrapper>
            );
          })}
        </div>
      </div>

      {/* Why */}
      {outfit.reason && (
        <div className="mx-5 mt-4 mb-2 p-3.5 rounded-2xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-2 text-xs text-accent mb-1.5 font-medium">
            <Lightbulb className="w-3.5 h-3.5" /> {t.oc_why}
          </div>
          <p className="text-sm leading-relaxed">{outfit.reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-5 pt-3 flex flex-col flex-1">
        <div className="mt-auto grid grid-cols-2 gap-2 mb-3">
          <Button type="button" variant="outline" onClick={() => onSave(index)} className="h-12 rounded-2xl">
            <Heart className={`w-4 h-4 ml-2 ${saved ? 'fill-accent text-accent' : ''}`} />
            {saved ? t.oc_saved : t.oc_save}
          </Button>
          <Button type="button" variant="outline" onClick={handleShare} className="h-12 rounded-2xl">
            <Share2 className="w-4 h-4 ml-2" /> {t.oc_share}
          </Button>
        </div>
        <Button
          onClick={() => onSelect(index)}
          className={`w-full h-12 rounded-2xl text-base ${selected ? 'bg-accent text-white hover:bg-accent/90' : ''}`}
        >
          {selected ? (
            <><Check className="w-4 h-4 ml-2" /> {t.oc_chosen}</>
          ) : (
            t.oc_pick
          )}
        </Button>
      </div>
    </motion.div>
  );
}