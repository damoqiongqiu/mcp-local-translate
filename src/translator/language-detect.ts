// ============================================
// Language auto-detection for "source=auto"
// ============================================
//
// Uses franc-min (lightweight, ~200KB) to detect the language
// of input text, then maps ISO 639-3 codes to FLORES-200 codes
// that the NLLB-200 model expects.
//
// franc-min supports 80+ languages. For languages outside its
// coverage, detection falls back to null and the caller should
// surface an error asking the user to specify the source language.

import { franc } from 'franc-min'

/**
 * Map from franc's ISO 639-3 codes to NLLB's FLORES-200 codes.
 *
 * Key: ISO 639-3 three-letter code (franc output)
 * Value: FLORES-200 code (language_Script)
 *
 * Only the most common languages are mapped. For languages with
 * multiple scripts, we pick the most widely used variant.
 */
const ISO_TO_FLORES: Record<string, string> = {
  // Afro-Asiatic
  amh: 'amh_Ethi', // Amharic
  ara: 'arb_Arab', // Arabic (macrolanguage)
  arb: 'arb_Arab', // Arabic (Modern Standard) — franc-min returns arb, not ara
  heb: 'heb_Hebr', // Hebrew
  som: 'som_Latn', // Somali

  // Austroasiatic
  khm: 'khm_Khmr', // Khmer
  vie: 'vie_Latn', // Vietnamese

  // Austronesian
  ind: 'ind_Latn', // Indonesian
  msa: 'ind_Latn', // Malay → Indonesian (closest in NLLB)
  tgl: 'tgl_Latn', // Tagalog

  // Dravidian
  tam: 'tam_Taml', // Tamil
  tel: 'tel_Telu', // Telugu
  kan: 'kan_Knda', // Kannada
  mal: 'mal_Mlym', // Malayalam

  // Indo-European
  ben: 'ben_Beng', // Bengali
  bul: 'bul_Cyrl', // Bulgarian
  cat: 'cat_Latn', // Catalan
  ces: 'ces_Latn', // Czech
  cmn: 'zho_Hans', // Mandarin Chinese → Simplified
  cym: 'cym_Latn', // Welsh
  dan: 'dan_Latn', // Danish
  deu: 'deu_Latn', // German
  ell: 'ell_Grek', // Greek
  eng: 'eng_Latn', // English
  fas: 'pes_Arab', // Persian
  fin: 'fin_Latn', // Finnish
  fra: 'fra_Latn', // French
  guj: 'guj_Gujr', // Gujarati
  hin: 'hin_Deva', // Hindi
  hrv: 'hrv_Latn', // Croatian
  hun: 'hun_Latn', // Hungarian
  ita: 'ita_Latn', // Italian
  lav: 'lvs_Latn', // Latvian
  lit: 'lit_Latn', // Lithuanian
  mar: 'mar_Deva', // Marathi
  nld: 'nld_Latn', // Dutch
  nob: 'nob_Latn', // Norwegian
  nor: 'nob_Latn', // Norwegian (generic → Bokmål)
  pan: 'pan_Guru', // Punjabi
  pol: 'pol_Latn', // Polish
  por: 'por_Latn', // Portuguese
  ron: 'ron_Latn', // Romanian
  rus: 'rus_Cyrl', // Russian
  slk: 'slk_Latn', // Slovak
  slv: 'slv_Latn', // Slovenian
  spa: 'spa_Latn', // Spanish
  srp: 'srp_Cyrl', // Serbian
  swe: 'swe_Latn', // Swedish
  ukr: 'ukr_Cyrl', // Ukrainian
  urd: 'urd_Arab', // Urdu

  // Japonic
  jpn: 'jpn_Jpan', // Japanese

  // Koreanic
  kor: 'kor_Hang', // Korean

  // Niger-Congo
  swa: 'swh_Latn', // Swahili
  yor: 'yor_Latn', // Yoruba
  zul: 'zul_Latn', // Zulu

  // Sino-Tibetan
  mya: 'mya_Mymr', // Burmese

  // Tai-Kadai
  lao: 'lao_Laoo', // Lao
  tha: 'tha_Thai', // Thai

  // Turkic
  aze: 'azj_Latn', // Azerbaijani
  kaz: 'kaz_Cyrl', // Kazakh
  tur: 'tur_Latn', // Turkish
  uzb: 'uzn_Latn', // Uzbek
}

/** franc returns 'und' for undetermined text */
const UNDETERMINED = 'und'

/**
 * Detect the language of the given text.
 *
 * Returns a FLORES-200 language code (e.g. "eng_Latn", "zho_Hans"),
 * or null if the language could not be reliably detected.
 *
 * Minimum text length for reliable detection is ~10 characters.
 * Very short or ambiguous text will return null.
 */
export function detectLanguage(text: string): string | null {
  if (!text || text.trim().length === 0) return null

  // franc-min: pass onlyLanguages for common dev-relevant languages
  // to reduce false positives on code snippets
  const isoCode = franc(text, { minLength: 3 })

  if (isoCode === UNDETERMINED) return null

  const floresCode = ISO_TO_FLORES[isoCode]
  return floresCode ?? null
}
