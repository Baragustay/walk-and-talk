# Walk & Talk (working name)

An audio-first language app. The user "calls" Buddy, a friendly AI character, while walking and practices speaking. Built on the Gemini Live API.

- **Mother tongue:** any language the user picks.
- **Target language:** Swedish, Spanish or Japanese. Nothing else for now.
- **Users:** 13 and up.
- **Goal of this build:** a mobile-first web prototype to test the conversation. Native app comes later, so keep logic out of UI components where possible.

Full product decisions live in the PRD (Walk & Talk PRD v3). This file is the build brief. If they disagree, ask me.

---

## How to work with me

- I'm a UX designer who codes. Explain decisions briefly when you make a non-obvious one.
- Build in the phases below. Finish a phase, run it, tell me how to test it on my phone, then stop and wait for me.
- Ask before adding a dependency that isn't listed here.
- Commit at the end of each phase with a clear message.
- Never put an API key in client code or commit it. Use `.env` and keep `.env` in `.gitignore`.

---

## Tech stack

- **Frontend:** React + TypeScript + Vite. Mobile-first, installable as a PWA.
- **Styling:** CSS modules or plain CSS with custom properties (design tokens below). No UI library.
- **Routing:** React Router.
- **Local data:** IndexedDB via Dexie. No backend database yet.
- **AI:** Gemini Live API through the official `@google/genai` SDK. Check the current Gemini docs for the newest native-audio Live model and use that. Don't guess the model name.
- **Token server:** one small serverless function (Netlify Functions) that creates short-lived ephemeral tokens for the Live API. The client never sees the real key.
- **Hosting:** Netlify.

---

## Design

### Tokens

```css
:root {
  --paper: #FBF7EF;          /* fallback behind the paper texture */
  --ink: #2B2622;            /* main text, placeholder until I pick the final one */
  --ink-soft: #5E5650;       /* secondary text */
  --bubble-buddy: #F5C1A2;   /* Buddy's chat bubbles, always */
  --bubble-user: #A2B4F9;    /* user's chat bubbles, always */
  --radius: 16px;
}
```

- Background: cream/white paper texture on every screen. I'll add the image at `public/textures/paper.png`. Use `--paper` until it exists.
- Text on both bubble colours must be dark (`--ink`). White text fails contrast on them.
- Feel: calm, ADHD-friendly, hand-drawn. Lots of space, few elements per screen, no flashing, no busy animations.
- Respect `prefers-reduced-motion`.
- Tap targets at least 48×48 px. The Call button is much bigger.
- WCAG 2.2 AA throughout: contrast, focus states, labels on every control, screen-reader text for Buddy's state.

### Buddy states

I'm dropping PNGs into `public/buddy/`. Expected file names:

| File | When it shows |
| --- | --- |
| `buddy-idle.png` | Home, waiting for a call |
| `buddy-waving.png` | Onboarding hello, end of call |
| `buddy-listening.png` | User is speaking |
| `buddy-thinking.png` | Waiting for Buddy's reply |
| `buddy-talking.png` | Buddy is speaking |
| `buddy-happy.png` | Word remembered, quiz answer right |
| `buddy-encouraging.png` | Quiz answer missed |

Build a single `<Buddy state="..." />` component:
- Reads from a map of state → file name, so files can be swapped or renamed in one place.
- If a file is missing, fall back to `buddy-idle.png`. If that's missing too, show a simple placeholder circle. Don't crash.
- Gentle cross-fade between states (off when reduced motion is on).
- `alt` text describes the state, e.g. "Buddy is listening".
- Check what's actually in `public/buddy/` before you start and tell me which states are missing.

---

## Screens

Tab bar with **Home**, **Words**, **Me**. Settings opens from Me. Onboarding and Call are full screen, no tab bar.

