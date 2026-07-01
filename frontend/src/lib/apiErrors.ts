const API_ERROR_TRANSLATION_KEYS: Record<string, string> = {
  'Area classified as water, urban development, or barren rock':
    'validation.waterUrbanBarren',
  'Area classified as stable perennial vegetation or dense forest, not cropland':
    'validation.forestPerennial',
  'Field area must be between 0.1 and 10000.0 hectares':
    'validation.fieldAreaRange',
}

type Translator = (key: string, options?: { defaultValue?: string }) => string

export function getApiErrorMessage(error: unknown, t: Translator, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail !== 'string' || !detail.trim()) return fallback

  const translationKey = API_ERROR_TRANSLATION_KEYS[detail]
  if (!translationKey) return detail

  return t(translationKey, { defaultValue: detail })
}
