// Japanese course for Starter (N5 and below) learners. One lesson per walk.
// Based on the JF Standard for Japanese-Language Education (CEFR-based can-dos) and the topics of
// Marugoto Starter (A1): https://www.jfstandard.jpf.go.jp/  https://marugotoweb.jp/
// Same order and topics as the Spanish course. Polite -masu/-desu forms throughout:
// safe with anyone, and the pattern repeats, so each lesson builds on the last.
// `target` is how it's normally written; `kana` is the reading; `romaji` for the romaji setting.
import type { Lesson } from './types'

export const JAPANESE_COURSE: Lesson[] = [
  {
    id: 'ja-01-konnichiwa',
    title: 'Hello, my name is…',
    canDo: 'say hello and goodbye, say your name, ask someone their name, and say thank you',
    phrases: [
      { target: 'こんにちは', kana: 'こんにちは', romaji: 'konnichiwa', meaning: 'hello' },
      { target: '私は…です', kana: 'わたしは…です', romaji: 'watashi wa … desu', meaning: "I'm … (my name is …)" },
      { target: 'お名前は？', kana: 'おなまえは？', romaji: 'onamae wa?', meaning: "what's your name?" },
      { target: 'ありがとう', kana: 'ありがとう', romaji: 'arigatō', meaning: 'thank you' },
      { target: 'またね／さようなら', kana: 'またね／さようなら', romaji: 'mata ne / sayōnara', meaning: 'see you / goodbye' },
    ],
    walkIdea: 'Pretend to meet people on the walk: greet them, swap names, say bye.',
  },
  {
    id: 'ja-02-genki',
    title: 'How are you?',
    canDo: 'ask how someone is and answer',
    phrases: [
      { target: '元気ですか？', kana: 'げんきですか？', romaji: 'genki desu ka?', meaning: 'how are you? (are you well?)' },
      { target: '元気です', kana: 'げんきです', romaji: 'genki desu', meaning: "I'm fine" },
      { target: 'まあまあです', kana: 'まあまあです', romaji: 'māmā desu', meaning: "I'm so-so" },
      { target: '疲れました', kana: 'つかれました', romaji: 'tsukaremashita', meaning: "I'm tired" },
      { target: '…さんは？', kana: '…さんは？', romaji: '… san wa?', meaning: 'and you, …? (e.g. Buddy-san wa?)' },
    ],
    walkIdea: 'Ask how they feel at different moments of the walk (start, a hill, the end).',
  },
  {
    id: 'ja-03-wakarimasen',
    title: 'Help! I don’t understand',
    canDo: 'ask Buddy to slow down, repeat, or tell you a word',
    phrases: [
      { target: 'わかりません', kana: 'わかりません', romaji: 'wakarimasen', meaning: "I don't understand" },
      { target: 'ゆっくりお願いします', kana: 'ゆっくりおねがいします', romaji: 'yukkuri onegaishimasu', meaning: 'slowly, please' },
      { target: 'もう一度お願いします', kana: 'もういちどおねがいします', romaji: 'mō ichido onegaishimasu', meaning: 'once more, please' },
      { target: '…は日本語で何ですか？', kana: '…はにほんごでなんですか？', romaji: '… wa nihongo de nan desu ka?', meaning: 'how do you say … in Japanese?' },
      { target: 'はい／いいえ', kana: 'はい／いいえ', romaji: 'hai / iie', meaning: 'yes / no' },
    ],
    walkIdea: 'Say something a bit too fast on purpose, so they practise asking you to slow down or repeat.',
  },
  {
    id: 'ja-04-sanpo',
    title: 'I’m walking',
    canDo: 'say that you are out walking and where you are going',
    phrases: [
      { target: '散歩しています', kana: 'さんぽしています', romaji: 'sanpo shite imasu', meaning: "I'm taking a walk" },
      { target: '公園に行きます', kana: 'こうえんにいきます', romaji: 'kōen ni ikimasu', meaning: "I'm going to the park" },
      { target: '家に帰ります', kana: 'いえにかえります', romaji: 'ie ni kaerimasu', meaning: "I'm going home" },
      { target: '歩いています', kana: 'あるいています', romaji: 'aruite imasu', meaning: "I'm walking" },
    ],
    walkIdea: 'Narrate the walk as it happens: what they are doing, where they are going.',
  },
  {
    id: 'ja-05-miemasu',
    title: 'What I see',
    canDo: 'name things you see around you',
    phrases: [
      { target: '…が見えます', kana: '…がみえます', romaji: '… ga miemasu', meaning: 'I can see …' },
      { target: '木', kana: 'き', romaji: 'ki', meaning: 'tree' },
      { target: '犬', kana: 'いぬ', romaji: 'inu', meaning: 'dog' },
      { target: '家', kana: 'いえ', romaji: 'ie', meaning: 'house' },
      { target: '車', kana: 'くるま', romaji: 'kuruma', meaning: 'car' },
    ],
    walkIdea: 'Ask them to look around and say "… ga miemasu" with things they can really see. Teach extra nouns only if they ask.',
  },
  {
    id: 'ja-06-tenki',
    title: 'The weather',
    canDo: 'say what the weather is like',
    phrases: [
      { target: 'いい天気ですね', kana: 'いいてんきですね', romaji: 'ii tenki desu ne', meaning: "nice weather, isn't it?" },
      { target: '晴れです', kana: 'はれです', romaji: 'hare desu', meaning: "it's sunny" },
      { target: '寒いです', kana: 'さむいです', romaji: 'samui desu', meaning: "it's cold" },
      { target: '暑いです', kana: 'あついです', romaji: 'atsui desu', meaning: "it's hot" },
      { target: '雨です', kana: 'あめです', romaji: 'ame desu', meaning: "it's raining (it's rain)" },
    ],
    walkIdea: 'Describe the real weather on their walk right now.',
  },
  {
    id: 'ja-07-kazu',
    title: 'Numbers 1 to 10',
    canDo: 'count to ten and say how long you walk',
    phrases: [
      { target: '一、二、三', kana: 'いち、に、さん', romaji: 'ichi, ni, san', meaning: 'one, two, three' },
      { target: '四、五、六', kana: 'よん、ご、ろく', romaji: 'yon, go, roku', meaning: 'four, five, six' },
      { target: '七、八', kana: 'なな、はち', romaji: 'nana, hachi', meaning: 'seven, eight' },
      { target: '九、十', kana: 'きゅう、じゅう', romaji: 'kyū, jū', meaning: 'nine, ten' },
      { target: '十分歩きます', kana: 'じゅっぷんあるきます', romaji: 'juppun arukimasu', meaning: 'I walk for ten minutes' },
    ],
    walkIdea: 'Count steps out loud together, a few at a time.',
  },
  {
    id: 'ja-08-suki',
    title: 'I like…',
    canDo: 'say what you like and don’t like, and ask others',
    phrases: [
      { target: '好きです', kana: 'すきです', romaji: 'suki desu', meaning: 'I like it' },
      { target: '好きじゃないです', kana: 'すきじゃないです', romaji: 'suki ja nai desu', meaning: "I don't like it" },
      { target: '散歩が好きです', kana: 'さんぽがすきです', romaji: 'sanpo ga suki desu', meaning: 'I like walks' },
      { target: '…が好きですか？', kana: '…がすきですか？', romaji: '… ga suki desu ka?', meaning: 'do you like …?' },
      { target: '大好きです', kana: 'だいすきです', romaji: 'daisuki desu', meaning: 'I love it' },
    ],
    walkIdea: 'Ask about things on the walk and earlier lessons: the weather, dogs, the park.',
  },
  {
    id: 'ja-09-shusshin',
    title: 'Where I’m from',
    canDo: 'say where you are from and where you live, and ask others',
    phrases: [
      { target: '…から来ました', kana: '…からきました', romaji: '… kara kimashita', meaning: "I'm from …" },
      { target: '…に住んでいます', kana: '…にすんでいます', romaji: '… ni sunde imasu', meaning: 'I live in …' },
      { target: 'どこから来ましたか？', kana: 'どこからきましたか？', romaji: 'doko kara kimashita ka?', meaning: 'where are you from?' },
      { target: 'どこに住んでいますか？', kana: 'どこにすんでいますか？', romaji: 'doko ni sunde imasu ka?', meaning: 'where do you live?' },
    ],
    walkIdea: 'Combine with lesson 1: a full mini introduction (hello, name, from, live).',
  },
  {
    id: 'ja-10-tabemono',
    title: 'Food and drink',
    canDo: 'ask for something and say if you are hungry or thirsty',
    phrases: [
      { target: '…をください', kana: '…をください', romaji: '… o kudasai', meaning: '… please (when asking for something)' },
      { target: 'コーヒー', kana: 'コーヒー', romaji: 'kōhī', meaning: 'coffee' },
      { target: '水', kana: 'みず', romaji: 'mizu', meaning: 'water' },
      { target: 'お腹がすきました', kana: 'おなかがすきました', romaji: 'onaka ga sukimashita', meaning: "I'm hungry" },
      { target: '喉が渇きました', kana: 'のどがかわきました', romaji: 'nodo ga kawakimashita', meaning: "I'm thirsty" },
    ],
    walkIdea: 'Plan a stop at a café on the way home: ask for a drink, say if they are hungry.',
  },
]
