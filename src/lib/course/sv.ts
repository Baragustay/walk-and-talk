// Swedish course for Starter (Pre-A1) and A1 learners. One lesson per walk.
// Based on:
// - Skolverket, SFI (svenska för invandrare), kurs A (≈ CEFR A1−/A1): oral interaction and
//   production about oneself, everyday situations, simple questions and answers.
//   https://www.skolverket.se/undervisning/komvux/komvux-i-svenska-for-invandrare-sfi
// - CEFR Companion Volume 2020, A1 spoken interaction / production can-dos.
// - Vocabulary from the A1 band of the Swedish Kelly list / SVALex (Språkbanken, GU).
// Same order as the Spanish and Japanese courses. Edit freely; keep 3 to 5 phrases per lesson.
import type { Lesson } from './types'

export const SWEDISH_COURSE: Lesson[] = [
  {
    id: 'sv-01-hej',
    title: 'Hello, my name is…',
    canDo: 'say hello and goodbye, say your name, ask someone their name, and say thank you',
    phrases: [
      { target: 'Hej!', meaning: 'hello / hi' },
      { target: 'Jag heter…', meaning: 'my name is…' },
      { target: 'Vad heter du?', meaning: "what's your name?" },
      { target: 'Tack!', meaning: 'thank you' },
      { target: 'Hej då!', meaning: 'bye' },
    ],
    walkIdea: 'Pretend to meet people on the walk: greet them, swap names, say bye.',
    refs: ['CEFR A1 interaction: greet, introduce oneself, say goodbye', 'SFI kurs A: hälsa och presentera sig'],
  },
  {
    id: 'sv-02-hur-mar-du',
    title: 'How are you?',
    canDo: 'ask how someone is and answer',
    phrases: [
      { target: 'Hur mår du?', meaning: 'how are you?' },
      { target: 'Bra, tack!', meaning: 'good, thanks' },
      { target: 'Inte så bra', meaning: 'not so good' },
      { target: 'Och du?', meaning: 'and you?' },
      { target: 'Jag är trött', meaning: "I'm tired" },
    ],
    walkIdea: 'Ask how they feel at different moments of the walk (start, a hill, the end).',
    refs: ['CEFR A1 interaction: ask how people are and react to news', 'SFI kurs A: enkla frågor och svar om sig själv'],
  },
  {
    id: 'sv-03-forstar-inte',
    title: 'Help! I don’t understand',
    canDo: 'ask Buddy to slow down, repeat, or tell you a word',
    phrases: [
      { target: 'Jag förstår inte', meaning: "I don't understand" },
      { target: 'Kan du prata långsammare?', meaning: 'can you speak more slowly?' },
      { target: 'En gång till, tack', meaning: 'once more, please' },
      { target: 'Vad betyder…?', meaning: 'what does … mean?' },
      { target: 'Ja / Nej', meaning: 'yes / no' },
    ],
    walkIdea: 'Say something a bit too fast on purpose, so they practise asking you to slow down or repeat.',
    refs: ['CEFR A1 interaction strategies: ask for repetition and slower speech', 'SFI kurs A: be om förtydligande'],
  },
  {
    id: 'sv-04-jag-gar',
    title: 'I’m walking',
    canDo: 'say what you are doing and where you are going',
    phrases: [
      { target: 'Jag går', meaning: "I walk / I'm walking" },
      { target: 'Jag går till parken', meaning: "I'm going to the park" },
      { target: 'Jag går hem', meaning: "I'm going home" },
      { target: 'Jag är ute', meaning: "I'm outside" },
    ],
    walkIdea: 'Narrate what they are doing right now and where they are going.',
    refs: ['CEFR A1 production: describe what one is doing in simple phrases', 'SFI kurs A: vardagliga situationer'],
  },
  {
    id: 'sv-05-jag-ser',
    title: 'What I see',
    canDo: 'name things you see around you',
    phrases: [
      { target: 'Jag ser…', meaning: 'I see…' },
      { target: 'ett träd', meaning: 'a tree (ett word)' },
      { target: 'en hund', meaning: 'a dog (en word)' },
      { target: 'ett hus', meaning: 'a house (ett word)' },
      { target: 'en bil', meaning: 'a car (en word)' },
    ],
    walkIdea: 'Ask them to look around and say "Jag ser…" with things they can really see. Teach extra nouns only if they ask. Don’t explain en/ett; just say each noun with its word.',
    refs: ['CEFR A1 vocabulary range: basic repertoire of concrete words', 'Kelly/SVALex A1: hund, hus, bil, träd'],
  },
  {
    id: 'sv-06-vadret',
    title: 'The weather',
    canDo: 'say what the weather is like',
    phrases: [
      { target: 'Hur är vädret?', meaning: "what's the weather like?" },
      { target: 'Det är soligt', meaning: "it's sunny" },
      { target: 'Det är kallt', meaning: "it's cold" },
      { target: 'Det är varmt', meaning: "it's warm" },
      { target: 'Det regnar', meaning: "it's raining" },
    ],
    walkIdea: 'Describe the real weather where they are right now.',
    refs: ['CEFR A1 interaction: simple exchanges on very familiar topics', 'SFI kurs A: väder'],
  },
  {
    id: 'sv-07-siffror',
    title: 'Numbers 1 to 10',
    canDo: 'count to ten and say how long you walk',
    phrases: [
      { target: 'ett, två, tre', meaning: 'one, two, three' },
      { target: 'fyra, fem, sex', meaning: 'four, five, six' },
      { target: 'sju, åtta', meaning: 'seven, eight' },
      { target: 'nio, tio', meaning: 'nine, ten' },
      { target: 'Jag går i tio minuter', meaning: 'I walk for ten minutes' },
    ],
    walkIdea: 'Count steps out loud together, a few at a time.',
    refs: ['CEFR A1: handle numbers, quantities and time', 'SFI kurs A: siffror och tid'],
  },
  {
    id: 'sv-08-tycker-om',
    title: 'I like…',
    canDo: 'say what you like and don’t like, and ask others',
    phrases: [
      { target: 'Jag tycker om…', meaning: 'I like…' },
      { target: 'Jag tycker inte om…', meaning: "I don't like…" },
      { target: 'Jag tycker om att gå', meaning: 'I like walking' },
      { target: 'Tycker du om…?', meaning: 'do you like…?' },
      { target: 'Jag älskar…', meaning: 'I love…' },
    ],
    walkIdea: 'Ask about things on the walk and earlier lessons: the weather, dogs, the park.',
    refs: ['CEFR A1 production: say what one likes and dislikes', 'SFI kurs A: intressen'],
  },
  {
    id: 'sv-09-varifran',
    title: 'Where I’m from',
    canDo: 'say where you are from and where you live, and ask others',
    phrases: [
      { target: 'Jag kommer från…', meaning: "I'm from…" },
      { target: 'Jag bor i…', meaning: 'I live in…' },
      { target: 'Var kommer du ifrån?', meaning: 'where are you from?' },
      { target: 'Var bor du?', meaning: 'where do you live?' },
    ],
    walkIdea: 'Combine with lesson 1: a full mini introduction (hello, name, from, live).',
    refs: ['CEFR A1 interaction: ask and answer about where people live', 'SFI kurs A: personliga uppgifter'],
  },
  {
    id: 'sv-10-fika',
    title: 'Food, drink and fika',
    canDo: 'ask for something to drink or eat, and suggest a fika',
    phrases: [
      { target: 'Jag vill ha…', meaning: "I'd like… / I want…" },
      { target: 'en kaffe', meaning: 'a coffee' },
      { target: 'vatten', meaning: 'water' },
      { target: 'Jag är hungrig', meaning: "I'm hungry" },
      { target: 'Ska vi fika?', meaning: 'shall we have a fika (coffee break)?' },
    ],
    walkIdea: 'Plan a fika on the way home: order a coffee, say if they are hungry.',
    refs: ['CEFR A1 interaction: ask for things and give things', 'SFI kurs A: mat och dryck, handla'],
  },
]
