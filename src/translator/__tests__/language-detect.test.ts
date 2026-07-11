import { describe, expect, it } from 'vitest'
import { detectLanguage } from '../language-detect.js'

describe('language-detect', () => {
  describe('detectLanguage', () => {
    it('detects English', () => {
      const result = detectLanguage(
        'The quick brown fox jumps over the lazy dog. This is a simple English sentence.'
      )
      expect(result).toBe('eng_Latn')
    })

    it('detects Chinese (Simplified)', () => {
      const result = detectLanguage('人工智能正在改变世界。深度学习模型可以理解和生成人类语言。')
      expect(result).toBe('zho_Hans')
    })

    it('detects Japanese', () => {
      const result = detectLanguage(
        '人工知能は世界を変えています。深層学習モデルは人間の言語を理解し生成できます。'
      )
      expect(result).toBe('jpn_Jpan')
    })

    it('detects Korean', () => {
      const result = detectLanguage(
        '인공지능이 세상을 바꾸고 있습니다. 딥러닝 모델은 인간의 언어를 이해하고 생성할 수 있습니다.'
      )
      expect(result).toBe('kor_Hang')
    })

    it('detects French', () => {
      const result = detectLanguage(
        "L'intelligence artificielle transforme notre monde. Les modèles d'apprentissage profond peuvent comprendre le langage."
      )
      expect(result).toBe('fra_Latn')
    })

    it('detects German', () => {
      const result = detectLanguage(
        'Künstliche Intelligenz verändert die Welt. Deep-Learning-Modelle können menschliche Sprache verstehen.'
      )
      expect(result).toBe('deu_Latn')
    })

    it('detects Spanish', () => {
      const result = detectLanguage(
        'La inteligencia artificial está transformando el mundo. Los modelos de aprendizaje profundo pueden entender el lenguaje humano.'
      )
      expect(result).toBe('spa_Latn')
    })

    it('detects Russian', () => {
      const result = detectLanguage(
        'Искусственный интеллект меняет мир. Модели глубокого обучения могут понимать человеческий язык.'
      )
      expect(result).toBe('rus_Cyrl')
    })

    it('detects Arabic', () => {
      const result = detectLanguage(
        'الذكاء الاصطناعي يغير العالم. نماذج التعلم العميق يمكنها فهم اللغة البشرية.'
      )
      expect(result).toBe('arb_Arab')
    })

    it('returns null for empty text', () => {
      expect(detectLanguage('')).toBeNull()
      expect(detectLanguage('   ')).toBeNull()
    })

    it('returns null for very short text', () => {
      // franc-min requires minimum length for reliable detection
      const result = detectLanguage('hi')
      // Short text may or may not be detected depending on franc-min heuristics
      // The key behavior: it should not throw or crash
      expect(result === null || typeof result === 'string').toBe(true)
    })
  })
})
