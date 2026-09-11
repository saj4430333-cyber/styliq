import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-store';
import { getLegal } from '@/lib/i18n-legal';

export default function PageNotFound({}) {
    const { dir, lang } = useI18n();
    const L = getLegal(lang).pnf;
    const location = useLocation();
    const navigate = useNavigate();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div dir={dir} className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    {/* الشعار */}
                    <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-accent" strokeWidth={2.2} />
                    </div>

                    {/* رمز 404 */}
                    <div className="space-y-2">
                        <h1 className="font-display text-7xl font-bold text-accent/25 leading-none">404</h1>
                        <div className="h-0.5 w-16 bg-border mx-auto"></div>
                    </div>

                    {/* الرسالة */}
                    <div className="space-y-3">
                        <h2 className="font-display text-2xl font-bold text-foreground">
                            {L.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {L.desc} <span className="font-medium text-foreground">«{pageName || '/'}»</span> {L.desc2}
                        </p>
                    </div>

                    {/* ملاحظة المشرف */}
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-2 p-4 bg-accent/5 rounded-2xl border border-accent/15 text-right">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">{L.admin_t}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {L.admin_d}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* زر العودة */}
                    <div className="pt-2">
                        <Button onClick={() => navigate('/')} size="lg" className="rounded-2xl px-6">
                            <Home className="w-4 h-4 ml-2" />
                            {L.home}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}