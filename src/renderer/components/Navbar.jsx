import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #000000;
  border-bottom: 1px solid #181818;
`;

const NavbarLink = styled(NavLink)`
  color: #b3b3b3;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffffff;
    background-color: #181818;
  }
  
  &:focus {
    outline: none;
    color: #ffffff;
  }
  
  &.active {
    color: #ffffff;
    background-color: #1a1a1a;
  }
`;
const Navbar = React.memo(function Navbar({ isProtected }) {
  return isProtected ? (
    <NavbarContainer>
      <NavbarLink to="/profile">Profile</NavbarLink>
      <NavbarLink to="/shortcuts">Shortcuts</NavbarLink>
      <NavbarLink to="/history">History</NavbarLink>
      <NavbarLink to="/protected-logs">Logs</NavbarLink>
    </NavbarContainer>
  ) : (
    <NavbarContainer>
      <NavbarLink to="/">Home</NavbarLink>
      <NavbarLink to="/public-logs">Logs</NavbarLink>
    </NavbarContainer>
  );
});

export default Navbar;
