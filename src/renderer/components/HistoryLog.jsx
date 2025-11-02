import { useState } from 'react';
import styled from 'styled-components';

const HistoryLogTimestamp = styled.p`
  margin-left: auto;
  color: #b3b3b3;
  font-size: 12px;
  font-weight: 400;
  margin: 0;
`;

const LogBody = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  position: relative;
`;

const HistoryLogTrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const LogMessageValue = styled.p`
  color: ${(props) => (props.isTrackName ? '#ffffff' : '#b3b3b3')};
  font-size: ${(props) => (props.isTrackName ? '16px' : '14px')};
  font-weight: ${(props) => (props.isTrackName ? '700' : '400')};
  margin: 0;
  padding-bottom: ${(props) => (props.isTrackName ? '4px' : '2px')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:last-child {
    padding-bottom: 0;
  }
`;

const LogContainer = styled.div`
  margin: 0 0 16px 0;
  padding: 12px 16px;
  width: 100%;
  max-width: 100%;
  height: fit-content;
  background-color: #181818;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  box-sizing: border-box;
  position: relative;
  
  &:hover {
    background-color: #1a1a1a;
    
    .play-button {
      opacity: 1 !important;
      transform: translateY(-50%) scale(1) !important;
    }
  }
`;

const HistoryLogImg = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`;

const PlayButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #1db954;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${(props) => (props.$alwaysVisible ? '1' : '0')};
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  
  &:hover {
    background-color: #1ed760;
    transform: translateY(-50%) scale(1.05);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
    background-color: #169c46;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
  }
  
  .play-icon {
    width: 0;
    height: 0;
    border-left: 14px solid #000000;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    margin-left: 3px;
  }
  
  .pause-icon {
    display: flex;
    gap: 3px;
    align-items: center;
    justify-content: center;
    
    &::before,
    &::after {
      content: '';
      width: 4px;
      height: 16px;
      background-color: #000000;
      border-radius: 1px;
    }
  }
`;

export default function HistoryLog({ log, currentPlayingUri = null }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Get track URI - use stored URI or construct from ID
  const getTrackUri = () => {
    if (log.uri) {
      return log.uri;
    }
    // If we have an ID but no URI, construct it
    if (log.id) {
      return `spotify:track:${log.id}`;
    }
    return null;
  };

  const trackUri = getTrackUri();
  
  // Check if this track is currently playing
  const isCurrentlyPlaying = currentPlayingUri && trackUri && currentPlayingUri === trackUri;

  const handlePlayPause = () => {
    if (trackUri) {
      if (isCurrentlyPlaying) {
        // Pause if currently playing
        window.api.send('to-main', {
          channel: 'play-pause-track'
        });
      } else {
        // Play if not playing
        setIsPlaying(true);
        window.api.send('to-main', {
          channel: 'play-track',
          data: {
            trackUri: trackUri
          }
        });
        // Reset playing state after a delay
        setTimeout(() => setIsPlaying(false), 500);
      }
    }
  };

  return (
    <LogContainer>
      <LogBody>
        <HistoryLogImg src={log.image[0].url} alt="album cover" />

        <HistoryLogTrackInfo>
          <HistoryLogTimestamp> {log.timestamp}</HistoryLogTimestamp>
          <LogMessageValue isTrackName={true}>{log.name}</LogMessageValue>
          <LogMessageValue>
            {log.artists
              .map(function (l) {
                return l.name;
              })
              .join(',')}
          </LogMessageValue>
          <LogMessageValue>{log.album}</LogMessageValue>
        </HistoryLogTrackInfo>
        
        <PlayButton 
          className="play-button"
          onClick={handlePlayPause}
          disabled={isPlaying || !trackUri}
          aria-label={isCurrentlyPlaying ? "Pause track" : trackUri ? "Play track" : "Track URI not available"}
          $alwaysVisible={true}
          style={{ opacity: trackUri ? 1 : 0.3 }}
        >
          {isCurrentlyPlaying ? (
            <div className="pause-icon" />
          ) : (
            <div className="play-icon" />
          )}
        </PlayButton>
      </LogBody>
    </LogContainer>
  );
}
