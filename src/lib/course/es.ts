// Spanish course for Starter (Pre-A1) and A1 learners. One lesson per walk.
// Order: what you need on a voice call first (greetings, "I don't understand"),
// then the walk itself, then everyday topics. Each lesson reuses earlier phrases.
// Edit freely: Buddy reads this as its lesson plan. Keep 3 to 5 phrases per lesson.
import type { Lesson } from './types'

export const SPANISH_COURSE: Lesson[] = [
  {
    id: 'es-01-hola',
    title: 'Hello, my name is…',
    canDo: 'say hello and goodbye, say your name, ask someone their name, and say thank you',
    phrases: [
      { target: 'Hola', meaning: 'hello' },
      { target: 'Me llamo…', meaning: 'my name is…' },
      { target: '¿Cómo te llamas?', meaning: "what's your name?" },
      { target: 'Gracias', meaning: 'thank you' },
      { target: 'Adiós / Hasta luego', meaning: 'bye / see you later' },
    ],
    walkIdea: 'Pretend to meet people on the walk: greet them, swap names, say bye.',
  },
  {
    id: 'es-02-que-tal',
    title: 'How are you?',
    canDo: 'ask how someone is and answer',
    phrases: [
      { target: '¿Qué tal?', meaning: "how are you? / how's it going?" },
      { target: 'Bien', meaning: 'good, fine' },
      { target: 'Muy bien', meaning: 'very good' },
      { target: 'Más o menos', meaning: 'so-so' },
      { target: '¿Y tú?', meaning: 'and you?' },
    ],
    walkIdea: 'Ask how they feel at different moments of the walk (start, a hill, the end).',
  },
  {
    id: 'es-03-ayuda',
    title: 'Help! I don’t understand',
    canDo: 'ask Buddy to slow down, repeat, or tell you a word',
    phrases: [
      { target: 'No entiendo', meaning: "I don't understand" },
      { target: 'Más despacio, por favor', meaning: 'slower, please' },
      { target: 'Otra vez, por favor', meaning: 'again, please' },
      { target: '¿Cómo se dice…?', meaning: 'how do you say…?' },
      { target: 'Sí / No', meaning: 'yes / no' },
    ],
    walkIdea: 'Say something a bit too fast on purpose, so they practise asking you to slow down or repeat.',
  },
  {
    id: 'es-04-camino',
    title: 'I’m walking',
    canDo: 'say that you are walking and where you are going',
    phrases: [
      { target: 'Camino', meaning: "I walk / I'm walking" },
      { target: 'Voy al parque', meaning: "I'm going to the park" },
      { target: 'Voy a casa', meaning: "I'm going home" },
      { target: 'Estoy en la calle', meaning: "I'm on the street" },
    ],
    walkIdea: 'Narrate the walk as it happens: where they are, where they are going.',
  },
  {
    id: 'es-05-veo',
    title: 'What I see',
    canDo: 'name things you see around you',
    phrases: [
      { target: 'Veo…', meaning: 'I see…' },
      { target: 'un árbol', meaning: 'a tree' },
      { target: 'un perro', meaning: 'a dog' },
      { target: 'una casa', meaning: 'a house' },
      { target: 'un coche', meaning: 'a car' },
    ],
    walkIdea: 'Ask them to look around and say "Veo…" with things they can really see. Teach extra nouns only if they ask.',
  },
  {
    id: 'es-06-tiempo',
    title: 'The weather',
    canDo: 'say what the weather is like',
    phrases: [
      { target: '¿Qué tiempo hace?', meaning: "what's the weather like?" },
      { target: 'Hace sol', meaning: "it's sunny" },
      { target: 'Hace frío', meaning: "it's cold" },
      { target: 'Hace calor', meaning: "it's hot" },
      { target: 'Llueve', meaning: "it's raining" },
    ],
    walkIdea: 'Describe the real weather on their walk right now.',
  },
  {
    id: 'es-07-numeros',
    title: 'Numbers 1 to 10',
    canDo: 'count to ten and say how long you walk',
    phrases: [
      { target: 'uno, dos, tres', meaning: 'one, two, three' },
      { target: 'cuatro, cinco, seis', meaning: 'four, five, six' },
      { target: 'siete, ocho', meaning: 'seven, eight' },
      { target: 'nueve, diez', meaning: 'nine, ten' },
      { target: 'Camino diez minutos', meaning: 'I walk for ten minutes' },
    ],
    walkIdea: 'Count steps out loud together, a few at a time.',
  },
  {
    id: 'es-08-gusta',
    title: 'I like…',
    canDo: 'say what you like and don’t like, and ask others',
    phrases: [
      { target: 'Me gusta', meaning: 'I like (it)' },
      { target: 'No me gusta', meaning: "I don't like (it)" },
      { target: 'Me gusta caminar', meaning: 'I like walking' },
      { target: '¿Te gusta…?', meaning: 'do you like…?' },
      { target: 'Me gusta mucho', meaning: 'I like it a lot' },
    ],
    walkIdea: 'Ask about things on the walk and earlier lessons: the weather, dogs, the park.',
  },
  {
    id: 'es-09-de-donde',
    title: 'Where I’m from',
    canDo: 'say where you are from and where you live, and ask others',
    phrases: [
      { target: 'Soy de…', meaning: "I'm from…" },
      { target: 'Vivo en…', meaning: 'I live in…' },
      { target: '¿De dónde eres?', meaning: 'where are you from?' },
      { target: '¿Dónde vives?', meaning: 'where do you live?' },
    ],
    walkIdea: 'Combine with lesson 1: a full mini introduction (hello, name, from, live).',
  },
  {
    id: 'es-10-comida',
    title: 'Food and drink',
    canDo: 'say what you want and if you are hungry or thirsty',
    phrases: [
      { target: 'Quiero…', meaning: 'I want…' },
      { target: 'un café', meaning: 'a coffee' },
      { target: 'agua', meaning: 'water' },
      { target: 'Tengo hambre', meaning: "I'm hungry" },
      { target: 'Tengo sed', meaning: "I'm thirsty" },
    ],
    walkIdea: 'Plan a stop at a café on the way home: order a drink, say if they are hungry.',
  },
]
