/**
 * Cloudflare Worker to list tracks (FLAC) and fetch corresponding lyrics (LRC)
 * from an R2 bucket and return them as a JSON API response.
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * 1. BUCKET: R2 Bucket binding (e.g., 'music-bucket') - Must have Read/Write permissions
 * 2. R2_PUBLIC_URL_PREFIX: The public domain for your R2 bucket (e.g., 'https://pub-xxxx.r2.dev')
 */

// Helper function to extract title/artist from filename (simple example)
function parseFilename(key) {
  // Updated to handle .flac and .lrc extensions
  const filenameWithExtensionRemoved = key.replace(/\.(flac|lrc|mp3|wav)$/i, '');
  
  // Extract base filename, ignoring directory path if present
  const lastSlashIndex = filenameWithExtensionRemoved.lastIndexOf('/');
  const baseFilename = lastSlashIndex !== -1 ? filenameWithExtensionRemoved.substring(lastSlashIndex + 1) : filenameWithExtensionRemoved;

  // Assuming format: Title - Artist (split by space-hyphen-space)
  const parts = baseFilename.split(' - ');
  if (parts.length === 2) {
    // User specified format is Title - Artist
    return { title: parts[0].trim(), artist: parts[1].trim() };
  }
  // Fallback if format is not matched
  return { title: baseFilename, artist: 'Unknown Artist' };
}

/**
 * Handles GET request to list tracks.
 */
async function handleGetRequest(env) {
    const { BUCKET, R2_PUBLIC_URL_PREFIX } = env;

    // 1. List all objects in the bucket
    const listed = await BUCKET.list();
    const keys = listed.objects.map(obj => obj.key);

    // Filter for common audio files (FLAC, MP3, WAV)
    const audioKeys = keys.filter(key => key.toLowerCase().match(/\.(flac|mp3|wav)$/));
    
    const tracks = [];

    // 2. Process each audio file
    for (const audioKey of audioKeys) {
      // Determine the corresponding lyric key (e.g., .flac -> .lrc)
      const lrcKey = audioKey.replace(/\.(flac|mp3|wav)$/i, '.lrc');
      
      // 3. Try to fetch the corresponding LRC file
      const lrcObject = await BUCKET.get(lrcKey);
      
      let lyricsContent = '';
      if (lrcObject && lrcObject.body) {
        lyricsContent = await lrcObject.text();
      } else {
        console.warn(`LRC file not found for: ${audioKey}`);
        lyricsContent = '[00:00.00]No lyrics found for this track.';
      }

      // 4. Construct the track object
      const { title, artist } = parseFilename(audioKey);
      
      tracks.push({
        id: audioKey, // Use key as unique ID
        title: title,
        artist: artist,
        audioUrl: `${R2_PUBLIC_URL_PREFIX}/${audioKey}`,
        lyrics: lyricsContent,
      });
    }

    return new Response(JSON.stringify(tracks), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
}

/**
 * Handles POST request to upload files.
 */
async function handlePostRequest(request, env) {
    const { BUCKET } = env;
    
    // Parse the multipart form data
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const lrcFile = formData.get('lyrics');

    if (!audioFile || !lrcFile || !(audioFile instanceof File) || !(lrcFile instanceof File)) {
        return new Response('Missing audio or lyrics file in form data.', { status: 400 });
    }

    // 1. Upload Audio File
    const audioKey = audioFile.name;
    await BUCKET.put(audioKey, audioFile.stream(), {
        httpMetadata: { contentType: audioFile.type },
    });

    // 2. Upload Lyrics File
    const lrcKey = lrcFile.name;
    await BUCKET.put(lrcKey, lrcFile.stream(), {
        httpMetadata: { contentType: 'text/plain; charset=utf-8' },
    });

    return new Response(JSON.stringify({ 
        message: 'Files uploaded successfully', 
        audioKey, 
        lrcKey 
    }), {
        status: 200,
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}

/**
 * Handles incoming requests.
 */
async function handleRequest(request, env) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const { BUCKET, R2_PUBLIC_URL_PREFIX } = env;

    if (!BUCKET || !R2_PUBLIC_URL_PREFIX) {
      return new Response('R2 BUCKET or R2_PUBLIC_URL_PREFIX environment variables not configured.', { status: 500 });
    }

    if (request.method === 'POST') {
      return handlePostRequest(request, env);
    } else if (request.method === 'GET') {
      return handleGetRequest(env);
    } else {
      return new Response('Method Not Allowed', { status: 405 });
    }

  } catch (error) {
    console.error('Worker error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

export default {
  fetch: handleRequest,
};