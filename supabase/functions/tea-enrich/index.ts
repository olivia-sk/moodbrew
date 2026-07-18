// supabase edge function: tea-enrich
// when a drinker types a tea the catalog doesn't know, this asks claude
// haiku to fill in the tea's profile (category, caffeine, brew specs,
// flavor notes and a mood vector on the same scale as the seeded catalog)
// and inserts it into "tea-database" as a private custom tea for that
// user. the anthropic api key only ever lives on this server.
//
// deploy with: supabase functions deploy tea-enrich
// requires the secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// custom teas are rarer than tea stories, a lower cap still leaves room
// for a whole shelf of one-off teas in a day
const DAILY_CALL_LIMIT = 10;
const FUNCTION_NAME = 'tea-enrich';

const MOOD_VECTOR_LENGTH = 6;
const MAX_TEA_NAME_LENGTH = 60;

interface TeaEnrichRequestBody {
  teaName: string;
}

interface EnrichedTeaPayload {
  is_real_tea: boolean;
  Category: string;
  Traditional_Origin: string;
  Caffeine_Level: number;
  Primary_Compounds: string;
  Raw_Flavor_Notes: string;
  Traditional_Brew_Specs: string;
  mood_vector: number[];
}

function buildPrompt(teaName: string): string {
  return `you are the tea database curator for moodbrew, a cozy tea pairing app. a drinker typed a tea that is not in our catalog yet: "${teaName}".

your job is to produce the catalog row for this tea so it can join our seeded dataset. the mood_vector must land on exactly the same scale as our existing rows.

the mood_vector has ${MOOD_VECTOR_LENGTH} dimensions, each a number from 0 to 1:
[0] calm: how much the tea settles and soothes (chamomile high, matcha low)
[1] comfort: how cozy and hugging it feels (masala chai high, sencha low)
[2] brightness: earthy at 0 up to bright, crisp, citrusy at 1
[3] focus: how much it supports clear-headed concentration (gyokuro high)
[4] intensity: how bold and punchy the sensory experience is
[5] weight: how heavy and full-bodied it sits (pu-erh high, white tea low)

calibration examples from the real catalog:
- Matcha (Green, caffeine 0.9): [0.1, 0.5, 0.5, 0.9, 0.4, 0.1]
- Masala Chai (Black, caffeine 0.65): [0.25, 0.85, 0.45, 0.5, 0.55, 0.3]
- Jasmine Dragon Pearls (Green, caffeine 0.4): [0.5, 0.65, 0.6, 0.45, 0.2, 0.1]

rules:
1. set "is_real_tea" to true only if the input plausibly names a real tea, tisane, or drinkable herbal infusion (brand blends and regional styles count). gibberish, non-drinks, or unsafe substances get false, with every other field set to an empty string, 0, or a vector of six 0s.
2. "Category" is one word like Green, Black, Oolong, White, Herbal, Rooibos, Pu-erh, Blend.
3. "Caffeine_Level" is 0 to 1 where 0 is caffeine free and 0.9 is matcha-strength. herbal tisanes are almost always 0.
4. "Raw_Flavor_Notes" is 4 to 6 lowercase comma separated tasting notes.
5. "Primary_Compounds" lists the notable compounds, comma separated.
6. "Traditional_Brew_Specs" follows the catalog format, like "85C, 120s, 3g per 200ml".
7. "Traditional_Origin" is the traditional growing region or "Blend" origins.
8. every mood_vector element is a number between 0 and 1 inclusive.

respond with strict minified json only, no markdown, no code fences, no commentary, matching exactly this shape:
{"is_real_tea":true,"Category":"string","Traditional_Origin":"string","Caffeine_Level":0.5,"Primary_Compounds":"string","Raw_Flavor_Notes":"string","Traditional_Brew_Specs":"string","mood_vector":[0,0,0,0,0,0]}`;
}

// haiku sometimes wraps json in a markdown code fence even when told not to, strip it defensively
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

function isValidMoodVector(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === MOOD_VECTOR_LENGTH &&
    value.every(
      (entry) => typeof entry === 'number' && Number.isFinite(entry) && entry >= 0 && entry <= 1,
    )
  );
}

