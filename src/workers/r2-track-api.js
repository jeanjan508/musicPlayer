/**
 * Cloudflare Worker to list tracks (MP3) and fetch corresponding lyrics (LRC)
 * from an R2 bucket and return them as a JSON API response.
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * 1. BUCKET: R2 Bucket binding (e.g., 'music-bucket')
 * 2. R2_PUBLIC_URL_PREFIX: The public domain for your R2 bucket (e.g., 'https://pub-xxxx.r2.dev')
 */

// Define the expected structure for the frontend
interface Track {
  id: string;
  title: string;
  artist: string; // Placeholder, derived from filename or metadata
  audioUrl: string;
  lyrics: string;
}

// Helper function to extract title/artist from filename (simple example)
function parseFilename(key: string): { title: string; artist: string } {
  const filename = key.replace(/\.(mp3|lrc)$/i, '');
  const parts = filename.split(' - ');
  if (parts.length === 2) {
    return { title: parts[1].trim(), artist: parts[0].trim() };
  }
  return { title: filename, artist: 'Unknown Artist' };
}

async function handleRequest(request: Request, env: { BUCKET: R2Bucket, R2_PUBLIC_URL_PREFIX: string }): Promise<Response> {
  try {
    const { BUCKET, R2_PUBLIC_URL_PREFIX } = env;

    if (!BUCKET || !R2_PUBLIC_URL_PREFIX) {
      return new Response('R2 BUCKET or R2_PUBLIC_URL_PREFIX environment variables not configured.', { status: 500 });
    }

    // 1. List all objects in the bucket
    const listed = await BUCKET.list();
    const keys = listed.objects.map(obj => obj.key);

    const mp3Keys = keys.filter(key => key.toLowerCase().endsWith('.mp3'));
    
    const tracks: Track[] = [];

    // 2. Process each MP3 file
    for (const mp3Key of mp3Keys) {
      const lrcKey = mp3Key.replace(/\.mp3$/i, '.lrc');
      
      // 3. Try to fetch the corresponding LRC file
      const lrcObject = await BUCKET.get(lrcKey);
      
      let lyricsContent = '';
      if (lrcObject) {
        lyricsContent = await lrcObject.text();
      } else {
        console.warn(`LRC file not found for: ${mp3Key}`);
        lyricsContent = '[00:00.00]No lyrics found for this track.';
      }

      // 4. Construct the track object
      const { title, artist } = parseFilename(mp3Key);
      
      tracks.push({
        id: mp3Key, // Use key as unique ID
        title: title,
        artist: artist,
        audioUrl: `${R2_PUBLIC_URL_PREFIX}/${mp3Key}`,
        lyrics: lyricsContent,
      });
    }

    return new Response(JSON.stringify(tracks), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // IMPORTANT: Set CORS header for frontend access
      },
    });

  } catch (error) {
    console.error('Worker error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export default {
  fetch: handleRequest,
};