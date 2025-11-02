import styled from 'styled-components';

const StyledContainer = styled.div`
  margin: 0 auto;
  padding: 24px;
  max-width: 750px;
  width: 100%;
  flex: 1;
  background-color: inherit;
  overflow-y: auto;
  overflow-x: hidden;
`;

export default function Container({ children }) {
  return <StyledContainer>{children}</StyledContainer>;
}
