import React from 'react';
import { Track } from '@/types/music';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
  currentTrackId: string | null;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onSelectTrack, currentTrackId }) => {
  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <Card 
          key={track.id} 
          className={cn(
            "cursor-pointer transition-all duration-200 border",
            currentTrackId === track.id 
              ? 'bg-accent/50 border-primary shadow-lg' 
              : 'hover:bg-muted/50 border-transparent'
          )}
          onClick={() => onSelectTrack(track)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">{track.title}</p>
              <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
            <Button 
              size="icon" 
              variant={currentTrackId === track.id ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTrack(track);
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TrackList;