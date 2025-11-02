import { useMemo, useState, useEffect } from 'react';
import Container from '../components/Container';
import ScreenTitle from '../components/ScreenTitle';
import HistoryLog from '../components/HistoryLog';
import { useLogger } from '../hooks/useLogger';

export default function History() {
  const { history } = useLogger();
  const [currentPlayingUri, setCurrentPlayingUri] = useState(null);

  useEffect(() => {
    // Request current playback state
    const requestPlaybackState = () => {
      window.api.send('to-main', { channel: 'get-current-playback-state' });
    };

    // Check immediately
    requestPlaybackState();

    // Set up interval to check every 2 seconds
    const interval = setInterval(requestPlaybackState, 2000);

    // Listen for playback state updates
    const handlePlaybackState = (evt, data) => {
      if (data?.isPlaying && data?.item?.uri) {
        setCurrentPlayingUri(data.item.uri);
      } else {
        setCurrentPlayingUri(null);
      }
    };

    window.api.handle('current-playback-state', handlePlaybackState);

    return () => {
      clearInterval(interval);
      window.api.removeListener('current-playback-state', handlePlaybackState);
    };
  }, []);

  const sortedHistory = useMemo(() => {
    // First, sort by timestamp to ensure latest comes first
    const sorted = [...history].sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
      return dateB - dateA; // Most recent first (descending order)
    });

    // Remove duplicates, keeping only the one with the latest timestamp
    // Since we sorted by timestamp (most recent first), first occurrence = latest timestamp
    const uniqueTracks = new Map();
    
    sorted.forEach((track) => {
      // Use id as primary key, fall back to uri if id is not available
      const trackKey = track.id || track.uri || null;
      
      if (!trackKey) {
        // If no identifier, skip this track
        return;
      }
      
      // Only add if we haven't seen this track before
      // Since array is sorted by most recent first, first occurrence has latest timestamp
      if (!uniqueTracks.has(trackKey)) {
        uniqueTracks.set(trackKey, track);
      }
    });

    // Convert Map back to array (already sorted since we iterated sorted array)
    return Array.from(uniqueTracks.values());
  }, [history]);

  return (
    <Container>
      <ScreenTitle>History</ScreenTitle>
      {sortedHistory.map((l) => (
        <HistoryLog key={l.id || l.uri || `track-${l.name}`} log={l} currentPlayingUri={currentPlayingUri}/>
      ))}
    </Container>
  );
}
