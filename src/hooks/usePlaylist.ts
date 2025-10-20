import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Track } from '@/types/music';
import { useMusicPlayer } from './useMusicPlayer';

export type PlaybackMode = 'sequential' | 'loop' | 'repeat-one';

interface PlaylistControls {
  currentTrack: Track | null;
  currentTrackIndex: number;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
  togglePlaybackMode: () => void; // New function for easy toggling
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  selectTrackByIndex: (index: number) => void;
  playerControls: ReturnType<typeof useMusicPlayer>;
}

export const usePlaylist = (tracks: Track[]): PlaylistControls => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('sequential');
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false); 
  
  const currentTrack = useMemo(() => {
    if (tracks.length === 0) return null;
    return tracks[currentTrackIndex];
  }, [tracks, currentTrackIndex]);

  const playerControls = useMusicPlayer(currentTrack);
  const { audioRef } = playerControls;
  
  const totalTracks = tracks.length;

  // Function to cycle through the three modes
  const togglePlaybackMode = useCallback(() => {
    setPlaybackMode(prevMode => {
      if (prevMode === 'sequential') return 'loop';
      if (prevMode === 'loop') return 'repeat-one';
      return 'sequential';
    });
  }, []);

  // Function to play the next track based on the current mode
  const playNextTrack = useCallback(() => {
    if (totalTracks === 0) return;

    let nextIndex = currentTrackIndex + 1;

    if (nextIndex >= totalTracks) {
      if (playbackMode === 'loop') {
        nextIndex = 0; // Loop back to the start
      } else {
        // Sequential mode: stop at the end
        setCurrentTrackIndex(totalTracks - 1); // Stay on the last track
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setShouldAutoPlay(false); 
        return;
      }
    }
    
    setCurrentTrackIndex(nextIndex);
    
  }, [currentTrackIndex, totalTracks, playbackMode, audioRef]);

  // Function to play the previous track
  const playPreviousTrack = useCallback(() => {
    if (totalTracks === 0) return;
    
    let prevIndex = currentTrackIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = totalTracks - 1; // Loop back to the end
    }
    
    setCurrentTrackIndex(prevIndex);
  }, [currentTrackIndex, totalTracks]);

  // Function to select a track by index
  const selectTrackByIndex = useCallback((index: number) => {
    if (index >= 0 && index < totalTracks) {
      setCurrentTrackIndex(index);
    }
  }, [totalTracks]);

  // Effect to handle automatic playback of the next track when the current one ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (playbackMode === 'repeat-one') {
        // For repeat-one, we just restart the current track
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error("Error auto-playing repeated track:", error);
        });
        return;
      }
      
      // If we are on the last track and in sequential mode, we stop.
      if (currentTrackIndex === totalTracks - 1 && playbackMode === 'sequential') {
        return;
      }
      
      // Set flag to force play the next track
      setShouldAutoPlay(true);
      // Then, move to the next track
      playNextTrack();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, currentTrackIndex, totalTracks, playbackMode, playNextTrack]);
  
  // Effect to trigger playback when a new track is loaded and the auto-play flag is set
  useEffect(() => {
      if (shouldAutoPlay && currentTrack && audioRef.current) {
          audioRef.current.play().catch(error => {
              console.error("Error auto-playing next track:", error);
          });
          setShouldAutoPlay(false); // Reset the flag
      }
  }, [currentTrack, shouldAutoPlay, audioRef]);


  return {
    currentTrack,
    currentTrackIndex,
    playbackMode,
    setPlaybackMode,
    togglePlaybackMode,
    playNextTrack,
    playPreviousTrack,
    selectTrackByIndex,
    playerControls,
  };
};