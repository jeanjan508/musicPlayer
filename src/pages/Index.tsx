import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTracksFromR2 } from '@/api/music';
import { Track } from '@/types/music';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import MusicPlayer from '@/components/MusicPlayer';
import LyricsDisplay from '@/components/LyricsDisplay';
import TrackList from '@/components/TrackList';
import UploadForm from '@/components/UploadForm'; // Import the new component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Upload } from 'lucide-react';

const Index: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch tracks using React Query
  const { data: tracks, isLoading, error } = useQuery<Track[]>({
    queryKey: ['tracks'],
    queryFn: fetchTracksFromR2,
  });

  // Initialize player controls for the current track
  const playerControls = useMusicPlayer(currentTrack);

  // Automatically select the first track if none is selected and tracks are loaded
  useEffect(() => {
    if (!currentTrack && tracks && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
  }, [tracks, currentTrack]);

  const handleSelectTrack = (track: Track) => {
    // If selecting a new track, set it and pause playback temporarily
    if (currentTrack?.id !== track.id) {
      setCurrentTrack(track);
      // The useMusicPlayer hook handles loading the new track and resetting state
    } else {
      // If selecting the current track, toggle play/pause
      playerControls.togglePlayPause();
    }
  };
  
  const handleUploadSuccess = () => {
    // Close the dialog
    setIsUploadDialogOpen(false);
    // Invalidate the tracks query to refetch the list, showing the new track
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-center">Music Player</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Tracks</AlertTitle>
            <AlertDescription>
              Failed to fetch music tracks. Please ensure your Cloudflare Worker API is deployed and the URL is correctly configured in the VITE_WORKER_API_URL environment variable.
              <p className="mt-2 text-sm text-red-200">Details: {error.message}</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pb-32"> {/* pb-32 for player space */}
      <div className="w-full max-w-4xl space-y-8 pt-8">
        <header className="flex justify-between items-center pb-4 border-b border-border/50">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">Music Player</h1>
            <p className="text-muted-foreground mt-1 text-sm">Synchronized lyrics powered by Cloudflare R2 & Workers.</p>
          </div>
          
          {/* Upload Button */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="shadow-md">
                <Upload className="w-4 h-4 mr-2" />
                上传曲目
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>上传新曲目</DialogTitle>
              </DialogHeader>
              <UploadForm onUploadSuccess={handleUploadSuccess} />
            </DialogContent>
          </Dialog>
        </header>
        
        {/* Lyrics Display Card */}
        <Card className="shadow-xl border-2 border-primary/10">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-center text-xl font-semibold">
              {currentTrack ? `${currentTrack.title} - ${currentTrack.artist}` : 'Select a Track'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentTrack && currentTrack.lyrics ? (
              <LyricsDisplay 
                lrcContent={currentTrack.lyrics} 
                currentTime={playerControls.currentTime} 
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No lyrics available for this track.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Track List Card */}
        <Card>
          <CardHeader>
            <CardTitle>歌曲列表 ({tracks?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {tracks && (
              <TrackList 
                tracks={tracks} 
                onSelectTrack={handleSelectTrack} 
                currentTrackId={currentTrack?.id || null}
                isPlaying={playerControls.isPlaying} // Pass isPlaying state
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Fixed Music Player */}
      <MusicPlayer 
        track={currentTrack} 
        {...playerControls} 
      />
    </div>
  );
};

export default Index;