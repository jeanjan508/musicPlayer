import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Track } from '@/types/music';
import { useMusicPlayer } from './useMusicPlayer';

export type PlaybackMode = 'sequential' | 'loop';

interface PlaylistControls {
  currentTrack: Track | null;
  currentTrackIndex: number;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  selectTrackByIndex: (index: number) => void;
  playerControls: ReturnType<typeof useMusicPlayer>;
}

export const usePlaylist = (tracks: Track[]): PlaylistControls => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('sequential');
  // New state to signal that the next track should start playing automatically
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false); 
  
  const currentTrack = useMemo(() => {
    if (tracks.length === 0) return null;
    return tracks[currentTrackIndex];
  }, [tracks, currentTrackIndex]);

  // Embed the music player controls for the current track
  const playerControls = useMusicPlayer(currentTrack);
  const { audioRef, isPlaying } = playerControls;
  
  const totalTracks = tracks.length;

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
        setShouldAutoPlay(false); // Ensure auto-play flag is reset
        return;
      }
    }
    
    setCurrentTrackIndex(nextIndex);
    // Note: We don't set shouldAutoPlay here for manual skips (SkipForward button), 
    // as the isPlaying state persists across track changes in useMusicPlayer (due to Step 1).
    
  }, [currentTrackIndex, totalTracks, playbackMode, audioRef]);

  // Function to play the previous track
  const playPreviousTrack = useCallback(() => {
    if (totalTracks === 0) return;
    
    let prevIndex = currentTrackIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = totalTracks - 1; // Loop back to the end
    }
    
    setCurrentTrackIndex(prevIndex);
    // Manual skip maintains the current playing state (due to Step 1)
  }, [currentTrackIndex, totalTracks]);

  // Function to select a track by index
  const selectTrackByIndex = useCallback((index: number) => {
    if (index >= 0 && index < totalTracks) {
      setCurrentTrackIndex(index);
      // Manual selection maintains the current playing state (due to Step 1)
    }
  }, [totalTracks]);

  // Effect to handle automatic playback of the next track when the current one ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // If we are on the last track and in sequential mode, we stop.
      if (currentTrackIndex === totalTracks - 1 && playbackMode === 'sequential') {
        // The useMusicPlayer hook already handles setting isPlaying to false
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
    playNextTrack,
    playPreviousTrack,
    selectTrackByIndex,
    playerControls,
  };
};