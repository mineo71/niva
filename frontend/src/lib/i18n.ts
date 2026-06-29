import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import { LANGUAGE_CODES } from './languages'

// restore persisted language (zustand persist key: "niva-ui")
function storedLanguage(): string {
  try {
    const raw = localStorage.getItem('niva-ui')
    const code = raw ? JSON.parse(raw)?.state?.language : null
    return LANGUAGE_CODES.includes(code) ? code : 'uk'
  } catch {
    return 'uk'
  }
}

const initialLng = storedLanguage()

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: initialLng,
    fallbackLng: 'en',
    supportedLngs: LANGUAGE_CODES,
    defaultNS: 'translation',
    ns: ['translation'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

// keep <html lang> in sync
document.documentElement.lang = initialLng
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n
