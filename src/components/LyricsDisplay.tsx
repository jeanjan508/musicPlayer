import React, { useMemo } from 'react';
import { parseLRC } from '@/lib/lrcParser';

interface LyricsDisplayProps {
  lrcContent: string;
  currentTime: number;
}

// Constants for layout calculation (must match Tailwind classes)
// h-64 = 256px
const CONTAINER_HEIGHT_PX = 256; 
// Approximate height of a lyric line (text-lg + margin/padding)
// We enforce a fixed height for calculation accuracy.
const LINE_HEIGHT_PX = 36; 

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lrcContent, currentTime }) => {
  const parsedLyrics = useMemo(() => parseLRC(lrcContent), [lrcContent]);
  
  // Find the index of the currently active lyric line
  const activeIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].time <= currentTime) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [currentTime, parsedLyrics]);

  if (!lrcContent || parsedLyrics.length === 0) {
    return <div className="text-center text-muted-foreground p-4">No lyrics available.</div>;
  }

  // Calculate the Y translation needed to center the active line (index * LINE_HEIGHT_PX)
  // Center position: CONTAINER_HEIGHT_PX / 2
  // Offset needed to center the active line: (CONTAINER_HEIGHT_PX / 2) - (LINE_HEIGHT_PX / 2)
  const centerOffset = (CONTAINER_HEIGHT_PX / 2) - (LINE_HEIGHT_PX / 2); // 110px

  // Total translation: Shift up by the height of all preceding lines, then adjust for centering.
  // We use a negative value for translateY to shift the content up.
  const translateY = activeIndex * LINE_HEIGHT_PX - centerOffset;
  
  const transformStyle: React.CSSProperties = {
    // Apply the calculated translation
    transform: `translateY(${-translateY}px)`,
    // Increased duration to 0.4s and using ease-in-out for a more noticeable buffer effect
    transition: 'transform 0.4s ease-in-out', 
  };

  return (
    // Outer container: fixed height, hides overflow, relative for absolute overlays
    <div className="h-64 overflow-hidden relative bg-card">
      {/* Inner container: applies the smooth vertical translation */}
      <div 
        className="flex flex-col items-center w-full" 
        style={transformStyle}
      >
        {parsedLyrics.map((line, index) => (
          <p
            key={index}
            // Enforce fixed height for accurate calculation and centering
            className={`font-medium px-4 text-lg text-center h-[36px] flex items-center justify-center transition-colors duration-150 whitespace-nowrap ${
              index === activeIndex
                ? 'text-primary'
                : 'text-muted-foreground opacity-70'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
      
      {/* Subtle gradient overlays for fading effect */}
      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-card to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </div>
  );
};

export default LyricsDisplay;