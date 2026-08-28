import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import i18n from 'i18next';

import { appStorage } from '@/core/storage';

import en from './translations/en.json';
import hi from './translations/hi.json';

const LANGUAGE_KEY = 'app_language';

export function getSavedLanguage(): string | null {
  return appStorage.getString(LANGUAGE_KEY) ?? null;
}

export function saveLanguage(lang: string): void {
  appStorage.set(LANGUAGE_KEY, lang);
}

export async function initI18n(): Promise<void> {
  const savedLang = getSavedLanguage();
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
  const lng = savedLang ?? (deviceLang === 'hi' ? 'hi' : 'en');

  if (i18n.isInitialized) return;

  await i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, hi: { translation: hi } },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export { i18n };
