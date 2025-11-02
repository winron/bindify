import { useEffect } from 'react';
import Shortcut from '../components/Shortcut';
import Container from '../components/Container';
import ScreenTitle from '../components/ScreenTitle';
import { useShortcuts } from '../hooks/useShortcuts';

export default function Shortcuts() {
  const { shortcuts } = useShortcuts();

  function validateShortcut(action, enabled, label, combination) {
    window.api.send('to-main', {
      channel: 'register-globalshortcut',
      data: {
        action,
        enabled,
        label,
        combination
      }
    });
  }

  return (
    <Container>
      <ScreenTitle>Shortcuts</ScreenTitle>
      {shortcuts && Object.keys(shortcuts).map((key) => (
        <Shortcut key={key} action={key} sc={shortcuts[key]} validate={validateShortcut} />
      ))}
      {!shortcuts && (
        <p style={{ color: '#b3b3b3', fontSize: '14px', marginTop: '24px' }}>
          Loading shortcuts...
        </p>
      )}
    </Container>
  );
}
