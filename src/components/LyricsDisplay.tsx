import React, { useMemo } from 'react';
import { parseLRC, LyricLine } from '@/lib/lrcParser';

interface LyricsDisplayProps {
  lrcContent: string;
  currentTime: number;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lrcContent, currentTime }) => {
  const parsedLyrics = useMemo(() => parseLRC(lrcContent), [lrcContent]);
  
  // Find the index of the currently active lyric line
  const activeIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      // Check if the current time is greater than or equal to the line start time
      // and less than the next line's start time (or it's the last line)
      if (parsedLyrics[i].time <= currentTime) {
        index = i;
      } else {
        // Since lyrics are sorted by time, we can stop searching
        break;
      }
    }
    return index;
  }, [currentTime, parsedLyrics]);

  if (!lrcContent || parsedLyrics.length === 0) {
    return <div className="text-center text-muted-foreground p-4">No lyrics available.</div>;
  }

  return (
    <div className="h-64 overflow-y-auto p-4 text-center">
      <div className="flex flex-col items-center">
        {parsedLyrics.map((line, index) => (
          <p
            key={index}
            className={`transition-colors duration-300 text-lg font-medium mb-2 ${
              index === activeIndex
                ? 'text-primary scale-105'
                : 'text-muted-foreground'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LyricsDisplay;