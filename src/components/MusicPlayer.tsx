import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Track } from '@/types/music';
import { cn } from '@/lib/utils';
import { PlaybackMode } from '@/hooks/usePlaylist'; // Import PlaybackMode type

interface MusicPlayerControls {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  togglePlayPause: () => void;
  handleSeek: (time: number) => void;
  handleVolumeChange: (newVolume: number) => void;
  toggleMute: () => void;
}

interface PlaylistControls {
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
}

interface MusicPlayerProps extends MusicPlayerControls, PlaylistControls {
  track: Track | null;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  track, 
  isPlaying, 
  currentTime, 
  duration, 
  volume, 
  isMuted, 
  audioRef, 
  togglePlayPause, 
  handleSeek, 
  handleVolumeChange, 
  toggleMute,
  playNextTrack,
  playPreviousTrack,
  playbackMode,
  setPlaybackMode,
}) => {

  const handleSliderSeek = (value: number[]) => {
    handleSeek(value[0]);
  };

  const handleSliderVolumeChange = (value: number[]) => {
    // Convert slider value (0-100) to volume (0-1)
    handleVolumeChange(value[0] / 100);
  };
  
  const togglePlaybackMode = () => {
    // Simple toggle between sequential and loop for now
    setPlaybackMode(playbackMode === 'sequential' ? 'loop' : 'sequential');
  };

  if (!track) {
    return (
      <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-t bg-card shadow-2xl">
        <CardContent className="flex items-center justify-center p-4 h-20">
          <p className="text-muted-foreground">Select a track to start playing.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-t bg-card shadow-2xl">
      <CardContent className="flex items-center justify-between p-4 h-20">
        
        {/* Audio Element (Hidden) */}
        <audio
          ref={audioRef}
          preload="metadata"
        />

        {/* Track Info (Left) */}
        <div className="flex items-center w-1/4 min-w-0 group cursor-default">
          <div className="h-12 w-12 bg-primary/10 rounded-lg mr-3 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/20">
            {/* Placeholder for Album Art - Using a music icon */}
            <Volume2 className="h-5 w-5" />
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
          </div>
        </div>

        {/* Controls and Progress (Center) */}
        <div className="flex flex-col items-center w-1/2 px-4">
          
          {/* Controls */}
          <div className="flex space-x-6 mb-2 items-center">
            
            {/* Playback Mode Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 transition-colors",
                playbackMode === 'loop' ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-primary'
              )}
              onClick={togglePlaybackMode}
              title={playbackMode === 'loop' ? 'Loop Playlist' : 'Sequential Play'}
            >
              {/* Using Repeat icon for loop/sequential */}
              <Repeat className="h-4 w-4" />
            </Button>

            {/* Previous Track */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
              onClick={playPreviousTrack}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            {/* Play/Pause */}
            <Button 
              variant="default" 
              size="icon" 
              className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </Button>
            
            {/* Next Track */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
              onClick={playNextTrack}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            {/* Placeholder for future features (e.g., Shuffle) */}
            <div className="h-8 w-8"></div> 
          </div>

          {/* Progress Bar */}
          <div className="flex items-center w-full space-x-3">
            <span className="text-xs text-muted-foreground w-8 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 0}
              step={0.1}
              onValueChange={handleSliderSeek}
              className="w-full cursor-pointer"
              disabled={duration === 0}
            />
            <span className="text-xs text-muted-foreground w-8 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control (Right) */}
        <div className="flex items-center justify-end w-1/4 space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" onClick={toggleMute}>
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={handleSliderVolumeChange}
            className="w-24 cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicPlayer;