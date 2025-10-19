import React, { useState, useEffect } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import MusicPlayer from '@/components/MusicPlayer';
import LyricsDisplay from '@/components/LyricsDisplay';
import TrackList from '@/components/TrackList';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { Track } from '@/types/music';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchTracksFromR2 } from '@/api/music';

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch tracks on component mount
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const fetchedTracks = await fetchTracksFromR2();
        setTracks(fetchedTracks);
        if (fetchedTracks.length > 0) {
          setCurrentTrack(fetchedTracks[0]);
        }
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        // Optionally show an error toast here
      } finally {
        setIsLoading(false);
      }
    };
    loadTracks();
  }, []);
  
  // Use the custom hook to manage playback state
  const playerControls = useMusicPlayer(currentTrack);
  
  const { currentTime } = playerControls;

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
  };

  const renderTrackList = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    
    if (tracks.length === 0) {
      return <p className="text-center text-muted-foreground">No tracks found.</p>;
    }

    return (
      <TrackList 
        tracks={tracks} 
        onSelectTrack={handleSelectTrack} 
        currentTrackId={currentTrack?.id || null}
      />
    );
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
                {renderTrackList()}
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
                    当前曲目列表通过模拟 API 调用加载。在实际部署中，您需要一个 Cloudflare Worker 来动态生成此列表。
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