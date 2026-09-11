import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, UserCircle2, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function UserNav() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const links = [
    { to: '/', icon: Home, label: 'الرئيسية' },
    { to: '/my-styles', icon: Heart, label: 'تنسيقاتي' },
    { to: '/account', icon: UserCircle2, label: 'حسابي' },
  ];

  return (
    <div className="flex items-center gap-1">
      {links.map((l) => (
        <Button key={l.to} variant="ghost" size="sm" onClick={() => navigate(l.to)} className="text-muted-foreground">
          <l.icon className="w-4 h-4 ml-1" />
          <span className="hidden sm:inline">{l.label}</span>
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
        <LogOut className="w-4 h-4 ml-1" />
        <span className="hidden sm:inline">خروج</span>
      </Button>
    </div>
  );
}