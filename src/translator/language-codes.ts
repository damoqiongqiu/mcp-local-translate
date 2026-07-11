// ============================================
// NLLB-200 (FLORES-200) Language Codes
// ============================================
//
// The NLLB-200 model supports 200+ languages using FLORES-200 codes.
// This module provides human-readable names for each code, plus a reverse
// lookup for fuzzy matching (e.g. "Chinese" → "zho_Hans").
//
// Reference: https://github.com/facebookresearch/flores/blob/main/flores200/README.md

export interface LanguageEntry {
  code: string
  name: string
  family: string
}

/**
 * All 200+ FLORES-200 language codes supported by NLLB-200.
 * Ordered alphabetically by language name.
 */
const LANGUAGES: readonly LanguageEntry[] = [
  { code: 'ace_Arab', name: 'Acehnese (Arabic)', family: 'Austronesian' },
  { code: 'ace_Latn', name: 'Acehnese (Latin)', family: 'Austronesian' },
  { code: 'acm_Arab', name: 'Mesopotamian Arabic', family: 'Afro-Asiatic' },
  { code: 'acq_Arab', name: "Ta'izzi-Adeni Arabic", family: 'Afro-Asiatic' },
  { code: 'aeb_Arab', name: 'Tunisian Arabic', family: 'Afro-Asiatic' },
  { code: 'afr_Latn', name: 'Afrikaans', family: 'Indo-European' },
  { code: 'ajp_Arab', name: 'South Levantine Arabic', family: 'Afro-Asiatic' },
  { code: 'aka_Latn', name: 'Akan', family: 'Niger-Congo' },
  { code: 'als_Latn', name: 'Tosk Albanian', family: 'Indo-European' },
  { code: 'amh_Ethi', name: 'Amharic', family: 'Afro-Asiatic' },
  { code: 'apc_Arab', name: 'North Levantine Arabic', family: 'Afro-Asiatic' },
  { code: 'arb_Arab', name: 'Modern Standard Arabic', family: 'Afro-Asiatic' },
  { code: 'arb_Latn', name: 'Modern Standard Arabic (Latin)', family: 'Afro-Asiatic' },
  { code: 'ars_Arab', name: 'Najdi Arabic', family: 'Afro-Asiatic' },
  { code: 'ary_Arab', name: 'Moroccan Arabic', family: 'Afro-Asiatic' },
  { code: 'arz_Arab', name: 'Egyptian Arabic', family: 'Afro-Asiatic' },
  { code: 'asm_Beng', name: 'Assamese', family: 'Indo-European' },
  { code: 'ast_Latn', name: 'Asturian', family: 'Indo-European' },
  { code: 'awa_Deva', name: 'Awadhi', family: 'Indo-European' },
  { code: 'ayr_Latn', name: 'Central Aymara', family: 'Aymaran' },
  { code: 'azb_Arab', name: 'South Azerbaijani', family: 'Turkic' },
  { code: 'azj_Latn', name: 'North Azerbaijani', family: 'Turkic' },
  { code: 'bak_Cyrl', name: 'Bashkir', family: 'Turkic' },
  { code: 'bam_Latn', name: 'Bambara', family: 'Niger-Congo' },
  { code: 'ban_Latn', name: 'Balinese', family: 'Austronesian' },
  { code: 'bel_Cyrl', name: 'Belarusian', family: 'Indo-European' },
  { code: 'bem_Latn', name: 'Bemba', family: 'Niger-Congo' },
  { code: 'ben_Beng', name: 'Bengali', family: 'Indo-European' },
  { code: 'bho_Deva', name: 'Bhojpuri', family: 'Indo-European' },
  { code: 'bjn_Arab', name: 'Banjar (Arabic)', family: 'Austronesian' },
  { code: 'bjn_Latn', name: 'Banjar (Latin)', family: 'Austronesian' },
  { code: 'bod_Tibt', name: 'Standard Tibetan', family: 'Sino-Tibetan' },
  { code: 'bos_Latn', name: 'Bosnian', family: 'Indo-European' },
  { code: 'bug_Latn', name: 'Buginese', family: 'Austronesian' },
  { code: 'bul_Cyrl', name: 'Bulgarian', family: 'Indo-European' },
  { code: 'cat_Latn', name: 'Catalan', family: 'Indo-European' },
  { code: 'ceb_Latn', name: 'Cebuano', family: 'Austronesian' },
  { code: 'ces_Latn', name: 'Czech', family: 'Indo-European' },
  { code: 'cjk_Latn', name: 'Chokwe', family: 'Niger-Congo' },
  { code: 'ckb_Arab', name: 'Central Kurdish', family: 'Indo-European' },
  { code: 'crh_Latn', name: 'Crimean Tatar', family: 'Turkic' },
  { code: 'cym_Latn', name: 'Welsh', family: 'Indo-European' },
  { code: 'dan_Latn', name: 'Danish', family: 'Indo-European' },
  { code: 'deu_Latn', name: 'German', family: 'Indo-European' },
  { code: 'dik_Latn', name: 'Southwestern Dinka', family: 'Nilo-Saharan' },
  { code: 'dyu_Latn', name: 'Dyula', family: 'Niger-Congo' },
  { code: 'dzo_Tibt', name: 'Dzongkha', family: 'Sino-Tibetan' },
  { code: 'ell_Grek', name: 'Greek', family: 'Indo-European' },
  { code: 'eng_Latn', name: 'English', family: 'Indo-European' },
  { code: 'epo_Latn', name: 'Esperanto', family: 'Constructed' },
  { code: 'est_Latn', name: 'Estonian', family: 'Uralic' },
  { code: 'eus_Latn', name: 'Basque', family: 'Language isolate' },
  { code: 'ewe_Latn', name: 'Ewe', family: 'Niger-Congo' },
  { code: 'fao_Latn', name: 'Faroese', family: 'Indo-European' },
  { code: 'fij_Latn', name: 'Fijian', family: 'Austronesian' },
  { code: 'fin_Latn', name: 'Finnish', family: 'Uralic' },
  { code: 'fon_Latn', name: 'Fon', family: 'Niger-Congo' },
  { code: 'fra_Latn', name: 'French', family: 'Indo-European' },
  { code: 'fur_Latn', name: 'Friulian', family: 'Indo-European' },
  { code: 'fuv_Latn', name: 'Nigerian Fulfulde', family: 'Niger-Congo' },
  { code: 'gaz_Latn', name: 'West Central Oromo', family: 'Afro-Asiatic' },
  { code: 'gla_Latn', name: 'Scottish Gaelic', family: 'Indo-European' },
  { code: 'gle_Latn', name: 'Irish', family: 'Indo-European' },
  { code: 'glg_Latn', name: 'Galician', family: 'Indo-European' },
  { code: 'grn_Latn', name: 'Guarani', family: 'Tupian' },
  { code: 'guj_Gujr', name: 'Gujarati', family: 'Indo-European' },
  { code: 'hat_Latn', name: 'Haitian Creole', family: 'Creole' },
  { code: 'hau_Latn', name: 'Hausa', family: 'Afro-Asiatic' },
  { code: 'heb_Hebr', name: 'Hebrew', family: 'Afro-Asiatic' },
  { code: 'hin_Deva', name: 'Hindi', family: 'Indo-European' },
  { code: 'hne_Deva', name: 'Chhattisgarhi', family: 'Indo-European' },
  { code: 'hrv_Latn', name: 'Croatian', family: 'Indo-European' },
  { code: 'hun_Latn', name: 'Hungarian', family: 'Uralic' },
  { code: 'hye_Armn', name: 'Armenian', family: 'Indo-European' },
  { code: 'ibo_Latn', name: 'Igbo', family: 'Niger-Congo' },
  { code: 'ilo_Latn', name: 'Ilocano', family: 'Austronesian' },
  { code: 'ind_Latn', name: 'Indonesian', family: 'Austronesian' },
  { code: 'isl_Latn', name: 'Icelandic', family: 'Indo-European' },
  { code: 'ita_Latn', name: 'Italian', family: 'Indo-European' },
  { code: 'jav_Latn', name: 'Javanese', family: 'Austronesian' },
  { code: 'jpn_Jpan', name: 'Japanese', family: 'Japonic' },
  { code: 'kab_Latn', name: 'Kabyle', family: 'Afro-Asiatic' },
  { code: 'kac_Latn', name: 'Jingpho', family: 'Sino-Tibetan' },
  { code: 'kam_Latn', name: 'Kamba', family: 'Niger-Congo' },
  { code: 'kan_Knda', name: 'Kannada', family: 'Dravidian' },
  { code: 'kas_Arab', name: 'Kashmiri (Arabic)', family: 'Indo-European' },
  { code: 'kas_Deva', name: 'Kashmiri (Devanagari)', family: 'Indo-European' },
  { code: 'kat_Geor', name: 'Georgian', family: 'Kartvelian' },
  { code: 'kaz_Cyrl', name: 'Kazakh', family: 'Turkic' },
  { code: 'kbp_Latn', name: 'Kabiyè', family: 'Niger-Congo' },
  { code: 'kea_Latn', name: 'Kabuverdianu', family: 'Creole' },
  { code: 'khk_Cyrl', name: 'Halh Mongolian', family: 'Mongolic' },
  { code: 'khm_Khmr', name: 'Khmer', family: 'Austroasiatic' },
  { code: 'kik_Latn', name: 'Kikuyu', family: 'Niger-Congo' },
  { code: 'kin_Latn', name: 'Kinyarwanda', family: 'Niger-Congo' },
  { code: 'kir_Cyrl', name: 'Kyrgyz', family: 'Turkic' },
  { code: 'kmb_Latn', name: 'Kimbundu', family: 'Niger-Congo' },
  { code: 'kmr_Latn', name: 'Northern Kurdish', family: 'Indo-European' },
  { code: 'knc_Arab', name: 'Central Kanuri (Arabic)', family: 'Nilo-Saharan' },
  { code: 'knc_Latn', name: 'Central Kanuri (Latin)', family: 'Nilo-Saharan' },
  { code: 'kon_Latn', name: 'Kikongo', family: 'Niger-Congo' },
  { code: 'kor_Hang', name: 'Korean', family: 'Koreanic' },
  { code: 'lao_Laoo', name: 'Lao', family: 'Tai-Kadai' },
  { code: 'lij_Latn', name: 'Ligurian', family: 'Indo-European' },
  { code: 'lim_Latn', name: 'Limburgish', family: 'Indo-European' },
  { code: 'lin_Latn', name: 'Lingala', family: 'Niger-Congo' },
  { code: 'lit_Latn', name: 'Lithuanian', family: 'Indo-European' },
  { code: 'lmo_Latn', name: 'Lombard', family: 'Indo-European' },
  { code: 'ltg_Latn', name: 'Latgalian', family: 'Indo-European' },
  { code: 'ltz_Latn', name: 'Luxembourgish', family: 'Indo-European' },
  { code: 'lua_Latn', name: 'Luba-Kasai', family: 'Niger-Congo' },
  { code: 'lug_Latn', name: 'Ganda', family: 'Niger-Congo' },
  { code: 'luo_Latn', name: 'Luo', family: 'Nilo-Saharan' },
  { code: 'lus_Latn', name: 'Mizo', family: 'Sino-Tibetan' },
  { code: 'lvs_Latn', name: 'Standard Latvian', family: 'Indo-European' },
  { code: 'mag_Deva', name: 'Magahi', family: 'Indo-European' },
  { code: 'mai_Deva', name: 'Maithili', family: 'Indo-European' },
  { code: 'mal_Mlym', name: 'Malayalam', family: 'Dravidian' },
  { code: 'mar_Deva', name: 'Marathi', family: 'Indo-European' },
  { code: 'min_Arab', name: 'Minangkabau (Arabic)', family: 'Austronesian' },
  { code: 'min_Latn', name: 'Minangkabau (Latin)', family: 'Austronesian' },
  { code: 'mkd_Cyrl', name: 'Macedonian', family: 'Indo-European' },
  { code: 'mlt_Latn', name: 'Maltese', family: 'Afro-Asiatic' },
  { code: 'mni_Beng', name: 'Meitei (Bengali)', family: 'Sino-Tibetan' },
  { code: 'mos_Latn', name: 'Mossi', family: 'Niger-Congo' },
  { code: 'mri_Latn', name: 'Maori', family: 'Austronesian' },
  { code: 'mya_Mymr', name: 'Burmese', family: 'Sino-Tibetan' },
  { code: 'nld_Latn', name: 'Dutch', family: 'Indo-European' },
  { code: 'nno_Latn', name: 'Norwegian Nynorsk', family: 'Indo-European' },
  { code: 'nob_Latn', name: 'Norwegian Bokmål', family: 'Indo-European' },
  { code: 'npi_Deva', name: 'Nepali', family: 'Indo-European' },
  { code: 'nso_Latn', name: 'Northern Sotho', family: 'Niger-Congo' },
  { code: 'nus_Latn', name: 'Nuer', family: 'Nilo-Saharan' },
  { code: 'nya_Latn', name: 'Chichewa', family: 'Niger-Congo' },
  { code: 'oci_Latn', name: 'Occitan', family: 'Indo-European' },
  { code: 'ory_Orya', name: 'Odia', family: 'Indo-European' },
  { code: 'pag_Latn', name: 'Pangasinan', family: 'Austronesian' },
  { code: 'pan_Guru', name: 'Punjabi', family: 'Indo-European' },
  { code: 'pap_Latn', name: 'Papiamento', family: 'Creole' },
  { code: 'pbt_Arab', name: 'Southern Pashto', family: 'Indo-European' },
  { code: 'pes_Arab', name: 'Persian', family: 'Indo-European' },
  { code: 'plt_Latn', name: 'Plateau Malagasy', family: 'Austronesian' },
  { code: 'pol_Latn', name: 'Polish', family: 'Indo-European' },
  { code: 'por_Latn', name: 'Portuguese', family: 'Indo-European' },
  { code: 'prs_Arab', name: 'Dari', family: 'Indo-European' },
  { code: 'quy_Latn', name: 'Ayacucho Quechua', family: 'Quechuan' },
  { code: 'ron_Latn', name: 'Romanian', family: 'Indo-European' },
  { code: 'run_Latn', name: 'Rundi', family: 'Niger-Congo' },
  { code: 'rus_Cyrl', name: 'Russian', family: 'Indo-European' },
  { code: 'sag_Latn', name: 'Sango', family: 'Creole' },
  { code: 'san_Deva', name: 'Sanskrit', family: 'Indo-European' },
  { code: 'sat_Olck', name: 'Santali', family: 'Austroasiatic' },
  { code: 'scn_Latn', name: 'Sicilian', family: 'Indo-European' },
  { code: 'shn_Mymr', name: 'Shan', family: 'Tai-Kadai' },
  { code: 'sin_Sinh', name: 'Sinhala', family: 'Indo-European' },
  { code: 'slk_Latn', name: 'Slovak', family: 'Indo-European' },
  { code: 'slv_Latn', name: 'Slovenian', family: 'Indo-European' },
  { code: 'smo_Latn', name: 'Samoan', family: 'Austronesian' },
  { code: 'sna_Latn', name: 'Shona', family: 'Niger-Congo' },
  { code: 'snd_Arab', name: 'Sindhi', family: 'Indo-European' },
  { code: 'som_Latn', name: 'Somali', family: 'Afro-Asiatic' },
  { code: 'sot_Latn', name: 'Southern Sotho', family: 'Niger-Congo' },
  { code: 'spa_Latn', name: 'Spanish', family: 'Indo-European' },
  { code: 'srd_Latn', name: 'Sardinian', family: 'Indo-European' },
  { code: 'srp_Cyrl', name: 'Serbian', family: 'Indo-European' },
  { code: 'ssw_Latn', name: 'Swati', family: 'Niger-Congo' },
  { code: 'sun_Latn', name: 'Sundanese', family: 'Austronesian' },
  { code: 'swe_Latn', name: 'Swedish', family: 'Indo-European' },
  { code: 'swh_Latn', name: 'Swahili', family: 'Niger-Congo' },
  { code: 'szl_Latn', name: 'Silesian', family: 'Indo-European' },
  { code: 'tam_Taml', name: 'Tamil', family: 'Dravidian' },
  { code: 'taq_Latn', name: 'Tamasheq (Latin)', family: 'Afro-Asiatic' },
  { code: 'taq_Tfng', name: 'Tamasheq (Tifinagh)', family: 'Afro-Asiatic' },
  { code: 'tat_Cyrl', name: 'Tatar', family: 'Turkic' },
  { code: 'tel_Telu', name: 'Telugu', family: 'Dravidian' },
  { code: 'tgk_Cyrl', name: 'Tajik', family: 'Indo-European' },
  { code: 'tgl_Latn', name: 'Tagalog', family: 'Austronesian' },
  { code: 'tha_Thai', name: 'Thai', family: 'Tai-Kadai' },
  { code: 'tir_Ethi', name: 'Tigrinya', family: 'Afro-Asiatic' },
  { code: 'tpi_Latn', name: 'Tok Pisin', family: 'Creole' },
  { code: 'tsn_Latn', name: 'Tswana', family: 'Niger-Congo' },
  { code: 'tso_Latn', name: 'Tsonga', family: 'Niger-Congo' },
  { code: 'tuk_Latn', name: 'Turkmen', family: 'Turkic' },
  { code: 'tum_Latn', name: 'Tumbuka', family: 'Niger-Congo' },
  { code: 'tur_Latn', name: 'Turkish', family: 'Turkic' },
  { code: 'twi_Latn', name: 'Twi', family: 'Niger-Congo' },
  { code: 'tzm_Tfng', name: 'Central Atlas Tamazight', family: 'Afro-Asiatic' },
  { code: 'uig_Arab', name: 'Uyghur', family: 'Turkic' },
  { code: 'ukr_Cyrl', name: 'Ukrainian', family: 'Indo-European' },
  { code: 'umb_Latn', name: 'Umbundu', family: 'Niger-Congo' },
  { code: 'urd_Arab', name: 'Urdu', family: 'Indo-European' },
  { code: 'uzn_Latn', name: 'Northern Uzbek', family: 'Turkic' },
  { code: 'vec_Latn', name: 'Venetian', family: 'Indo-European' },
  { code: 'vie_Latn', name: 'Vietnamese', family: 'Austroasiatic' },
  { code: 'war_Latn', name: 'Waray', family: 'Austronesian' },
  { code: 'wol_Latn', name: 'Wolof', family: 'Niger-Congo' },
  { code: 'xho_Latn', name: 'Xhosa', family: 'Niger-Congo' },
  { code: 'ydd_Hebr', name: 'Eastern Yiddish', family: 'Indo-European' },
  { code: 'yor_Latn', name: 'Yoruba', family: 'Niger-Congo' },
  { code: 'yue_Hant', name: 'Yue Chinese (Cantonese)', family: 'Sino-Tibetan' },
  { code: 'zho_Hans', name: 'Chinese (Simplified)', family: 'Sino-Tibetan' },
  { code: 'zho_Hant', name: 'Chinese (Traditional)', family: 'Sino-Tibetan' },
  { code: 'zsm_Latn', name: 'Standard Malay', family: 'Austronesian' },
  { code: 'zul_Latn', name: 'Zulu', family: 'Niger-Congo' },
]

