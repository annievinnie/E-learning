import React from 'react';

// ------------------ Sidebar Styles ------------------
const styles = {
  sidebar: {
    width: '250px',
    height: '100vh',
    backgroundColor: '#1a237e',
    color: 'white',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
  },
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#fff',
  },
  adminBadge: {
    fontSize: '0.8rem',
    color: '#ffd54f',
    backgroundColor: 'rgba(255, 213, 79, 0.2)',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    display: 'inline-block',
  },
  navSection: {
    flex: 1,
    padding: '1rem 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderLeft: '3px solid #ffd54f',
  },
  navItemHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
  },
  navIcon: {
    marginRight: '0.75rem',
    fontSize: '1.2rem',
    width: '20px',
    textAlign: 'center',
  },
  navText: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  sidebarFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  },
  userInfo: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '0.5rem',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease',
    width: '100%',
  },
  logoutButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
};

// ------------------ Sidebar Component ------------------
const AdminSidebar = ({ activeSection, onSectionChange, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
    { id: 'courses', label: 'Courses', icon: '📚' },
  ];

  const handleNavClick = (sectionId) => {
    onSectionChange(sectionId);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* Header */}
      <div style={styles.sidebarHeader}>
        <div style={styles.logo}>🎓 E-Learning</div>
        <div style={styles.adminBadge}>Admin Panel</div>
      </div>

      {/* Navigation */}
      <div style={styles.navSection}>
        {navItems.map((item) => (
          <div
            key={item.id}
            style={{
              ...styles.navItem,
              ...(activeSection === item.id ? styles.navItemActive : {}),
            }}
            onClick={() => handleNavClick(item.id)}
            onMouseEnter={(e) => {
              if (activeSection !== item.id) {
                Object.assign(e.target.style, styles.navItemHover);
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.8)';
              }
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navText}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.sidebarFooter}>
        <div style={styles.userInfo}>
          Welcome, {user?.fullName || 'Admin'}
        </div>
        <button
          style={styles.logoutButton}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, styles.logoutButtonHover);
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
