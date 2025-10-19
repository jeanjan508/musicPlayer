/**
 * Cloudflare Worker to list tracks (FLAC) and fetch corresponding lyrics (LRC)
 * from an R2 bucket and return them as a JSON API response.
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * 1. BUCKET: R2 Bucket binding (e.g., 'music-bucket')
 * 2. R2_PUBLIC_URL_PREFIX: The public domain for your R2 bucket (e.g., 'https://pub-xxxx.r2.dev')
 */

// Helper function to extract title/artist from filename (simple example)
function parseFilename(key) {
  // Updated to handle .flac and .lrc extensions
  const filename = key.replace(/\.(flac|lrc)$/i, '');
  const parts = filename.split(' - ');
  if (parts.length === 2) {
    return { title: parts[1].trim(), artist: parts[0].trim() };
  }
  return { title: filename, artist: 'Unknown Artist' };
}

/**
 * Handles incoming requests.
 */
async function handleRequest(request, env) {
  try {
    // env contains the bindings (BUCKET, R2_PUBLIC_URL_PREFIX)
    const { BUCKET, R2_PUBLIC_URL_PREFIX } = env;

    if (!BUCKET || !R2_PUBLIC_URL_PREFIX) {
      return new Response('R2 BUCKET or R2_PUBLIC_URL_PREFIX environment variables not configured.', { status: 500 });
    }

    // 1. List all objects in the bucket
    // Note: BUCKET is expected to be an R2Bucket binding provided by the Worker environment.
    const listed = await BUCKET.list();
    const keys = listed.objects.map(obj => obj.key);

    // Filter for FLAC files
    const flacKeys = keys.filter(key => key.toLowerCase().endsWith('.flac'));
    
    const tracks = [];

    // 2. Process each FLAC file
    for (const flacKey of flacKeys) {
      // 3. Find the corresponding LRC file
      const lrcKey = flacKey.replace(/\.flac$/i, '.lrc');
      
      // 4. Try to fetch the corresponding LRC file
      const lrcObject = await BUCKET.get(lrcKey);
      
      let lyricsContent = '';
      if (lrcObject && lrcObject.body) {
        lyricsContent = await lrcObject.text();
      } else {
        console.warn(`LRC file not found for: ${flacKey}`);
        lyricsContent = '[00:00.00]No lyrics found for this track.';
      }

      // 5. Construct the track object
      const { title, artist } = parseFilename(flacKey);
      
      tracks.push({
        id: flacKey, // Use key as unique ID
        title: title,
        artist: artist,
        audioUrl: `${R2_PUBLIC_URL_PREFIX}/${flacKey}`,
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