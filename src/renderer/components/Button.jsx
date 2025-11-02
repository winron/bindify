import React from 'react';
import styled from 'styled-components';

const ButtonStyle = styled.button`
    border: none;
    border-radius: 500px;
    padding: 14px 32px;
    margin: 0;
    font-weight: 700;
    font-size: 14px;
    background-color: ${(props) => (props.btnType.backgroundColor)};
    color: ${(props) => (props.btnType.color)};
    width: ${(props) => (props.btnType.width)};
    height: ${(props) => (props.btnType.height)};
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    
    &:hover {
        background-color: ${(props) => (props.btnType.hoverBackgroundColor)};
        transform: scale(1.02);
    }
    
    &:active {
        background-color: ${(props) => (props.btnType.activeBackgroundColor)};
        transform: scale(0.98);
    }
    
    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.5);
    }
    
    &:disabled {
        opacity: 0.5;
        transform: none;
    }
`;

const primary = {
    backgroundColor: '#1db954',
    hoverBackgroundColor: '#1ed760',
    activeBackgroundColor: '#169c46',
    color: '#000000',
    width: 'auto',
    height: 'auto',
    minHeight: '48px',
    minWidth: '140px',
}



const Button = React.memo(function Button({ children, onClick, btnType, style }) {
  const buttonType = btnType || primary;
  return (
    <ButtonStyle btnType={buttonType} onClick={onClick} style={style}>
      {children}
    </ButtonStyle>
  );
});

export default Button;