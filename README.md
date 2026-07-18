# MoodBrew

A cozy tea companion app. Tell it how you are feeling and it matches you with a tea from your own pantry, brews it with you on a timer, pairs the cup with a song and a snack, and gives you a journal to record the session.

## Features

- **Mood matching**: pick up to three feelings and let the craving sliders fine tune the match for brightness, body, spice, and sweetness. Your best shelf tea is found through cosine similarity over six dimensional mood vectors, using math.
- **Pantry shelf**: a 16 slot cabinet of your real teas, with a separate wishlist shelf for future brews.
- **Custom teas**: when a search cannot find your tea, Claude Haiku builds its profile (caffeine, brew specs, flavour notes, mood vector) and saves it as a private entry.
- **Discovery mode**: swipe through teas outside your pantry and shelve the ones you want to try.
- **Brew flow**: a match card with AI written copy on why the tea fits, a steep timer based on real brew specs, then song and snack pairings.
- **Journal**: log tasting notes, flavours, thoughts, and a mood check-in after every brew.
- **Profile**: steep levels and badges derived from your activity, alongside your brew stats.

## Tech stack

- **App**: React Native and Expo (TypeScript). Styling is a mix of NativeWind/Tailwind and plain StyleSheets
- **Backend**: Supabase, meaning Postgres with row level security, plus auth and edge functions
- **AI**: Claude Haiku through the `tea-story` and `tea-enrich` edge functions. Your Anthropic key stays in Supabase secrets and never ships in the app bundle
- **Other**: Spotify embed for song pairings, react-native-svg, bun as the package manager
- **Fonts**: Golden Goose (local serif) and IBM Plex Mono

## Getting started

1. Install dependencies:

   ```
   bun install
   ```

2. Create a `.env` in the project root:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=<your publishable key>
   ```

3. Run it:

   ```
   bun run start        # expo dev server (scan the QR with Expo Go)
   bun run web          # run in the browser
   bun run ios          # ios simulator
   bun run android      # android emulator
   ```

## Supabase setup

- SQL for tables and policies lives in `supabase/sql/`. Run the files in the Supabase SQL editor. Note that the tea catalogue table is named `tea-database` and is seeded separately from the data sheet.
- Edge functions live in `supabase/functions/`. Deploy with:

  ```
  supabase functions deploy tea-story
  supabase functions deploy tea-enrich
  supabase functions deploy spotify-track
  ```

- Required secrets:

  ```
  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
  supabase secrets set SPOTIFY_CLIENT_ID=...
  supabase secrets set SPOTIFY_CLIENT_SECRET=...
  ```

## Notes

- Matching is deliberately transparent. Every tea and every emotion is a vector of six numbers (calm, comfort, brightness, focus, intensity, weight) and the winner is the highest cosine similarity. Tune the emotion vectors in `lib/moodVectors.ts`.
- AI calls are rate limited per user per day and logged in the `ai_call_log` table.
