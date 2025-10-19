import { Track } from '@/types/music';

// IMPORTANT: Replace this placeholder with your deployed Cloudflare Worker URL
// You should set this via a .env file as VITE_WORKER_API_URL
const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL || 'http://localhost:8787/tracks'; 

/**
 * Fetches a list of tracks from the deployed Cloudflare Worker API.
 * The Worker handles listing R2 files and fetching associated LRC content.
 */
export async function fetchTracksFromR2(): Promise<Track[]> {
  if (WORKER_API_URL.includes('localhost')) {
    console.warn("Using placeholder API URL. Please set VITE_WORKER_API_URL environment variable.");
  }
  
  const response = await fetch(WORKER_API_URL);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tracks from Worker API: ${response.statusText}`);
  }
  
  const tracks = await response.json();
  
  // Basic validation to ensure the structure is correct
  if (!Array.isArray(tracks) || tracks.some(t => !t.id || !t.audioUrl || !t.lyrics)) {
      throw new Error("API returned data in an unexpected format.");
  }
  
  return tracks;
}