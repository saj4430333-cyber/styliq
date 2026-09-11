import React, { useState } from 'react';
import Logo from '@/components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Send, Loader2, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/i18n-store';
import { getLegal } from '@/lib/i18n-legal';

export default function Contact() {
  const { dir, lang } = useI18n();
  const L = getLegal(lang).contact;
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <button
            onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {getLegal(lang).home}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-accent" /></div>
          <h1 className="font-display text-3xl font-bold">{L.title}</h1>
        </div>
        <p className="text-muted-foreground mb-10">{L.intro}</p>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-accent" />
              <h2 className="font-bold">{L.direct_t}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{L.direct_d}</p>
            <a href="mailto:support@getstyliq.net" className="text-accent font-medium underline">support@getstyliq.net</a>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-accent" />
              <h2 className="font-bold">{L.form_t}</h2>
            </div>
            {sent ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-accent" />
                </div>
                <p className="font-medium mb-1">{L.sent_t}</p>
                <p className="text-sm text-muted-foreground mb-4">{L.sent_d}</p>
                <Button variant="outline" size="sm" onClick={() => setSent(false)}>{L.again}</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">{L.name}</Label>
                  <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={L.name_ph} className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{L.email}</Label>
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{L.message}</Label>
                  <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={L.message_ph} className="rounded-xl min-h-28" required />
                </div>
                <Button type="submit" disabled={sending} className="w-full h-11 rounded-full">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                  {L.send}
                </Button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}