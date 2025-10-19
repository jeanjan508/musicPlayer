import React, { useState } from 'react';
import Player from '@/components/Player';
import LyricsDisplay from '@/components/LyricsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Example LRC content for demonstration
const exampleLRC = `
[ti:Example Song]
[ar:Example Artist]
[al:Example Album]
[00:01.00]Hello, this is the first line.
[00:03.50]This is the second line, slightly longer.
[00:06.00]And here is the third line, testing the centering.
[00:09.00]We are now moving to the fourth line.
[00:12.00]The fifth line continues the song flow.
[00:15.00]Sixth line, testing smooth transition.
[00:18.00]Seventh line, almost done with the example.
[00:21.00]Eighth line, preparing for the end.
[00:24.00]Ninth line, final words.
[00:27.00]End of the song example.
`;

const Index: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Music Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <LyricsDisplay lrcContent={exampleLRC} currentTime={currentTime} />
            <Player
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              duration={30} // Example duration
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;