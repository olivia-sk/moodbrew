// background api coordinator for the match card screen
// calls the tea-story and spotify-track supabase edge functions, never the
// raw anthropic or spotify apis directly, so no secret key ever ships in
// this app bundle
import { supabase } from './supabase';
import { MoodContext, Tea } from './types';

// shown if the spotify search throws or comes back empty, for example from
// an llm spelling typo in the song title or artist
export const FALLBACK_TRACK_ID = '0lBMRtbixm8tSkg1OQkEle';

// optional knobs the user can tune before asking haiku for a story
export interface UserPreferences {
  tone_style?: string;
  snack_type?: string;
  music_genre?: string;
}

export interface TeaStoryPayload {
  why_this_tea: string;
  song_title: string;
  artist: string;
  music_pairing_vibe: string;
  snack_pairing: string;
}

// the full state the match card hands off to the kettle/timer screen
export interface TeaStoryResult extends TeaStoryPayload {
  trackId: string;
}

// used if the haiku call itself fails outright, so the user is never stuck
const FALLBACK_STORY: TeaStoryPayload = {
  why_this_tea:
    'this one is a quiet, reliable favourite. good for slowing down and just being present with your cup.',
  song_title: 'cage',
  artist: 'jane remover',
  music_pairing_vibe: 'hazy bedroom production with a calm but alt whimsy ache to it',
  snack_pairing: 'rice cakes',
};

function isTeaStoryPayload(value: unknown): value is TeaStoryPayload {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.why_this_tea === 'string' &&
    typeof candidate.song_title === 'string' &&
    typeof candidate.artist === 'string' &&
    typeof candidate.music_pairing_vibe === 'string' &&
    typeof candidate.snack_pairing === 'string'
  );
}

// asks claude haiku, through the tea-story edge function, to write the card
// copy for this tea and mood. throws if the function errors or the
// response does not match the expected schema, the caller decides whether
// to fall back or show an error state
export async function fetchTeaStory(
  tea: Tea,
  moodContext: MoodContext,
  preferences?: UserPreferences,
): Promise<TeaStoryPayload> {
  const { data, error } = await supabase.functions.invoke('tea-story', {
    body: {
      teaName: tea.Name,
      flavorNotes: tea.Raw_Flavor_Notes,
      moodLabel: moodContext.moodLabel,
      craving: moodContext.craving,
      toneStyle: preferences?.tone_style ?? 'cozy and calm',
      snackType: preferences?.snack_type ?? 'any',
      musicGenre:
        preferences?.music_genre ??
        'indie, alt, bedroom pop, emo, pop punk, math rock, easycore, power pop, indie rock, hyperpop, or art rock with elements of math rock, emo, progressive rock, jazz, and power pop (vibes like glass beach and jane remover)',
    },
  });

  if (error) {
    throw new Error(`tea-story function failed: ${error.message}`);
  }

  if (!isTeaStoryPayload(data)) {
    throw new Error('tea-story function returned an unexpected shape');
  }

  return data;
}

// looks up a spotify track id for the given title and artist through the
// spotify-track edge function. this never throws, any failure (network
// error, empty search result, llm typo) resolves to the fallback track id
export async function fetchSpotifyTrackId(title: string, artist: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('spotify-track', {
      body: { title, artist },
    });

    if (error || typeof data?.trackId !== 'string' || data.trackId.length === 0) {
      return FALLBACK_TRACK_ID;
    }

    return data.trackId;
  } catch {
    return FALLBACK_TRACK_ID;
  }
}

// full pipeline for the match card screen, story first, then the spotify
// lookup for whatever song the story came back with
export async function loadTeaStory(
  tea: Tea,
  moodContext: MoodContext,
  preferences?: UserPreferences,
): Promise<TeaStoryResult> {
  let story: TeaStoryPayload;
  try {
    story = await fetchTeaStory(tea, moodContext, preferences);
  } catch {
    // the whole haiku call failed, fall back to a static story rather than
    // leaving the user with an empty card
    story = FALLBACK_STORY;
  }

  const trackId = await fetchSpotifyTrackId(story.song_title, story.artist);

  return { ...story, trackId };
}