/**
 * Look up a language by its FLORES-200 code.
 * Returns undefined if not found.
 */
export function getLanguageByCode(code: string): LanguageEntry | undefined {
  const normalized = code.trim()
  return LANGUAGES.find((l) => l.code === normalized)
}

/**
 * Fuzzy lookup: match a human-readable name (case-insensitive, partial match).
 * Returns an array of candidates. If exactly one is found, returns that one.
 */
export function searchLanguage(query: string): LanguageEntry[] {
  const lower = query.toLowerCase().trim()
  return LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(lower) ||
      l.code.toLowerCase().includes(lower) ||
      l.family.toLowerCase().includes(lower)
  )
}

/**
 * Smart language code resolver:
 * 1. If input is an exact FLORES-200 code → return it
 * 2. If input is a common alias (e.g. "zh", "ja", "en") → map to FLORES-200
 * 3. If input is a language name → fuzzy match
 *
 * Returns the FLORES-200 code or undefined.
 */
export function resolveLanguageCode(input: string): string | undefined {
  const trimmed = input.trim()

  // 1. Exact match
  const exact = getLanguageByCode(trimmed)
  if (exact) return exact.code

  // 2. Common alias mapping (ISO 639-1/2, BCP-47, etc.)
  const aliasMap: Record<string, string> = {
    en: 'eng_Latn',
    zh: 'zho_Hans',
    'zh-CN': 'zho_Hans',
    'zh-TW': 'zho_Hant',
    'zh-Hans': 'zho_Hans',
    'zh-Hant': 'zho_Hant',
    ja: 'jpn_Jpan',
    ko: 'kor_Hang',
    fr: 'fra_Latn',
    de: 'deu_Latn',
    es: 'spa_Latn',
    pt: 'por_Latn',
    it: 'ita_Latn',
    ru: 'rus_Cyrl',
    ar: 'arb_Arab',
    hi: 'hin_Deva',
    bn: 'ben_Beng',
    tr: 'tur_Latn',
    vi: 'vie_Latn',
    th: 'tha_Thai',
    id: 'ind_Latn',
    ms: 'zsm_Latn',
    tl: 'tgl_Latn',
    sw: 'swh_Latn',
    uk: 'ukr_Cyrl',
    pl: 'pol_Latn',
    nl: 'nld_Latn',
    sv: 'swe_Latn',
    da: 'dan_Latn',
    fi: 'fin_Latn',
    no: 'nob_Latn',
    cs: 'ces_Latn',
    hu: 'hun_Latn',
    ro: 'ron_Latn',
    bg: 'bul_Cyrl',
    sr: 'srp_Cyrl',
    hr: 'hrv_Latn',
    sk: 'slk_Latn',
    sl: 'slv_Latn',
    lt: 'lit_Latn',
    lv: 'lvs_Latn',
    et: 'est_Latn',
    el: 'ell_Grek',
    he: 'heb_Hebr',
    fa: 'pes_Arab',
    ur: 'urd_Arab',
    my: 'mya_Mymr',
    km: 'khm_Khmr',
    lo: 'lao_Laoo',
    am: 'amh_Ethi',
    // Chinese aliases (Pinyin)
    zhongwen: 'zho_Hans',
    hanyu: 'zho_Hans',
    fanti: 'zho_Hant',
    jianti: 'zho_Hans',
    // Common language names in Chinese
    '中文（简体）': 'zho_Hans',
    '中文（繁体）': 'zho_Hant',
    '中文': 'zho_Hans',
    '英语': 'eng_Latn',
    '英文': 'eng_Latn',
    '日语': 'jpn_Jpan',
    '日文': 'jpn_Jpan',
    '韩语': 'kor_Hang',
    '韩文': 'kor_Hang',
    '法语': 'fra_Latn',
    '法文': 'fra_Latn',
    '德语': 'deu_Latn',
    '德文': 'deu_Latn',
    '西班牙语': 'spa_Latn',
    '俄语': 'rus_Cyrl',
    '俄文': 'rus_Cyrl',
    '葡萄牙语': 'por_Latn',
    '意大利语': 'ita_Latn',
    '阿拉伯语': 'arb_Arab',
  }

  const lowerAlias = trimmed.toLowerCase()
  if (aliasMap[lowerAlias]) return aliasMap[lowerAlias]

  // 3. Fuzzy match by name
  const candidates = searchLanguage(trimmed)
  if (candidates.length === 1) return candidates[0]!.code

  // More than one candidate → ambiguous, don't guess
  return undefined
}

/**
 * Get all supported language codes and names.
 */
export function getAllLanguages(): readonly LanguageEntry[] {
  return LANGUAGES
}

/**
 * Get matching candidates as a formatted string for error messages.
 */
export function formatCandidates(candidates: LanguageEntry[]): string {
  if (candidates.length === 0) return 'No matching languages found'
  return candidates.map((l) => `  ${l.code} — ${l.name}`).join('\n')
}
