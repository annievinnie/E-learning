import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import API from '../api';
import StudentProfile from './profile/StudentProfile';
import TeacherProfile from './profile/TeacherProfile';
import AdminProfile from './profile/AdminProfile';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

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
        
        // Fetch fresh profile data in background
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

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

  const handleProfileClick = () => {
    setShowProfileSidebar(true);
    setShowProfileDropdown(false);
    setIsMenuOpen(false); // Close mobile menu if open
    // Fetch fresh profile data when opening sidebar
    API.get('/profile')
      .then(response => {
        setUser(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
      });
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser.fullName) {
      localStorage.setItem('name', updatedUser.fullName);
    }
    window.dispatchEvent(new CustomEvent('authStateChanged'));
  };

  const handleCloseProfileSidebar = () => {
    setShowProfileSidebar(false);
  };

  const handleContact = () => {
    navigate('/contact');
    setIsMenuOpen(false);
  };

  // Don't show navbar on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  // Check if we're on a dashboard page with sidebar (to adjust navbar positioning)
  // StudentDashboard doesn't have a sidebar, so we don't add margin for it
  const isDashboardWithSidebar = location.pathname === '/AdminDashboard' || 
                                  location.pathname === '/TeacherDashboard';

  return (
    <NavbarContainer isDashboard={isDashboardWithSidebar}>
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
            <AvatarContainer>
              <UserInfo>
                <UserDetails>
                  <UserName>{user?.fullName}</UserName>
                  <UserRole>{user?.role}</UserRole>
                </UserDetails>
                <AvatarButton
                  ref={avatarRef}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  $hasImage={!!user?.profilePicture}
                >
                  {user?.profilePicture ? (
                    <AvatarImage src={user.profilePicture} alt={user?.fullName} />
                  ) : (
                    <AvatarText>
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarText>
                  )}
                </AvatarButton>
              </UserInfo>
              
              {showProfileDropdown && (
                <DropdownMenu ref={dropdownRef} onMouseLeave={() => setShowProfileDropdown(false)}>
                  <DropdownItem onClick={handleProfileClick}>
                    <DropdownIcon>👤</DropdownIcon>
                    Profile
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogout}>
                    <DropdownIcon>🚪</DropdownIcon>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </AvatarContainer>
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
              <MobileNavLink onClick={handleProfileClick}>
                👤 Profile
              </MobileNavLink>
              <MobileNavLink onClick={handleDashboard}>
                📊 Dashboard
              </MobileNavLink>
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

      {/* Profile Sidebar */}
      {showProfileSidebar && (
        <ProfileSidebarOverlay onClick={handleCloseProfileSidebar}>
          <ProfileSidebar onClick={(e) => e.stopPropagation()}>
            <ProfileSidebarHeader>
              <ProfileSidebarTitle>My Profile</ProfileSidebarTitle>
              <CloseButton onClick={handleCloseProfileSidebar}>×</CloseButton>
            </ProfileSidebarHeader>
            <ProfileSidebarContent>
              {user?.role === 'student' && (
                <StudentProfile user={user} onUpdate={handleProfileUpdate} />
              )}
              {user?.role === 'teacher' && (
                <TeacherProfile user={user} onUpdate={handleProfileUpdate} />
              )}
              {user?.role === 'admin' && (
                <AdminProfile user={user} onUpdate={handleProfileUpdate} />
              )}
            </ProfileSidebarContent>
          </ProfileSidebar>
        </ProfileSidebarOverlay>
      )}
    </NavbarContainer>
  );
};

export default Navbar;

// Styled Components
const NavbarContainer = styled.nav`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  top: 0;
  z-index: 999;
  position: sticky;
  margin-left: ${props => props.isDashboard ? '280px' : '0'};
  transition: margin-left 0.3s ease;
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
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
`;

const UserRole = styled.span`
  font-size: 0.8rem;
  color: #666;
  text-transform: capitalize;
`;

const AvatarButton = styled.button`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #667eea;
  background: ${props => props.$hasImage ? 'transparent' : '#667eea'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  overflow: hidden;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    border-color: #5a6fd8;
  }

  &:active {
    transform: scale(1.05);
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AvatarText = styled.span`
  user-select: none;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 0.5rem 0;
  z-index: 1000;
  animation: slideDown 0.3s ease;
  overflow: hidden;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #667eea;
  }

  &:active {
    background: #e9ecef;
  }
`;

const DropdownIcon = styled.span`
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: #e9ecef;
  margin: 0.25rem 0;
`;

const ProfileSidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ProfileSidebar = styled.div`
  width: 600px;
  max-width: 90vw;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease;
  overflow-y: auto;

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (max-width: 768px) {
    width: 100vw;
    max-width: 100vw;
  }
`;

const ProfileSidebarHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ProfileSidebarTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const ProfileSidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
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