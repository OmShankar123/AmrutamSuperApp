import { useCallback } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';

import { saveLanguage } from './i18n';

export function useLanguage() {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = useCallback(
    async (lang: 'en' | 'hi') => {
      await i18n.changeLanguage(lang);
      saveLanguage(lang);
    },
    [i18n],
  );

  return {
    t,
    currentLanguage: (i18n.language ?? 'en') as 'en' | 'hi',
    changeLanguage,
    isHindi: i18n.language === 'hi',
  };
}
