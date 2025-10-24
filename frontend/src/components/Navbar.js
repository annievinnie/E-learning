import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import API from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const name = localStorage.getItem('name');
      
      if (token && role && name) {
        // Use localStorage data for immediate UI update
        setUser({
          fullName: name,
          role: role
        });
        setIsLoggedIn(true);
        
        // Optionally fetch fresh profile data in background
        API.get('/profile')
          .then(response => {
            setUser(response.data.user);
          })
          .catch(error => {
            console.error('Error fetching profile:', error);
            // Don't logout on profile fetch error, keep using localStorage data
          });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // Check auth status on mount
    checkAuthStatus();

    // Listen for storage changes (when token is added/removed)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'role' || e.key === 'name') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setUser(null);
    setIsLoggedIn(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleSignup = () => {
    navigate('/signup');
    setIsMenuOpen(false);
  };

  const handleHome = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/AdminDashboard');
    } else if (user?.role === 'teacher') {
      navigate('/TeacherDashboard');
    } else if (user?.role === 'student') {
      navigate('/StudentDashboard');
    }
    setIsMenuOpen(false);
  };

  const handleContact = () => {
    navigate('/contact');
    setIsMenuOpen(false);
  };

  // Don't show navbar on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo onClick={handleHome}>
          <LogoIcon>🎓</LogoIcon>
          <LogoText>E-Learning</LogoText>
        </Logo>

        <NavLinks>
          <NavLink onClick={handleHome} active={location.pathname === '/'}>
            Home
          </NavLink>
          
          <NavLink onClick={handleContact} active={location.pathname === '/contact'}>
            Contact Us
          </NavLink>
          
          {isLoggedIn && (
            <NavLink onClick={handleDashboard} active={
              location.pathname.includes('/dashboard')
            }>
              Dashboard
            </NavLink>
          )}
        </NavLinks>

        <UserSection>
          {isLoggedIn ? (
            <UserMenu>
              <UserInfo>
                <UserAvatar>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </UserAvatar>
                <UserDetails>
                  <UserName>{user?.fullName}</UserName>
                  <UserRole>{user?.role}</UserRole>
                </UserDetails>
              </UserInfo>
              <LogoutButton onClick={handleLogout}>
                Logout
              </LogoutButton>
            </UserMenu>
          ) : (
            <AuthButtons>
              <LoginButton onClick={handleLogin}>
                Login
              </LoginButton>
              <SignupButton onClick={handleSignup}>
                Sign Up
              </SignupButton>
            </AuthButtons>
          )}
        </UserSection>

        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </MobileMenuButton>
      </NavbarContent>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <MobileMenu>
          <MobileNavLink onClick={handleHome} active={location.pathname === '/'}>
            Home
          </MobileNavLink>
          
          <MobileNavLink onClick={handleContact} active={location.pathname === '/contact'}>
            Contact Us
          </MobileNavLink>
          
          {isLoggedIn && (
            <MobileNavLink onClick={handleDashboard} active={
              location.pathname.includes('/dashboard')
            }>
              Dashboard
            </MobileNavLink>
          )}

          {isLoggedIn ? (
            <MobileUserSection>
              <MobileUserInfo>
                <MobileUserAvatar>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </MobileUserAvatar>
                <MobileUserDetails>
                  <MobileUserName>{user?.fullName}</MobileUserName>
                  <MobileUserRole>{user?.role}</MobileUserRole>
                </MobileUserDetails>
              </MobileUserInfo>
              <MobileLogoutButton onClick={handleLogout}>
                Logout
              </MobileLogoutButton>
            </MobileUserSection>
          ) : (
            <MobileAuthButtons>
              <MobileLoginButton onClick={handleLogin}>
                Login
              </MobileLoginButton>
              <MobileSignupButton onClick={handleSignup}>
                Sign Up
              </MobileSignupButton>
            </MobileAuthButtons>
          )}
        </MobileMenu>
      )}
    </NavbarContainer>
  );
};

export default Navbar;

// Styled Components
const NavbarContainer = styled.nav`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavbarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.span`
  font-size: 2rem;
  margin-right: 0.5rem;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? '#667eea' : '#333'};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: #667eea;
    background: #f8f9fa;
  }

  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: #667eea;
    }
  `}
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
`;

const UserRole = styled.span`
  font-size: 0.8rem;
  color: #666;
  text-transform: capitalize;
`;

const LogoutButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background: #ff5252;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const LoginButton = styled.button`
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const SignupButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background: #5a6fd8;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  background: white;
  border-top: 1px solid #eee;
  padding: 1rem 2rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavLink = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: ${props => props.active ? '#667eea' : '#333'};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  padding: 0.75rem 0;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    color: #667eea;
  }
`;

const MobileUserSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MobileUserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const MobileUserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileUserName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
`;

const MobileUserRole = styled.span`
  font-size: 0.8rem;
  color: #666;
  text-transform: capitalize;
`;

const MobileLogoutButton = styled.button`
  width: 100%;
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background: #ff5252;
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const MobileLoginButton = styled.button`
  width: 100%;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.75rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const MobileSignupButton = styled.button`
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background: #5a6fd8;
  }
`;
