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

  // Check if we're on a dashboard page (to adjust navbar positioning)
  const isDashboardPage = location.pathname === '/AdminDashboard' || 
                          location.pathname === '/TeacherDashboard' || 
                          location.pathname === '/StudentDashboard';
  
  // Check if we're on student dashboard for purple styling
  const isStudentDashboard = location.pathname === '/StudentDashboard';

  return (
    <NavbarContainer isDashboard={isDashboardPage} isStudentDashboard={isStudentDashboard}>
      <NavbarContent isStudentDashboard={isStudentDashboard}>
        <Logo onClick={handleHome} isStudentDashboard={isStudentDashboard}>
          <LogoIcon isStudentDashboard={isStudentDashboard}>🎓</LogoIcon>
          <LogoText isStudentDashboard={isStudentDashboard}>E-Learning</LogoText>
        </Logo>

        <NavLinks>
          <NavLink 
            onClick={handleHome} 
            active={location.pathname === '/'}
            isStudentDashboard={isStudentDashboard}
          >
            Home
          </NavLink>
          
          <NavLink 
            onClick={handleContact} 
            active={location.pathname === '/contact'}
            isStudentDashboard={isStudentDashboard}
          >
            Contact Us
          </NavLink>
          
          {isLoggedIn && (
            <NavLink 
              onClick={handleDashboard} 
              active={location.pathname.includes('/dashboard')}
              isStudentDashboard={isStudentDashboard}
            >
              Dashboard
            </NavLink>
          )}
        </NavLinks>

        <UserSection>
          {isLoggedIn ? (
            <UserMenu>
              <UserInfo>
                <UserAvatar isStudentDashboard={isStudentDashboard}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </UserAvatar>
                <UserDetails>
                  <UserName isStudentDashboard={isStudentDashboard}>{user?.fullName}</UserName>
                  <UserRole isStudentDashboard={isStudentDashboard}>{user?.role}</UserRole>
                </UserDetails>
              </UserInfo>
              <LogoutButton onClick={handleLogout} isStudentDashboard={isStudentDashboard}>
                Logout
              </LogoutButton>
            </UserMenu>
          ) : (
            <AuthButtons>
              <LoginButton onClick={handleLogin} isStudentDashboard={isStudentDashboard}>
                Login
              </LoginButton>
              <SignupButton onClick={handleSignup} isStudentDashboard={isStudentDashboard}>
                Sign Up
              </SignupButton>
            </AuthButtons>
          )}
        </UserSection>

        {/* Mobile Menu Button */}
        <MobileMenuButton 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          isStudentDashboard={isStudentDashboard}
        >
          ☰
        </MobileMenuButton>
      </NavbarContent>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <MobileMenu isStudentDashboard={isStudentDashboard}>
          <MobileNavLink 
            onClick={handleHome} 
            active={location.pathname === '/'}
            isStudentDashboard={isStudentDashboard}
          >
            Home
          </MobileNavLink>
          
          <MobileNavLink 
            onClick={handleContact} 
            active={location.pathname === '/contact'}
            isStudentDashboard={isStudentDashboard}
          >
            Contact Us
          </MobileNavLink>
          
          {isLoggedIn && (
            <MobileNavLink 
              onClick={handleDashboard} 
              active={location.pathname.includes('/dashboard')}
              isStudentDashboard={isStudentDashboard}
            >
              Dashboard
            </MobileNavLink>
          )}

          {isLoggedIn ? (
            <MobileUserSection isStudentDashboard={isStudentDashboard}>
              <MobileUserInfo>
                <MobileUserAvatar isStudentDashboard={isStudentDashboard}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </MobileUserAvatar>
                <MobileUserDetails>
                  <MobileUserName isStudentDashboard={isStudentDashboard}>
                    {user?.fullName}
                  </MobileUserName>
                  <MobileUserRole isStudentDashboard={isStudentDashboard}>
                    {user?.role}
                  </MobileUserRole>
                </MobileUserDetails>
              </MobileUserInfo>
              <MobileLogoutButton 
                onClick={handleLogout}
                isStudentDashboard={isStudentDashboard}
              >
                Logout
              </MobileLogoutButton>
            </MobileUserSection>
          ) : (
            <MobileAuthButtons>
              <MobileLoginButton 
                onClick={handleLogin}
                isStudentDashboard={isStudentDashboard}
              >
                Login
              </MobileLoginButton>
              <MobileSignupButton 
                onClick={handleSignup}
                isStudentDashboard={isStudentDashboard}
              >
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
  background: ${props => props.isStudentDashboard 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'white'};
  box-shadow: ${props => props.isStudentDashboard 
    ? '0 4px 20px rgba(0, 0, 0, 0.15)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)'};
  top: 0;
  z-index: 999;
  position: sticky;
  width: 100%;
  transition: all 0.3s ease;
`;

const NavbarContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 75px;
  gap: 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 70px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.div`
  font-size: 2rem;
  filter: ${props => props.isStudentDashboard 
    ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' 
    : 'none'};
  animation: ${props => props.isStudentDashboard ? 'float 3s ease-in-out infinite' : 'none'};
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
`;

const LogoText = styled.div`
  font-size: ${props => props.isStudentDashboard ? '1.6rem' : '1.5rem'};
  font-weight: 700;
  color: ${props => props.isStudentDashboard ? 'transparent' : '#667eea'};
  background: ${props => props.isStudentDashboard 
    ? 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)' 
    : 'none'};
  -webkit-background-clip: ${props => props.isStudentDashboard ? 'text' : 'unset'};
  -webkit-text-fill-color: ${props => props.isStudentDashboard ? 'transparent' : '#667eea'};
  background-clip: ${props => props.isStudentDashboard ? 'text' : 'unset'};
  letter-spacing: ${props => props.isStudentDashboard ? '-0.5px' : '0'};
  text-shadow: ${props => props.isStudentDashboard 
    ? '0 2px 10px rgba(255, 255, 255, 0.3)' 
    : 'none'};
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: ${props => {
    if (props.isStudentDashboard) {
      return props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
    }
    return props.active ? '#667eea' : '#333';
  }};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;

  &:hover {
    color: ${props => props.isStudentDashboard ? '#ffffff' : '#667eea'};
    background: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.15)' 
      : '#f8f9fa'};
    transform: translateY(-2px);
  }

  ${props => props.active && !props.isStudentDashboard && `
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
  
  ${props => props.active && props.isStudentDashboard && `
    background: rgba(255, 255, 255, 0.2);
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 3px;
      background: #ffffff;
      border-radius: 2px;
    }
  `}
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

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
  gap: 0.75rem;
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.2)' 
    : '#667eea'};
  color: ${props => props.isStudentDashboard ? '#ffffff' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  border: ${props => props.isStudentDashboard 
    ? '2px solid rgba(255, 255, 255, 0.3)' 
    : 'none'};
  box-shadow: ${props => props.isStudentDashboard 
    ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
    : 'none'};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.isStudentDashboard 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
      : 'none'};
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${props => props.isStudentDashboard ? '#ffffff' : '#333'};
  white-space: nowrap;
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.8)' 
    : '#666'};
  text-transform: capitalize;
  white-space: nowrap;
`;

