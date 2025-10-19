import React, { useState, useEffect } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import MusicPlayer from '@/components/MusicPlayer';
import LyricsDisplay from '@/components/LyricsDisplay';
import TrackList from '@/components/TrackList';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { Track } from '@/types/music';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TRACKS } from '@/data/tracks';

const Index = () => {
  // Initialize with the first track or null
  const [currentTrack, setCurrentTrack] = useState<Track | null>(TRACKS[0] || null);
  
  // Use the custom hook to manage playback state
  const playerControls = useMusicPlayer(currentTrack);
  
  const { currentTime } = playerControls;

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
    // Automatically try to play the new track
    // Note: Autoplay might be blocked by browsers, but the hook handles loading the new source.
    // We rely on the user clicking play on the MusicPlayer component.
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="container mx-auto p-4 pt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Cloudflare R2 Music Player (Web)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Track List (Left Column) */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Tracks</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackList 
                  tracks={TRACKS} 
                  onSelectTrack={handleSelectTrack} 
                  currentTrackId={currentTrack?.id || null}
                />
              </CardContent>
            </Card>
          </div>

          {/* Lyrics Display (Right Column) */}
          <div className="lg:col-span-2">
            <Card>
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
                    Select a track from the list to view lyrics.
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    音频流直接指向您在 `src/data/tracks.ts` 中配置的 R2 公共 URL。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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