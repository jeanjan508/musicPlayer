import React from 'react';
import { Track } from '@/types/music';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react'; // Added Pause icon
import { cn } from '@/lib/utils';

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
  currentTrackId: string | null;
  isPlaying: boolean; // Added isPlaying prop to show Pause icon if active and playing
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onSelectTrack, currentTrackId, isPlaying }) => {
  return (
    <div className="space-y-3">
      {tracks.map((track) => {
        const isActive = currentTrackId === track.id;
        
        return (
          <Card 
            key={track.id} 
            className={cn(
              "cursor-pointer transition-all duration-300 border-2",
              isActive 
                ? 'bg-primary/10 border-primary shadow-md transform scale-[1.01]' // More subtle active background, stronger border
                : 'hover:bg-muted/70 border-transparent hover:border-border/50' // Clearer hover effect
            )}
            onClick={() => onSelectTrack(track)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <p className={cn("text-base font-semibold truncate", isActive && "text-primary")}>{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              <Button 
                size="icon" 
                variant={isActive ? "default" : "outline"}
                className={cn(isActive && "bg-primary hover:bg-primary/90")}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTrack(track);
                }}
              >
                {isActive && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TrackList;