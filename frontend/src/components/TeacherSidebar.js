import React from 'react';
import { LogOut, GraduationCap, LayoutDashboard, Users, BookOpen, FileText, TrendingUp, X, User, Mail, DollarSign } from 'lucide-react';

// ------------------ Sidebar Styles ------------------
const styles = {
sidebar: {
width: '280px',
height: '100vh',
background: 'linear-gradient(180deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
color: 'white',
position: 'fixed',
left: 0,
top: 0,
zIndex: 1000,
display: 'flex',
flexDirection: 'column',
boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
overflow: 'hidden',
transition: 'transform 0.3s ease',
},
sidebarMobile: {
transform: 'translateX(-100%)',
},
sidebarMobileOpen: {
transform: 'translateX(0)',
},
sidebarHeader: {
padding: '2rem 1.5rem',
borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
textAlign: 'center',
position: 'relative',
background: 'rgba(0, 0, 0, 0.1)',
backdropFilter: 'blur(10px)',
},
logo: {
fontSize: '1.6rem',
fontWeight: '700',
marginBottom: '1rem',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
gap: '0.75rem',
background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
WebkitBackgroundClip: 'text',
WebkitTextFillColor: 'transparent',
backgroundClip: 'text',
letterSpacing: '-0.5px',
},
teacherBadge: {
fontSize: '0.8rem',
color: '#1a237e',
background: 'linear-gradient(135deg, #ffd54f 0%, #ffc107 100%)',
padding: '0.4rem 0.9rem',
borderRadius: '20px',
display: 'inline-block',
boxShadow: '0 4px 15px rgba(255, 213, 79, 0.4)',
textTransform: 'uppercase',
letterSpacing: '0.5px',
fontWeight: '600',
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
fontSize: '1.4rem',
width: '28px',
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
background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.9) 100%)',
color: '#fff',
border: '1px solid rgba(255, 255, 255, 0.2)',
padding: '0.75rem 1.5rem',
borderRadius: '10px',
cursor: 'pointer',
fontSize: '0.9rem',
fontWeight: 600,
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
width: '100%',
boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
},
logoutButtonHover: {
background: 'linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(211, 47, 47, 1) 100%)',
color: '#fff',
borderColor: 'rgba(255, 255, 255, 0.3)',
transform: 'translateY(-2px)',
boxShadow: '0 6px 20px rgba(244, 67, 54, 0.5)'
},
};

// Icon mapping
const iconMap = {
  dashboard: LayoutDashboard,
  students: Users,
  courses: BookOpen,
  assignments: FileText,
  payments: DollarSign,
  grades: TrendingUp,
  profile: User,
  contact: Mail,
};

// ------------------ Sidebar Component ------------------
const TeacherSidebar = ({ activeSection, onSectionChange, user, onLogout, isOpen = false, onClose }) => {
const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth <= 768);

React.useEffect(() => {
const handleResize = () => {
  setIsMobile(window.innerWidth <= 768);
};
window.addEventListener('resize', handleResize);
return () => window.removeEventListener('resize', handleResize);
}, []);

const navItems = [
{ id: 'dashboard', label: 'Dashboard', iconKey: 'dashboard' },
{ id: 'students', label: 'Students', iconKey: 'students' },
{ id: 'courses', label: 'My Courses', iconKey: 'courses' },
{ id: 'assignments', label: 'Assignments', iconKey: 'assignments' },
{ id: 'payments', label: 'Payments', iconKey: 'payments' },
{ id: 'profile', label: 'Profile', iconKey: 'profile' },
{ id: 'contact', label: 'Contact Us', iconKey: 'contact' },
// { id: 'grades', label: 'Grades', iconKey: 'grades' }, // Commented out for now
];

const handleNavClick = (sectionId) => {
onSectionChange(sectionId);
if (isMobile && onClose) {
  onClose();
}
};

const handleLogout = () => {
if (window.confirm('Are you sure you want to logout?')) {
onLogout();
}
};

return (
<div style={{
  ...styles.sidebar,
  ...(isMobile ? (isOpen ? styles.sidebarMobileOpen : styles.sidebarMobile) : {})
}}>
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
<div style={styles.sidebarHeader}>
<div style={styles.logo}>
  <GraduationCap size={36} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }} />
  <span>E-Learning</span>
</div>
<div style={styles.teacherBadge}>Teacher Panel</div>
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
<span style={styles.navIcon}>
  {React.createElement(iconMap[item.iconKey], { size: 20 })}
</span>
<span style={styles.navText}>{item.label}</span>
</div>
))}
</div>

{/* Footer */}
<div style={styles.sidebarFooter}>
<div style={styles.userInfo}>
Welcome, {user?.fullName || 'Teacher'}
</div>
<button
style={styles.logoutButton}
onClick={handleLogout}
onMouseEnter={(e) => {
Object.assign(e.target.style, styles.logoutButtonHover);
const icon = e.target.querySelector('svg');
if (icon) {
  icon.style.transform = 'translateX(4px) scale(1.1)';
}
}}
onMouseLeave={(e) => {
Object.assign(e.target.style, styles.logoutButton);
const icon = e.target.querySelector('svg');
if (icon) {
  icon.style.transform = 'translateX(0) scale(1)';
}
}}
>
<LogOut size={18} style={{ marginRight: '8px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
Logout
</button>
</div>
</div>
);
};

export default TeacherSidebar;