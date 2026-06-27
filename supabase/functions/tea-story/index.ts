// supabase edge function: tea-story
// calls claude haiku to write the "why this tea" card copy plus a paired
// song, snack and scent. the anthropic api key only ever lives on this
// server, it is never shipped to the app bundle.
//
// deploy with: supabase functions deploy tea-story
// requires the secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import { corsHeaders } from '../_shared/cors.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';

interface TeaStoryRequestBody {
  teaName: string;
  flavorNotes: string;
  moodLabel: string | null;
  craving: number;
  toneStyle?: string;
  snackType?: string;
  musicGenre?: string;
}

interface TeaStoryPayload {
  why_this_tea: string;
  song_title: string;
  artist: string;
  music_pairing_vibe: string;
  snack_pairing: string;
}

function buildPrompt(body: TeaStoryRequestBody): string {
  const moodLine = body.moodLabel
    ? `the drinker tapped the mood button "${body.moodLabel}"`
    : 'the drinker did not pick a specific mood button';
  const cravingLine =
    body.craving < 0.4
      ? 'they slid the craving dial toward earthy'
      : body.craving > 0.6
      ? 'they slid the craving dial toward bright'
      : 'they left the craving dial near neutral';

  // user tuning knobs, safely defaulted when the client omits them
  const toneStyle = body.toneStyle ?? 'straightforward, friendly, and cozy';
  const snackType = body.snackType ?? 'any';
  const musicGenre =
    body.musicGenre ??
    'indie, alt, bedroom pop, emo, pop punk, math rock, indie rock, hyperpop, dream pop, alt-pop, or indie soul (vibes like glass beach, origami angels, jane remover, phoebe bridgers, ethel cain, the marias, caroline polachek, beabadoobee, clairo, and julia wolf)';

  return `you are a deeply knowledgeable, friendly, and low key tea sommelier for moodbrew, a cozy tea app. you speak like a calm, grounded friend talking to someone in their kitchen, not a brand and not an influencer.

the matched tea is "${body.teaName}" with flavor notes: ${body.flavorNotes}.
${moodLine}, and ${cravingLine}.

your job is to write the copy for the match card. the tone must be:
${toneStyle}. it should read as warm, comforting, and naturally poetic. it must feel real and human, never corporate, and it must never try to mimic internet slang or chase a forced trend.

forbidden words and phrases, do not use any of these anywhere in your response, in any case or spelling:
"gets it", "pick a lane", "low-key", "low key", "valid", "chief", "slaps".

forbidden music styles, do not ever recommend tracks from these genres: hip hop, rap, r&b, country, heavy metal, mainstream top 40, or legacy radio hits. absolutely no artists like warren g.

rules:
1. for "why_this_tea": write 2 to 3 short, natural sentences, with a hard maximum of 35 words total and a minimum of 32 words. focus entirely on the raw physical experience of drinking this tea, things like the flavor notes, the warmth of the cup, or the slow unraveling of the leaves as it steeps. use canadian spelling throughout, meaning verbs like analyze and organize end in "ize" rather than "ise".
2. do not use any em dashes or structural dashes anywhere in the strings. keep the phrasing smooth and fluid.
3. for "song_title" and "artist": pick a real, specific song that fits the requested genres or is by an artist similar in style, scene, and vibe to our benchmark lineup: glass beach, origami angels, jane remover, phoebe bridgers, ethel cain, the marias, caroline polachek, beabadoobee, clairo, or julia wolf. it does not have to be limited to these exact names, but the track must stay strictly inside their alternative, indie, math rock, hyperpop, dream pop, or emo sonic universes.
4. for "music_pairing_vibe": detail the specific musical instruments and production quirks of the song you picked, things like midi glitches, sudden tempo changes, or twinkling guitars, that tie it directly to this underground music universe. write it in the same warm and human tone, with none of the forbidden words above.
5. for "snack_pairing": pick something specific and comforting, limited to this kind of snack: ${snackType}.

respond with strict minified json only, no markdown, no code fences, no commentary,
matching exactly this shape:
{"why_this_tea":"string","song_title":"string","artist":"string","music_pairing_vibe":"string","snack_pairing":"string"}`;
}

// haiku sometimes wraps json in a markdown code fence even when told not to, strip it defensively
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = (await req.json()) as TeaStoryRequestBody;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 200,
        messages: [{ role: 'user', content: buildPrompt(body) }],
      }),
    });

    if (!anthropicResponse.ok) {
      const detail = await anthropicResponse.text();
      throw new Error(`anthropic request failed: ${anthropicResponse.status} ${detail}`);
    }

    const anthropicJson = await anthropicResponse.json();
    const rawText = anthropicJson.content?.[0]?.text ?? '';
    const parsed = JSON.parse(stripCodeFence(rawText));

    if (!isTeaStoryPayload(parsed)) {
      throw new Error('haiku response did not match the expected schema');
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
