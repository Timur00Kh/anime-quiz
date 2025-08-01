import { useEffect, useState } from 'react';

export type Language = 'en' | 'ru';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('preferred_language', newLang);
  };

  return { language, changeLanguage };
} 