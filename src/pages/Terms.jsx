import React from 'react';
import Logo from '@/components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n-store';
import { getLegal } from '@/lib/i18n-legal';

export default function Terms() {
  const { dir, lang } = useI18n();
  const L = getLegal(lang);
  const navigate = useNavigate();
  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 pb-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <button
            onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {L.home}
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><FileText className="w-5 h-5 text-accent" /></div>
          <h1 className="font-display text-3xl font-bold">{L.terms.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">{L.terms.updated}</p>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          {L.terms.sections.map((s, i) => (
            <Section key={i} title={s.t}>
              {s.body}{s.link ? <> <Link to="/contact" className="text-accent underline">{s.link}</Link>.</> : null}
            </Section>
          ))}
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-bold text-foreground text-lg mb-2">{title}</h2>
      <p>{children}</p>
    </section>
  );
}