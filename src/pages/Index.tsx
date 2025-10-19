import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import MusicPlayer from '@/components/MusicPlayer';
import LyricsDisplay from '@/components/LyricsDisplay';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { Track } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// --- Mock Data ---
// NOTE: 请将 audioUrl 替换为您 Cloudflare R2 存储桶中音乐文件的实际可访问 URL。
const MOCK_TRACK: Track = {
  id: '1',
  title: 'Sample Track',
  artist: 'Dyad AI',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // 占位符 URL
  lyrics: `
[00:05.50]Hello, welcome to the music player.
[00:08.10]This track is streaming from a placeholder URL.
[00:12.00]We are testing the synchronized lyric display.
[00:16.50]Watch the text highlight as the music plays.
[00:20.00]This is the power of React and TypeScript.
[00:25.00]Enjoy the sound!
[00:30.00]End of sample lyrics.
`,
};

const Index = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_TRACK);
  
  // Use the custom hook to manage playback state
  const playerControls = useMusicPlayer(currentTrack);
  
  const { currentTime } = playerControls;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="container mx-auto p-4 pt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Cloudflare R2 Music Player (Web)
        </h1>

        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle className="text-center">
                {currentTrack ? `${currentTrack.title} - ${currentTrack.artist}` : 'No Track Selected'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTrack ? (
                <LyricsDisplay 
                  lrcContent={currentTrack.lyrics} 
                  currentTime={currentTime} 
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Load a track to see lyrics here.
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  注意: 音频流依赖于提供的 URL 是否可公开访问，或是否为 R2 存储桶生成的有效预签名 URL。
                </p>
                <Button 
                  onClick={() => setCurrentTrack(MOCK_TRACK)} 
                  variant="outline" 
                  className="mt-4"
                >
                  Load Sample Track
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Persistent Music Player */}
      <MusicPlayer 
        track={currentTrack} 
        {...playerControls} 
      />
      
      <MadeWithDyad />
    </div>
  );
};

export default Index;