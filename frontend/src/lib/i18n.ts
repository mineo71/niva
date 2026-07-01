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
function syncHead(lng: string) {
  document.documentElement.lang = lng
  const title = i18n.t('meta.title')
  const desc = i18n.t('meta.description')
  if (title && title !== 'meta.title') document.title = title
  if (desc && desc !== 'meta.description') {
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc)
  }
  if (title && title !== 'meta.title') {
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
  }
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lng)
}

syncHead(initialLng)
// resources load async via HttpBackend — re-sync once loaded and on every change
i18n.on('loaded', () => syncHead(i18n.language))
i18n.on('languageChanged', syncHead)

export default i18n