function isEnrichedTeaPayload(value: unknown): value is EnrichedTeaPayload {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.is_real_tea === 'boolean' &&
    typeof candidate.Category === 'string' &&
    typeof candidate.Traditional_Origin === 'string' &&
    typeof candidate.Caffeine_Level === 'number' &&
    Number.isFinite(candidate.Caffeine_Level) &&
    candidate.Caffeine_Level >= 0 &&
    candidate.Caffeine_Level <= 1 &&
    typeof candidate.Primary_Compounds === 'string' &&
    typeof candidate.Raw_Flavor_Notes === 'string' &&
    typeof candidate.Traditional_Brew_Specs === 'string' &&
    isValidMoodVector(candidate.mood_vector)
  );
}

// reads the caller's user id straight out of the jwt payload. verify_jwt
// is on for this function, so the edge runtime already checked the token
function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const segments = token.split('.');
  if (segments.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(segments[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'ANTHROPIC_API_KEY is not configured' }, 500);
  }

  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return jsonResponse({ error: 'could not identify the signed in user' }, 401);
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabaseAdmin
    .from('ai_call_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('function_name', FUNCTION_NAME)
    .gte('created_at', since);

  if (countError) {
    // the rate limit check itself failing should not take down the
    // feature, log it and fail open rather than blocking every request
    console.error('tea-enrich rate limit check failed:', countError);
  } else if ((count ?? 0) >= DAILY_CALL_LIMIT) {
    return jsonResponse(
      { error: 'daily limit reached for custom teas, try again tomorrow' },
      429,
    );
  }

  try {
    const body = (await req.json()) as TeaEnrichRequestBody;
    const teaName = typeof body.teaName === 'string' ? body.teaName.trim() : '';
    if (!teaName || teaName.length > MAX_TEA_NAME_LENGTH) {
      return jsonResponse({ error: 'please enter a tea name up to 60 characters' }, 400);
    }

    // if a tea with this name is already visible to the user (catalog or
    // their own custom row), hand it back instead of burning an ai call.
    // this lookup runs as service role and so also sees other users'
    // private teas, which must never be handed back, hence the explicit
    // created_by filter below
    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from('tea-database')
      .select('*')
      .ilike('Name', teaName)
      .limit(5);
    if (existingError) {
      console.error('tea-enrich existing lookup failed:', existingError);
    }
    const visibleExisting = (existingRows ?? []).find(
      (row) => row.created_by === null || row.created_by === userId,
    );
    if (visibleExisting) {
      return jsonResponse({ tea: visibleExisting, alreadyExisted: true });
    }
    // another user's private tea holds this exact name, suffix ours so the
    // unique index on "Name" stays intact
    const nameTaken = (existingRows ?? []).some(
      (row) => row.Name.toLowerCase() === teaName.toLowerCase(),
    );
    const finalName = nameTaken ? `${teaName} (${userId.slice(0, 4)})` : teaName;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        messages: [{ role: 'user', content: buildPrompt(teaName) }],
      }),
    });

    if (!anthropicResponse.ok) {
      const detail = await anthropicResponse.text();
      throw new Error(`anthropic request failed: ${anthropicResponse.status} ${detail}`);
    }

    const anthropicJson = await anthropicResponse.json();
    const rawText = anthropicJson.content?.[0]?.text ?? '';
    const parsed = JSON.parse(stripCodeFence(rawText));

    if (!isEnrichedTeaPayload(parsed)) {
      throw new Error('haiku response did not match the expected schema');
    }

    if (!parsed.is_real_tea) {
      return jsonResponse(
        { error: 'that does not look like a tea we can brew, double check the name' },
        422,
      );
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('tea-database')
      .insert({
        Name: finalName,
        Category: parsed.Category,
        Traditional_Origin: parsed.Traditional_Origin,
        Caffeine_Level: parsed.Caffeine_Level,
        Primary_Compounds: parsed.Primary_Compounds,
        Raw_Flavor_Notes: parsed.Raw_Flavor_Notes,
        Traditional_Brew_Specs: parsed.Traditional_Brew_Specs,
        mood_vector: parsed.mood_vector,
        created_by: userId,
        is_custom: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`could not save the custom tea: ${insertError.message}`);
    }

    // only a successful generation counts against the daily limit
    const { error: logError } = await supabaseAdmin
      .from('ai_call_log')
      .insert({ user_id: userId, function_name: FUNCTION_NAME });
    if (logError) {
      console.error('tea-enrich call logging failed:', logError);
    }

    return jsonResponse({ tea: inserted, alreadyExisted: false });
  } catch (error) {
    // the real detail stays in the function logs, only a generic message
    // reaches the client
    console.error('tea-enrich failed:', error);
    return jsonResponse({ error: 'could not add that tea right now, try again in a moment' }, 502);
  }
});
