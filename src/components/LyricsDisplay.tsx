import React, { useMemo, useRef, useEffect } from 'react';
import { parseLRC, LyricLine } from '@/lib/lrcParser';

interface LyricsDisplayProps {
  lrcContent: string;
  currentTime: number;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lrcContent, currentTime }) => {
  const parsedLyrics = useMemo(() => parseLRC(lrcContent), [lrcContent]);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-scroll effect
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;

      // Calculate the position to scroll to (center the active line)
      const offset = activeLine.offsetTop - container.offsetTop;
      const centerOffset = container.clientHeight / 2 - activeLine.clientHeight / 2;
      
      container.scrollTo({
        top: offset - centerOffset,
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  if (!lrcContent || parsedLyrics.length === 0) {
    return <div className="text-center text-muted-foreground p-4">No lyrics available.</div>;
  }

  return (
    <div ref={containerRef} className="h-64 overflow-y-auto p-4 text-center">
      <div className="flex flex-col items-center pt-24 pb-24"> {/* Added padding for centering */}
        {parsedLyrics.map((line, index) => (
          <p
            key={index}
            ref={index === activeIndex ? activeLineRef : null}
            // Removed size change (text-xl vs text-lg) to prevent layout shift
            className={`transition-colors duration-150 font-medium mb-2 px-4 text-lg ${
              index === activeIndex
                ? 'text-primary' // Only color change
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