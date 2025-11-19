import React, { useState } from 'react';
import styled from 'styled-components';
import { LogOut, GraduationCap, LayoutDashboard, Users, UserCog, BookOpen, DollarSign, X } from 'lucide-react';

// Styled Components
const SidebarContainer = styled.div`
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1a237e 0%, #283593 50%, #3949ab 100%);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  text-align: center;
  position: relative;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const LogoIcon = styled.div`
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
`;

const LogoText = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
`;

const AdminBadge = styled.div`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a237e;
  background: linear-gradient(135deg, #ffd54f 0%, #ffc107 100%);
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(255, 213, 79, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 213, 79, 0.6);
  }
`;

const NavSection = styled.div`
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  margin: 0.25rem 1rem;
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.75)'};
  text-decoration: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-left: 4px solid ${props => props.active ? '#ffd54f' : 'transparent'};
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)' 
    : 'transparent'};
  box-shadow: ${props => props.active 
    ? '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
    : 'none'};
  transform: ${props => props.active ? 'translateX(5px)' : 'translateX(0)'};

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'};
    color: #fff;
    transform: translateX(8px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-left-color: ${props => props.active ? '#ffd54f' : 'rgba(255, 255, 255, 0.3)'};
  }

  &:active {
    transform: translateX(5px) scale(0.98);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${props => props.active ? '4px' : '0'};
    background: linear-gradient(180deg, #ffd54f 0%, #ffc107 100%);
    border-radius: 0 4px 4px 0;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(255, 213, 79, 0.5);
  }
`;

const NavIcon = styled.span`
  font-size: 1.4rem;
  margin-right: 1rem;
  width: 28px;
  text-align: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;

  ${NavItem}:hover & {
    transform: scale(1.2) rotate(5deg);
  }
`;

const NavText = styled.span`
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '500'};
  letter-spacing: 0.3px;
  transition: font-weight 0.3s ease;
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const UserInfo = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserName = styled.div`
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.9) 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

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

  svg {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
    background: linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(211, 47, 47, 1) 100%);
    border-color: rgba(255, 255, 255, 0.3);

    &::before {
      width: 300px;
      height: 300px;
    }

    svg {
      transform: translateX(4px) scale(1.1);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
    
    svg {
      transform: translateX(2px) scale(1.05);
    }
  }
`;

// Icon mapping
const iconMap = {
  dashboard: LayoutDashboard,
  students: Users,
  teachers: UserCog,
  courses: BookOpen,
  payments: DollarSign,
};

// ------------------ Sidebar Component ------------------
const AdminSidebar = ({ activeSection, onSectionChange, user, onLogout, isOpen = false, onClose }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', iconKey: 'dashboard' },
    { id: 'students', label: 'Students', iconKey: 'students' },
    { id: 'teachers', label: 'Teachers', iconKey: 'teachers' },
    { id: 'courses', label: 'Courses', iconKey: 'courses' },
    { id: 'payments', label: 'Payments', iconKey: 'payments' },
  ];

  const handleNavClick = (sectionId) => {
    onSectionChange(sectionId);
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <SidebarContainer $isOpen={isOpen}>
      {/* Mobile Close Button */}
      {isMobile && isOpen && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            width: '36px',
            height: '36px',
          }}
        >
          <X size={20} />
        </button>
      )}
      {/* Header */}
      <SidebarHeader>
        <LogoContainer>
          <LogoIcon>
            <GraduationCap size={36} />
          </LogoIcon>
          <LogoText>E-Learning</LogoText>
        </LogoContainer>
        <AdminBadge>Admin Panel</AdminBadge>
      </SidebarHeader>

      {/* Navigation */}
      <NavSection>
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <NavItem
              key={item.id}
              active={isActive}
              onClick={() => handleNavClick(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <NavIcon>
                {React.createElement(iconMap[item.iconKey], { size: 20 })}
              </NavIcon>
              <NavText active={isActive}>{item.label}</NavText>
            </NavItem>
          );
        })}
      </NavSection>

      {/* Footer */}
      <SidebarFooter>
        <UserInfo>
          <UserName>Welcome, {user?.fullName || 'Admin'}</UserName>
          <UserRole>Administrator</UserRole>
        </UserInfo>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={18} style={{ marginRight: '8px' }} />
          Logout
        </LogoutButton>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default AdminSidebar;
