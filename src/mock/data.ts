// PHASE 1 MOCK DATA. Replaced by Dexie (phase 2) and the Live API (phase 5).
import type { TargetLanguage, Walk, Word } from '../types'

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

function word(w: Partial<Word> & Pick<Word, 'id' | 'target' | 'translation' | 'example'>, daysAgo: number, dueInDays: number): Word {
  return {
    reason: 'taught',
    step: 0,
    timesRemembered: 0,
    timesMissed: 0,
    createdAt: now - daysAgo * DAY,
    dueAt: now + dueInDays * DAY,
    ...w,
  }
}

export const MOCK_WORDS: Record<TargetLanguage, Word[]> = {
  sv: [
    word({ id: 'sv1', target: 'promenad', translation: 'walk', example: 'Jag tar en promenad varje dag.' }, 3, 0),
    word({ id: 'sv2', target: 'regnar', translation: "it's raining", example: 'Det regnar idag.', reason: 'asked' }, 2, 0),
    word({ id: 'sv3', target: 'fika', translation: 'coffee break', example: 'Ska vi fika?' }, 5, -1),
    word({ id: 'sv4', target: 'grannar', translation: 'neighbours', example: 'Mina grannar är snälla.' }, 1, 1),
    word({ id: 'sv5', target: 'trött', translation: 'tired', example: 'Jag är lite trött.', reason: 'repeated_mistake' }, 0, 1),
  ],
  es: [
    word({ id: 'es1', target: 'paseo', translation: 'walk', example: 'Doy un paseo cada día.' }, 3, 0),
    word({ id: 'es2', target: 'llueve', translation: "it's raining", example: 'Hoy llueve mucho.', reason: 'asked' }, 2, 0),
    word({ id: 'es3', target: 'vecinos', translation: 'neighbours', example: 'Mis vecinos son simpáticos.' }, 5, -1),
    word({ id: 'es4', target: 'cansada', translation: 'tired', example: 'Estoy un poco cansada.', reason: 'repeated_mistake' }, 1, 1),
    word({ id: 'es5', target: 'merienda', translation: 'afternoon snack', example: '¿Qué hay de merienda?' }, 0, 1),
  ],
  ja: [
    word({ id: 'ja1', target: '散歩', kanji: '散歩', kana: 'さんぽ', romaji: 'sanpo', translation: 'walk', example: '毎日散歩します。' }, 3, 0),
    word({ id: 'ja2', target: '雨', kanji: '雨', kana: 'あめ', romaji: 'ame', translation: 'rain', example: '今日は雨です。', reason: 'asked' }, 2, 0),
    word({ id: 'ja3', target: '近所', kanji: '近所', kana: 'きんじょ', romaji: 'kinjo', translation: 'neighbourhood', example: '近所に公園があります。' }, 5, -1),
    word({ id: 'ja4', target: '疲れた', kanji: '疲れた', kana: 'つかれた', romaji: 'tsukareta', translation: 'tired', example: 'ちょっと疲れた。', reason: 'repeated_mistake' }, 1, 1),
    word({ id: 'ja5', target: 'おにぎり', kana: 'おにぎり', romaji: 'onigiri', translation: 'rice ball', example: 'おにぎりが好きです。' }, 0, 1),
  ],
}

export function dueWords(words: Word[]): Word[] {
  return words.filter((w) => w.dueAt <= now + 60_000)
}

export const MOCK_WALKS: Walk[] = [
  { id: 'w1', startedAt: now - 1 * DAY, endedAt: now - 1 * DAY + 18 * 60_000, minutes: 18, topic: 'free', hadPhoto: false },
  { id: 'w2', startedAt: now - 3 * DAY, endedAt: now - 3 * DAY + 22 * 60_000, minutes: 22, topic: 'food', hadPhoto: true },
  { id: 'w3', startedAt: now - 4 * DAY, endedAt: now - 4 * DAY + 12 * 60_000, minutes: 12, topic: 'daily', hadPhoto: false },
]

export interface ScriptLine {
  who: 'buddy' | 'user'
  text: string
  /** Index into MOCK_WORDS that gets "saved" after this line. */
  saves?: number
}

export const MOCK_SCRIPT: Record<TargetLanguage, ScriptLine[]> = {
  sv: [
    { who: 'buddy', text: 'Hej! Var går du idag?' },
    { who: 'user', text: 'Jag går i parken. Det är… raining?' },
    { who: 'buddy', text: 'Det regnar! Säg: det regnar.', saves: 1 },
    { who: 'user', text: 'Det regnar.' },
    { who: 'buddy', text: 'Perfekt. Är du trött idag?' },
    { who: 'user', text: 'Lite trött, men glad.' },
    { who: 'buddy', text: 'Vad bra! Vad ser du i parken?' },
  ],
  es: [
    { who: 'buddy', text: '¡Hola! ¿Dónde caminas hoy?' },
    { who: 'user', text: 'Camino en el parque. Hoy… raining?' },
    { who: 'buddy', text: '¡Hoy llueve! Di: hoy llueve.', saves: 1 },
    { who: 'user', text: 'Hoy llueve.' },
    { who: 'buddy', text: 'Perfecto. ¿Estás cansada?' },
    { who: 'user', text: 'Un poco cansada, pero feliz.' },
    { who: 'buddy', text: '¡Qué bien! ¿Qué ves en el parque?' },
  ],
  ja: [
    { who: 'buddy', text: 'こんにちは！今日はどこを歩いていますか？' },
    { who: 'user', text: '公園です。今日は… rain?' },
    { who: 'buddy', text: '雨ですね！「雨」と言ってみて。', saves: 1 },
    { who: 'user', text: '雨。' },
    { who: 'buddy', text: 'いいですね。疲れていますか？' },
    { who: 'user', text: 'ちょっと疲れた。でも元気。' },
    { who: 'buddy', text: 'よかった！公園で何が見えますか？' },
  ],
}

export const MOCK_STATS = {
  walksThisWeek: 3,
  minutesSpoken: 52,
  wordsLearned: 5,
  wordsRemembered: 3,
}
