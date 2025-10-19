import { Track } from '@/types/music';
import { TRACKS } from '@/data/tracks';

/**
 * Simulates fetching a list of tracks from a backend API (e.g., Cloudflare Worker 
 * that lists files in an R2 bucket and fetches associated LRC content).
 * 
 * In a real application, this would be a fetch call to your Worker endpoint.
 */
export async function fetchTracksFromR2(): Promise<Track[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return the mock data loaded from src/data/tracks.ts
  return TRACKS;
}