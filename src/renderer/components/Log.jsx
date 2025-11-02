import styled from 'styled-components';
import { Fragment } from 'react';

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid #2a2a2a;
`;
const LogStatus = styled.p`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
`;
const LogTimestamp = styled.p`
  color: #b3b3b3;
  font-size: 12px;
  margin: 0;
`;
const LogBody = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;
const LogMessageKey = styled.p`
  color: ${(props) => (props.dtl ? '#b3b3b3' : '#ffffff')};
  font-size: ${(props) => (props.dtl ? '12px' : '14px')};
  padding-left: ${(props) => (props.dtl ? '16px' : '0')};
  min-width: ${(props) => (props.dtl ? '80px' : 'auto')};
  max-width: ${(props) => (props.dtl ? '120px' : 'auto')};
  font-weight: ${(props) => (props.dtl ? '400' : '600')};
  text-transform: ${(props) => (props.dtl ? 'none' : 'uppercase')};
  letter-spacing: ${(props) => (props.dtl ? 'normal' : '0.5px')};
  margin: 0;
  flex-shrink: ${(props) => (props.dtl ? '0' : '1')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const LogMessageValue = styled.p`
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const LogContainer = styled.div`
  margin: 0 0 16px 0;
  padding: 12px 16px;
  width: 100%;
  max-width: 100%;
  height: fit-content;
  background-color: #181818;
  border-radius: 8px;
  border-left: 4px solid ${(props) => (props.isSuccess ? '#1db954' : '#e22134')};
  transition: background-color 0.2s ease;
  box-sizing: border-box;
  
  &:hover {
    background-color: #1a1a1a;
  }
`;

export default function Log({ log }) {
  return (
    <LogContainer isSuccess={log.isSuccess}>
      <LogHeader>
        <LogStatus> {log.statusCode}</LogStatus>
        <LogTimestamp> {log.timestamp}</LogTimestamp>
      </LogHeader>

      {log.message.map((msg) => {
        return Object.entries(msg).map(([key, val]) => {
          const isDtl = !(key === 'error' || key === 'desc');
          return (
            <LogBody>
              {isDtl ? (
               <Fragment>
                  <LogMessageKey dtl={isDtl}>{key}</LogMessageKey>
                  <LogMessageValue>{val}</LogMessageValue>
                  </Fragment>
              ) : (
                  <LogMessageKey dtl={isDtl}>{val}</LogMessageKey>
              )}
            </LogBody>
          );
        });
      })}
    </LogContainer>
  );
}
