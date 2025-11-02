import styled from 'styled-components';

const ScreenTitleContainer = styled.div`
  margin-bottom: 24px;
  width: 100%;
`;

const ScreenTitleStyle = styled.h2`
  color: #ffffff;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.2;
  margin: 0;
  padding: 0;
`;

export default function ScreenTitle({ children }) {
  return (
    <ScreenTitleContainer>
      <ScreenTitleStyle>{children}</ScreenTitleStyle>
    </ScreenTitleContainer>
  );
}
