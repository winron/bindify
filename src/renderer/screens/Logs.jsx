import Container from '../components/Container';
import ScreenTitle from '../components/ScreenTitle';
import Log from '../components/Log';
import { useLogger } from '../hooks/useLogger';

export default function Logs() {
  const { logger } = useLogger();

  return (
    <Container>
      <ScreenTitle>Logs</ScreenTitle>
      {logger.map((l) => (
        <Log log={l}/>
      ))}
    </Container>
  );
}
