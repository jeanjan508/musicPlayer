export interface LyricLine {
  time: number; // Time in seconds
  text: string;
}

/**
 * Parses LRC format string into an array of LyricLine objects.
 * Format: [mm:ss.xx] Lyric text
 * @param lrcContent The raw LRC string
 * @returns An array of LyricLine objects
 */
export function parseLRC(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const lyrics: LyricLine[] = [];
  // Regex to capture [mm:ss.xx] or [mm:ss:xxx]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length > 0) {
      const text = line.replace(timeRegex, '').trim();
      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        // Pad milliseconds to 3 digits if necessary (e.g., .12 -> 120)
        const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
        
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
        
        if (text) {
          lyrics.push({
            time: timeInSeconds,
            text: text,
          });
        }
      }
    }
  }

  // Sort lyrics by time
  lyrics.sort((a, b) => a.time - b.time);
  
  return lyrics;
}