import { Fragment } from 'react';
import styled from 'styled-components';
import { useLogger } from '../hooks/useLogger';

const NotificationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  width: 100%;
  min-height: 56px;
  background-color: #1db954;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  color: #000000;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export default function Notification() {
  const { logger } = useLogger();

  return (
    <Fragment>
      {logger && logger.length > 0 && (
        <NotificationContainer>
          {/* Notification content can be added here when needed */}
        </NotificationContainer>
      )}
    </Fragment>
  );
}
