import { useEffect } from 'react';
import styled from 'styled-components';

const TitlebarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  background-color: #000000;
  padding: 0 16px;
  border-bottom: 1px solid #181818;
  -webkit-app-region: drag;
`;

const Title = styled.span`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  user-select: none;
`;

const TitlebarButtons = styled.div`
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
`;

const WindowButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  color: #b3b3b3;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #1a1a1a;
    color: #ffffff;
  }
  
  &:active {
    background-color: #2a2a2a;
  }
`;

const MinimizeButton = styled(WindowButton)``;

const CloseButton = styled(WindowButton)``;

export default function Titlebar() {
  useEffect(() => {
    const titleBarContainer = document.getElementById('titlebar');
    if (titleBarContainer) {
      titleBarContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      return () => {
        titleBarContainer.removeEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
      };
    }
  }, []);

  return (
    <TitlebarContainer id="titlebar">
      <Title>Bindify</Title>
      <TitlebarButtons id="titlebar-buttons">
        <MinimizeButton>-</MinimizeButton>
        <CloseButton>x</CloseButton>
      </TitlebarButtons>
    </TitlebarContainer>
  );
}
