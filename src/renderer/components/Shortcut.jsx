import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ReactComponent as Heart } from '../images/heart.svg';
import { getIOHookMapping } from '../utilities/iohookUtil';

const ShortcutContainer = styled.div`
  margin: 0 0 16px 0;
  padding: 12px 16px;
  width: 100%;
  max-width: 100%;
  background-color: #181818;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  box-sizing: border-box;
  
  &:hover {
    background-color: #1a1a1a;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 14px;
  color: ${(props) => (props.focused ? '#ffffff' : '#b3b3b3')};
  transition: color 0.2s ease;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: transform 0.1s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 24px;
    height: 24px;
    fill: ${(props) => (props.enabled ? '#1db954' : 'none')};
    stroke: ${(props) => (props.enabled ? '#1db954' : '#b3b3b3')};
    stroke-width: ${(props) => (props.enabled ? '2' : '16')};
    transition: all 0.2s ease;
    opacity: ${(props) => (props.enabled ? '1' : '0.9')};
    
    &:hover {
      stroke: ${(props) => (props.enabled ? '#1ed760' : '#ffffff')};
      fill: ${(props) => (props.enabled ? '#1ed760' : 'none')};
      opacity: 1;
    }
  }
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  background-color: #2a2a2a;
  border: 1px solid ${(props) => (props.focused ? '#404040' : '#2a2a2a')};
  border-radius: 4px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  transition: all 0.2s ease;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:disabled {
    opacity: 0.5;
  }
  
  &:focus {
    outline: none;
    background-color: #333333;
    border-color: #404040;
  }
  
  &::placeholder {
    color: #6a6a6a;
  }
`;

export default function Shortcut({ action, sc, validate }) {
  const [enabled, setEnabled] = useState(sc.enabled);
  const [tempCombination, setTempCombination] = useState([]);
  const [tempText, setTempText] = useState([]);
  const [inputFocus, setInputFocus] = useState(false);
  const didMountRef = useRef(false);
  const inputRef = useRef(null);

  // Memoize initial shortcut text calculation
  const initialShortcutText = useMemo(() => {
    if (!sc.combination || sc.combination.length === 0) return '';
    return sc.combination
      .map((code) => getIOHookMapping(code, true))
      .filter(Boolean)
      .join(' + ');
  }, [sc.combination]);

  const [shortcut, setShortcut] = useState({
    text: initialShortcutText,
    combination: sc.combination
  });

  useEffect(() => {
    window.api.send('to-main', {
      channel: 'toggle-globalshortcut',
      data: {
        action,
        enabled
      }
    });
    if (!didMountRef.current) {
      didMountRef.current = true;
    } else if (enabled) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
      setShortcut({
        text: '',
        combination: []
      });
    }
  }, [enabled, action]);

  // io key codes to string value: 30 -> a to display in the input:
  const ioHookKeyCodeCombinationToText = useCallback((combination) => {
    if (!combination || combination.length === 0) return '';
    return combination
      .map((code) => getIOHookMapping(code, true))
      .filter(Boolean)
      .join(' + ');
  }, []);

  //string value to io key code: a -> 30 to be registered as shortcut
  const textToIOHookKeyCodeCombination = useCallback(() => {
    if (!tempText || tempText.length === 0) return [];
    return tempText
      .map((code) => getIOHookMapping(code, false))
      .filter((code) => code !== undefined && code !== null)
      .map((code) => code.toString());
  }, [tempText]);

  const handleOnClickHeart = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  const handleOnKeyDownInput = useCallback((e) => {
    e.preventDefault();
    if (!e.repeat) {
      setTempText((curr) => [...curr, e.key]);
    }
  }, []);

  const handleOnKeyUpInput = useCallback(() => {
    if (tempText.length > 0) {
      const newCombination = textToIOHookKeyCodeCombination();
      setShortcut({ 
        text: tempText.join(' + '), 
        combination: newCombination 
      });
      setTempText([]);
    }
  }, [tempText, textToIOHookKeyCodeCombination]);

  const handleOnFocusInput = useCallback(() => {
    setInputFocus(true);
    setTempCombination(shortcut.combination);
  }, [shortcut.combination]);

  // Helper to compare arrays efficiently
  const arraysEqual = useCallback((a, b) => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  }, []);

  const handleOnBlurInput = useCallback(() => {
    setInputFocus(false);
    if (shortcut.combination.length <= 0) {
      return;
    }
    if (arraysEqual(shortcut.combination, tempCombination)) {
      return;
    }
    validate(action, enabled, sc.label, shortcut.combination);
  }, [shortcut.combination, tempCombination, action, enabled, sc.label, validate, arraysEqual]);

  return (
    <ShortcutContainer>
      <Label focused={inputFocus}>{sc.label}</Label>
      <InputContainer>
        <CheckboxContainer enabled={enabled} onClick={() => handleOnClickHeart()}>
          <Heart />
        </CheckboxContainer>
        <Input
          type="text"
          readOnly
          ref={inputRef}
          disabled={!enabled}
          value={shortcut.text || ''}
          placeholder={enabled ? 'Press keys to set shortcut...' : 'Shortcut disabled'}
          focused={inputFocus}
          onFocus={() => handleOnFocusInput()}
          onKeyDown={(e) => handleOnKeyDownInput(e)}
          onKeyUp={() => handleOnKeyUpInput()}
          onBlur={() => handleOnBlurInput()}
        />
      </InputContainer>
    </ShortcutContainer>
  );
}
