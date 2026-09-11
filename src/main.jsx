import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { getLang, applyLang } from '@/lib/language';
applyLang(getLang());

// مزامنة الوضع الداكن مع تفضيلات النظام
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
const syncTheme = (e) => document.documentElement.classList.toggle('dark', e.matches);
syncTheme(colorScheme);
colorScheme.addEventListener?.('change', syncTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)