const LogoutButton = styled.button`
  background: ${props => props.isStudentDashboard 
    ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.9) 100%)' 
    : '#ff6b6b'};
  color: white;
  border: ${props => props.isStudentDashboard 
    ? '1px solid rgba(255, 255, 255, 0.2)' 
    : 'none'};
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isStudentDashboard 
    ? '0 4px 15px rgba(244, 67, 54, 0.3)' 
    : 'none'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover {
    background: ${props => props.isStudentDashboard 
      ? 'linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(211, 47, 47, 1) 100%)' 
      : '#ff5252'};
    transform: translateY(-2px);
    box-shadow: ${props => props.isStudentDashboard 
      ? '0 6px 20px rgba(244, 67, 54, 0.5)' 
      : '0 4px 12px rgba(255, 82, 82, 0.4)'};
    
    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const LoginButton = styled.button`
  background: ${props => props.isStudentDashboard 
    ? 'transparent' 
    : 'transparent'};
  color: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.9)' 
    : '#667eea'};
  border: 2px solid ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.5)' 
    : '#667eea'};
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.2)' 
      : '#667eea'};
    color: ${props => props.isStudentDashboard ? '#ffffff' : 'white'};
    border-color: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.8)' 
      : '#667eea'};
    transform: translateY(-2px);
  }
