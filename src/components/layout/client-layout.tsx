'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState('pt-BR');

  useEffect(() => {
    setLang(i18n.language === 'en' ? 'en' : 'pt-BR');

    // Update the html lang attribute when language changes
    document.documentElement.lang = lang;
  }, [i18n.language, lang]);

  return <>{children}</>;
}
