import { useAuth } from '../hooks/useAuth';
import { useLogger } from '../hooks/useLogger';
import Container from '../components/Container';
import ScreenTitle from '../components/ScreenTitle';
import Button from '../components/Button';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  width: 50%;
  max-width: 300px;
`;

export default function Profile() {
  const { logout, displayName } = useAuth();
  const { resetHistory } = useLogger();
  
  function processLogout() {
    resetHistory();
    logout();
  }

  function clearAllData() {
    if (window.confirm('Are you sure you want to clear all history, logs, and shortcuts? This cannot be undone.')) {
      window.api.send('to-main', { channel: 'clear-all-data' });
    }
  }

  return (
    <Container>
      <ScreenTitle>Hello, {displayName}!</ScreenTitle>
      <ButtonContainer>
        <Button onClick={() => clearAllData()}>Clear All Data</Button>
        <Button onClick={() => processLogout()}>Log out</Button>
      </ButtonContainer>
    </Container>
  );
}
