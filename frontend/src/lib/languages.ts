export interface LanguageOption {
  code: string
  native: string
  english: string
}

// Supported interface languages. `code` matches i18n + locale folder names.
export const LANGUAGES: LanguageOption[] = [
  { code: 'uk', native: 'Українська', english: 'Ukrainian' },
  { code: 'en', native: 'English', english: 'English' },
  { code: 'pl', native: 'Polski', english: 'Polish' },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'it', native: 'Italiano', english: 'Italian' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'de', native: 'Deutsch', english: 'German' },
]

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code)
