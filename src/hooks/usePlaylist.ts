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
  
  const currentTrack = useMemo(() => {
    if (tracks.length === 0) return null;
    return tracks[currentTrackIndex];
  }, [tracks, currentTrackIndex]);

  // Embed the music player controls for the current track
  const playerControls = useMusicPlayer(currentTrack);
  const { audioRef, isPlaying, togglePlayPause } = playerControls;
  
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
        return;
      }
    }
    
    setCurrentTrackIndex(nextIndex);
    // Automatically play the next track
    if (isPlaying) {
        // We need a slight delay or a direct call to play after the track loads
        // For now, rely on the useEffect below to handle auto-play after index change
    }
  }, [currentTrackIndex, totalTracks, playbackMode, isPlaying, audioRef]);

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
      // If we are on the last track and in sequential mode, we stop.
      if (currentTrackIndex === totalTracks - 1 && playbackMode === 'sequential') {
        // The useMusicPlayer hook already handles setting isPlaying to false
        return;
      }
      
      // Otherwise, play the next track
      playNextTrack();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, currentTrackIndex, totalTracks, playbackMode, playNextTrack]);
  
  // Effect to ensure the new track starts playing if the previous one was playing
  useEffect(() => {
      if (currentTrack && isPlaying) {
          // This is a common pattern: when the track changes (due to index change), 
          // the useMusicPlayer hook resets the audio element. We need to re-trigger play.
          audioRef.current?.play().catch(error => {
              console.error("Error auto-playing next track:", error);
          });
      }
  }, [currentTrack, isPlaying, audioRef]);


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