`;

const SignupButton = styled.button`
  background: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.2)' 
    : '#667eea'};
  color: white;
  border: ${props => props.isStudentDashboard 
    ? '1px solid rgba(255, 255, 255, 0.3)' 
    : 'none'};
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isStudentDashboard 
    ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
    : 'none'};

  &:hover {
    background: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.3)' 
      : '#5a6fd8'};
    transform: translateY(-2px);
    box-shadow: ${props => props.isStudentDashboard 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
      : '0 4px 12px rgba(102, 126, 234, 0.4)'};
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.isStudentDashboard ? '#ffffff' : '#333'};
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  background: ${props => props.isStudentDashboard 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'white'};
  border-top: ${props => props.isStudentDashboard 
    ? '1px solid rgba(255, 255, 255, 0.2)' 
    : '1px solid #eee'};
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
  color: ${props => {
    if (props.isStudentDashboard) {
      return props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
    }
    return props.active ? '#667eea' : '#333';
  }};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  padding: 0.75rem 0;
  text-align: left;
  border-bottom: ${props => props.isStudentDashboard 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid #f0f0f0'};

  &:hover {
    color: ${props => props.isStudentDashboard ? '#ffffff' : '#667eea'};
    background: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'transparent'};
  }
`;

const MobileUserSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: ${props => props.isStudentDashboard 
    ? '1px solid rgba(255, 255, 255, 0.2)' 
    : '1px solid #eee'};
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const MobileUserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.2)' 
    : '#667eea'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  border: ${props => props.isStudentDashboard 
    ? '2px solid rgba(255, 255, 255, 0.3)' 
    : 'none'};
`;

const MobileUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const MobileUserName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${props => props.isStudentDashboard ? '#ffffff' : '#333'};
`;

const MobileUserRole = styled.span`
  font-size: 0.75rem;
  color: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.8)' 
    : '#666'};
  text-transform: capitalize;
`;

const MobileLogoutButton = styled.button`
  width: 100%;
  background: ${props => props.isStudentDashboard 
    ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.9) 100%)' 
    : '#ff6b6b'};
  color: white;
  border: ${props => props.isStudentDashboard 
    ? '1px solid rgba(255, 255, 255, 0.2)' 
    : 'none'};
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isStudentDashboard 
    ? '0 4px 15px rgba(244, 67, 54, 0.3)' 
    : 'none'};

  &:hover {
    background: ${props => props.isStudentDashboard 
      ? 'linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(211, 47, 47, 1) 100%)' 
      : '#ff5252'};
    transform: translateY(-2px);
    box-shadow: ${props => props.isStudentDashboard 
      ? '0 6px 20px rgba(244, 67, 54, 0.5)' 
      : 'none'};
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
  color: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.9)' 
    : '#667eea'};
  border: 2px solid ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.5)' 
    : '#667eea'};
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.2)' 
      : '#667eea'};
    color: ${props => props.isStudentDashboard ? '#ffffff' : 'white'};
    border-color: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.8)' 
      : '#667eea'};
  }
`;

const MobileSignupButton = styled.button`
  width: 100%;
  background: ${props => props.isStudentDashboard 
    ? 'rgba(255, 255, 255, 0.2)' 
    : '#667eea'};
  color: white;
  border: ${props => props.isStudentDashboard 
    ? '1px solid rgba(255, 255, 255, 0.3)' 
    : 'none'};
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isStudentDashboard 
    ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
    : 'none'};

  &:hover {
    background: ${props => props.isStudentDashboard 
      ? 'rgba(255, 255, 255, 0.3)' 
      : '#5a6fd8'};
    box-shadow: ${props => props.isStudentDashboard 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
      : 'none'};
  }
`;