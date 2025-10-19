import { Track } from '@/types/music';

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Sample Track 1 (R2 Placeholder)',
    artist: 'Dyad AI',
    // IMPORTANT: Replace this URL with the public URL of your music file in Cloudflare R2.
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
    lyrics: `
[00:05.50]Hello, welcome to the music player.
[00:08.10]This track is streaming from a placeholder URL.
[00:12.00]We are testing the synchronized lyric display.
[00:16.50]Watch the text highlight as the music plays.
[00:20.00]This is the power of React and TypeScript.
[00:25.00]Enjoy the sound!
[00:30.00]End of sample lyrics.
`,
  },
  {
    id: '2',
    title: 'Another Sample Track',
    artist: 'Vite & React',
    // IMPORTANT: Replace this URL with the public URL of your music file in Cloudflare R2.
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
    lyrics: `
[00:01.00]This is the second track.
[00:04.00]It has different lyrics.
[00:08.00]Testing the track switching functionality.
[00:12.00]The player should update instantly.
[00:16.00]Ready for more music!
`,
  },
];