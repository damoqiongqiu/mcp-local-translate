import { describe, it, expect } from 'vitest'
import {
  resolveLanguageCode,
  searchLanguage,
  getAllLanguages,
} from '../language-codes.js'

describe('language-codes', () => {
  describe('resolveLanguageCode', () => {
    it('resolves exact FLORES-200 codes', () => {
      expect(resolveLanguageCode('eng_Latn')).toBe('eng_Latn')
      expect(resolveLanguageCode('zho_Hans')).toBe('zho_Hans')
      expect(resolveLanguageCode('jpn_Jpan')).toBe('jpn_Jpan')
      expect(resolveLanguageCode('fra_Latn')).toBe('fra_Latn')
    })

    it('resolves ISO 639-1 short codes', () => {
      expect(resolveLanguageCode('en')).toBe('eng_Latn')
      expect(resolveLanguageCode('zh')).toBe('zho_Hans')
      expect(resolveLanguageCode('ja')).toBe('jpn_Jpan')
      expect(resolveLanguageCode('fr')).toBe('fra_Latn')
      expect(resolveLanguageCode('de')).toBe('deu_Latn')
      expect(resolveLanguageCode('ko')).toBe('kor_Hang')
    })

    it('resolves Chinese aliases', () => {
      expect(resolveLanguageCode('中文')).toBe('zho_Hans')
      expect(resolveLanguageCode('英语')).toBe('eng_Latn')
      expect(resolveLanguageCode('日语')).toBe('jpn_Jpan')
      expect(resolveLanguageCode('法语')).toBe('fra_Latn')
      expect(resolveLanguageCode('韩语')).toBe('kor_Hang')
    })

    it('resolves English language names', () => {
      expect(resolveLanguageCode('English')).toBe('eng_Latn')
      expect(resolveLanguageCode('Chinese')).toBe('zho_Hans')
      expect(resolveLanguageCode('Japanese')).toBe('jpn_Jpan')
      expect(resolveLanguageCode('French')).toBe('fra_Latn')
    })

    it('is case-insensitive', () => {
      expect(resolveLanguageCode('ENGLISH')).toBe('eng_Latn')
      expect(resolveLanguageCode('EnGliSh')).toBe('eng_Latn')
      expect(resolveLanguageCode('ZHONGWEN')).toBe('zho_Hans')
    })

    it('handles whitespace', () => {
      expect(resolveLanguageCode('  en  ')).toBe('eng_Latn')
    })

    it('returns undefined for unknown codes', () => {
      expect(resolveLanguageCode('xx')).toBeUndefined()
      expect(resolveLanguageCode('xyzzy')).toBeUndefined()
      expect(resolveLanguageCode('')).toBeUndefined()
    })
  })

  describe('searchLanguage', () => {
    it('finds languages by fuzzy keyword match', () => {
      const results = searchLanguage('chine')
      const codes = results.map((r) => r.code)
      expect(codes).toContain('zho_Hans')
    })

    it('finds Japanese by keyword', () => {
      const results = searchLanguage('japan')
      const codes = results.map((r) => r.code)
      expect(codes).toContain('jpn_Jpan')
    })

    it('returns empty for nonsense queries', () => {
      const results = searchLanguage('zzzzz12345')
      expect(results).toHaveLength(0)
    })
  })

  describe('getAllLanguages', () => {
    it('returns 200+ languages', () => {
      const langs = getAllLanguages()
      expect(langs.length).toBeGreaterThanOrEqual(200)
    })

    it('includes major languages', () => {
      const langs = getAllLanguages()
      const codes = langs.map((l) => l.code)
      expect(codes).toContain('eng_Latn')
      expect(codes).toContain('zho_Hans')
      expect(codes).toContain('jpn_Jpan')
      expect(codes).toContain('fra_Latn')
    })

    it('each entry has code, name, family', () => {
      const langs = getAllLanguages()
      for (const lang of langs) {
        expect(lang).toHaveProperty('code')
        expect(lang).toHaveProperty('name')
        expect(lang).toHaveProperty('family')
        expect(typeof lang.code).toBe('string')
        expect(lang.code.length).toBeGreaterThan(0)
      }
    })
  })
})
