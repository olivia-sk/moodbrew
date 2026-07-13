// supabase edge function: spotify-track
// looks up a spotify track id for a title and artist using the client
// credentials flow. the client id and secret only ever live on this
// server, they are never shipped to the app bundle.
//
// deploy with: supabase functions deploy spotify-track
// requires the secrets:
//   supabase secrets set SPOTIFY_CLIENT_ID=...
//   supabase secrets set SPOTIFY_CLIENT_SECRET=...
import { corsHeaders } from '../_shared/cors.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID') ?? '';
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET') ?? '';

interface SpotifyTrackRequestBody {
  title: string;
  artist: string;
}

// cached in module scope so a warm function instance can reuse the token
// instead of asking spotify for a new one on every search
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const basicAuth = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`spotify token request failed: ${response.status}`);
  }

  const json = await response.json();
  cachedToken = {
    value: json.access_token,
    // refresh a little early so we never use a token in its last second
    expiresAt: Date.now() + (json.expires_in - 30) * 1000,
  };
  return cachedToken.value;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return new Response(
      JSON.stringify({ error: 'spotify credentials are not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { title, artist } = (await req.json()) as SpotifyTrackRequestBody;
    const token = await getAccessToken();

    // strip any accidental quotation marks or brackets the llm might return
    const cleanTitle = title.replace(/['"“”]/g, '').trim();
    const cleanArtist = artist.replace(/['"“”]/g, '').trim();

    // use a broad plaintext query instead of strict track and artist filters
    const query = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!searchResponse.ok) {
      throw new Error(`spotify search failed: ${searchResponse.status}`);
    }

    const searchJson = await searchResponse.json();
    const trackId = searchJson.tracks?.items?.[0]?.id;

    if (!trackId) {
      return new Response(JSON.stringify({ error: 'no matching track found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ trackId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // the real detail (which can include raw upstream response bodies)
    // stays in the function logs, only a generic message reaches the client
    console.error('spotify-track failed:', error);
    return new Response(
      JSON.stringify({ error: 'could not look up that track right now' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