### 1. Onboarding (shown once)
1. **Welcome:** one line on what this is. Buddy waving.
2. **Languages:** pick mother tongue (searchable list), then Swedish, Spanish or Japanese.
3. **How it works:** three short cards, swipeable:
   - Call Buddy and just talk.
   - Stuck? Say it in your own language and Buddy gives you the word.
   - Your new words come back on later walks.
4. **Meet Buddy:** Buddy says hi, ask for microphone permission with a clear reason.
5. **Level call:** a 3 to 5 minute call, fine to do sitting down. Buddy finds the user's level. A "Skip for now" link sets level to A1.

Then land on Home.

### 2. Home
- Buddy (idle), big **Call Buddy** button.
- Topic chips: Free talk, Daily life, Food, Travel, Work or school. One can be selected, default Free talk.
- **Add photo** button: camera or gallery. Show a small thumbnail once added, with a remove option. The photo is sent to Gemini at the start of the next call.
- A quiet note if words are due: "3 words to review today".

### 3. Call
- Buddy large, state driven by the conversation (listening, thinking, talking).
- Live transcript as chat bubbles: Buddy in `--bubble-buddy`, user in `--bubble-user`. Auto-scroll, keep the last few lines visible.
- **Word card** pinned to the bottom: shows the latest saved word, its translation and spelling. For Japanese: kanji with kana reading above it, plus romaji (see Settings).
- Timer, small and quiet.
- **End call** button, big.
- Keep the screen awake with the Wake Lock API while a call is active, if supported.

### 4. Words
- Two lists: **Due today** and **All words** (newest first).
- **Start flashcards** button: goes through due words.
  - Front: word in the user's mother tongue. Tap to flip.
  - Back: target-language word, example sentence, play-audio button if available.
  - Two buttons: "Got it" and "Not yet". These update the review schedule.

### 5. Me
- Walks this week, total minutes spoken, words learned, words remembered.
- Calm tone. No streak-loss warnings, no guilt.
- Gear icon to Settings.

### 6. Settings
- Mother tongue, target language.
- Current level, with "Redo level call".
- Walk length (default 20 min; options 10, 15, 20, 30).
- Show romaji (Japanese only, default on).
- Reminders (placeholder toggle for now, no notifications yet).
- **Delete my data:** clears IndexedDB after a confirm dialog.

---

## Data model (Dexie)

```ts
profile:   { id: 'me', motherTongue, targetLanguage, level /* 'A1'..'C1' or 'unknown' */, levelNote, walkMinutes, showRomaji, createdAt }
walks:     { id, startedAt, endedAt, minutes, topic, hadPhoto }
words:     { id, target, translation, example, reason /* 'taught'|'asked'|'repeated_mistake' */,
             kana?, kanji?, romaji?,             // Japanese only
             step /* 0..4 */, dueAt, createdAt, lastReviewedAt, timesRemembered, timesMissed }
```

For Japanese, show JLPT labels in the UI (N5 to N1) and map to CEFR internally:
N5→A1, N4→A2, N3→B1, N2→B2, N1→C1.

---

## Spaced repetition

Review steps in days: `[1, 3, 7, 14, 30]`.

- New word: `step = 0`, `dueAt = now + 1 day`.
- Remembered: move up one step (cap at the last one), set `dueAt` from the new step.
- Missed: back to `step = 0`, due in 1 day.
- "Remembered" comes from either a flashcard "Got it" or Buddy calling `mark_recall(word, true)` during a walk.

Put this logic in its own pure module (`src/lib/srs.ts`) with unit tests (Vitest).

---

## Gemini Live integration

Put all of this in `src/lib/live/`, separate from UI.

- **Audio in:** microphone → 16 kHz, 16-bit PCM, mono. Use an AudioWorklet for resampling.
- **Audio out:** 24 kHz PCM from Gemini, played through Web Audio with a small buffer queue.
- **Transcripts:** turn on input and output transcription so the bubbles can show both sides.
- **Buddy state:** derive from the stream. User audio detected → listening. User finished, nothing back yet → thinking. Audio playing → talking.
- **Auth:** fetch an ephemeral token from `/.netlify/functions/live-token` before each call.

