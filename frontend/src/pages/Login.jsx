import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api'; // <-- keep your real backend API

// ------------------ Inline Styles ------------------
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  formSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#fff',
    minWidth: '350px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  backgroundSection: {
    flex: 1.5,
    backgroundColor: '#3f51b5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  formBox: {
    width: '100%',
    maxWidth: '360px',
    marginTop: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: '20px',
    marginBottom: '10px',
    backgroundColor: '#3f51b5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  errorText: {
    color: 'red',
    fontSize: '0.85rem',
    marginBottom: '5px',
    display: 'block',
  },
  link: {
    color: '#3f51b5',
    textDecoration: 'none',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  loader: {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
    marginRight: '8px',
  },
  popup: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#f44336',
    color: 'white',
    padding: '15px',
    borderRadius: '5px',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },
};

// ------------------ Popup Component ------------------
const Popup = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return <div style={styles.popup}>{message}</div>;
};

// ------------------ Login Page ------------------
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [toggle, setToggle] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Login form submitted with:', { email, password });
    setLoader(true);
    setError('');

    try {
      console.log('Making API call to /login');
      const res = await API.post('/login', { email, password });
      console.log('Login response:', res.data);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('name', res.data.user.fullName);

      // Dispatch custom event to notify navbar of auth state change
      window.dispatchEvent(new CustomEvent('authStateChanged'));

      const role = res.data.user.role;
      console.log('User role:', role, 'Navigating to dashboard');
      if (role === 'teacher') navigate('/TeacherDashboard');
      else if (role === 'student') navigate('/StudentDashboard');
      else if (role === 'admin') navigate('/AdminDashboard');
      else navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      setShowPopup(true);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Form Section */}
      <div style={styles.formSection}>
        <div style={styles.formBox}>
          <h2 style={{ color: '#1a237e', marginBottom: '8px' }}>Login</h2>
          <p style={{ color: '#757575', marginBottom: '20px' }}>
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleSubmit}>
            {error && <span style={styles.errorText}>{error}</span>}

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div style={{ position: 'relative' }}>
              <input
                type={toggle ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                style={{
                  ...styles.input,
                  paddingRight: '40px',
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setToggle(!toggle)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#757575',
                }}
              >
                {toggle ? '🙈' : '👁️'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '5px',
              }}
            >
              <label
                style={{
                  fontSize: '0.9rem',
                  color: '#757575',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input type="checkbox" name="remember" style={{ marginRight: '5px' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={styles.link}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" style={styles.button} disabled={loader}>
              {loader ? (
                <>
                  <span style={styles.loader}></span> Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>

            <div
              style={{
                marginTop: '15px',
                display: 'flex',
                fontSize: '0.9rem',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#757575' }}>Don't have an account?</span>
              <Link to="/signup" style={styles.link}>
                Signup
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Background Section */}
      <div style={styles.backgroundSection}>Login System</div>

      {/* Popup Message */}
      <Popup message={error} show={showPopup} onClose={() => setShowPopup(false)} />
    </div>
  );
}