### Tools (function calling)

Declare these and handle them in the app:

```ts
save_word({ word, translation, example, reason, kana?, kanji?, romaji? })
  // save to Dexie, show on the word card
mark_recall({ word, remembered })
  // update the SRS schedule
set_level({ cefr_band, note })
  // update profile.level and levelNote
end_walk()
  // Buddy has wrapped up; switch to the end-of-walk quiz
```

### Context sent at the start of every call

Built from local data and filled into the system prompt below:
mother tongue, target language, level, walk number, up to 3 due words, chosen topic, and the photo (as an image part) if one was added.

### System prompt template

Store this in `src/lib/live/systemPrompt.ts` and fill the `{placeholders}`.

```
You are Buddy, a calm, warm friend the user calls while they go for a walk.
The user's mother tongue is {mother_tongue}. They are learning {target_language}.
Their current level is about {cefr_level}. This is walk number {walk_count}.

HOW YOU TALK
- Speak {target_language}. Keep replies to 1 or 2 short sentences, then hand the turn back.
- Match their level. At A1 to A2, use simple words and slow, clear sentences.
- Ask open questions about their life, their walk, and the topic below.
- Never lecture. This is a phone call with a friend, not a lesson.

WHEN THEY SWITCH TO {mother_tongue}
- Give the word or phrase in {target_language}, use it in a short sentence, and ask them to say it.
- At A1 to A2 you may explain in {mother_tongue} in one short sentence. At B1 and up, stay in {target_language}.
- Call save_word for every word you teach.

CORRECTIONS
- Do not point out mistakes. Repeat their sentence correctly as part of your reply, then continue.
- If the same mistake happens 3 times, call save_word with reason "repeated_mistake".

SPELLING AND TRANSLATION
- If they ask how to spell or what something means, answer briefly and call save_word.
- For Japanese, always fill kana, and kanji and romaji when they apply.

WORDS TO REVIEW TODAY
{due_words}
- Bring these into the conversation naturally in the first few minutes.
- Call mark_recall for each one: true if they use or understand it, false if not.

TOPIC
{topic_or_photo_notes}

TIME
- After about {walk_minutes} minutes, or when they say they're almost home, wrap up warmly.
- Then call end_walk and quiz them out loud on 3 words from today, one at a time.

FIRST CALL ONLY
- If {cefr_level} is "unknown", start very simple and slowly raise difficulty for 3 to 5 minutes.
- Then call set_level with your best estimate and a short note.
```

---

## Build phases

Stop after each phase and tell me how to test it.

1. **Scaffold + screens with fake data.** Vite, routing, tab bar, design tokens, paper background, `<Buddy>` component, all six screens with mock data. No AI yet. I want to click through it on my phone.
2. **Local data.** Dexie schema, onboarding saves the profile, Settings reads and writes it, Delete my data works.
3. **Spaced repetition + flashcards.** `srs.ts` with tests, Words screen and flashcards working with seeded test words.
4. **Token server.** Netlify function for ephemeral tokens. Tell me exactly which env variable to set in Netlify.
5. **Live call.** Audio in and out, transcripts as bubbles, Buddy states, timer, wake lock. Free talk only.
6. **Tools.** `save_word`, `mark_recall`, `set_level`, `end_walk` wired up, word card live, level call in onboarding working.
7. **Topics and photo.** Topic chips and photo upload feed the call context.
8. **Polish.** Accessibility pass (keyboard, screen reader, contrast), reduced motion, error states (no mic permission, no network, token failure), PWA manifest and icons.

---

## Known limits (don't try to solve these in the prototype)

- Mobile browsers may stop the microphone when the screen locks. Keep the screen on during calls. Pocket mode comes with the native app.
- No accounts, no sync. Everything lives on the device.
- No push notifications yet.
