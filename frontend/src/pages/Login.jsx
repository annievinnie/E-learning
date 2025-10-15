import { useEffect, useState } from 'react';

// A simple internal style object for a clean look, mimicking a basic CSS file
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
    backgroundColor: '#3f51b5', // Simple dark blue background
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
  buttonHover: {
    backgroundColor: '#303f9f',
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
  // Keyframes for the simple loader animation
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
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
  }
};


// ------------------ Helper Components (Mimicking deleted ones) ------------------

// Mock Link/StyledLink component
const MockLink = ({ to, children }) => (
    <a href={to || '#'} style={styles.link}>{children}</a>
);

// Mock Popup component
const MockPopup = ({ message, showPopup, setShowPopup }) => {
    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => {
                setShowPopup(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showPopup, setShowPopup]);

    if (!showPopup) return null;

    return (
        <div style={styles.popup}>
            {message}
        </div>
    );
};

// ------------------ LoginPage Component ------------------

const LoginPage = ({ role }) => {
    // We'll mock the Redux state and dispatch here since you're stripping dependencies
    const [loginState, setLoginState] = useState({
        status: null,
        currentUser: null,
        response: null,
        currentRole: null,
    });
    
    // Dispatch/API Mock
    const mockLoginUser = (fields, role) => {
        // Simulate a network delay
        setTimeout(() => {
            if (fields.password === '123') { // Simple success condition
                setLoginState({
                    status: 'success',
                    currentUser: { id: 1, name: role },
                    currentRole: role,
                });
            } else {
                setLoginState({
                    status: 'failed',
                    response: 'Invalid credentials. Try "123" for password.',
                    currentRole: null,
                });
            }
        }, 1500);
    };

    // Original state variables
    const [toggle, setToggle] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    // Mock Navigation function
    const mockNavigate = (path) => {
        console.log(`Navigating to: ${path}`);
        // In a real app, this would change the browser URL
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoader(true);

        const form = event.target;
        
        if (role === 'Student') {
            const rollNum = form.rollNumber.value;
            const studentName = form.studentName.value;
            const password = form.password.value;

            let hasError = false;
            if (!rollNum) { setRollNumberError(true); hasError = true; } else { setRollNumberError(false); }
            if (!studentName) { setStudentNameError(true); hasError = true; } else { setStudentNameError(false); }
            if (!password) { setPasswordError(true); hasError = true; } else { setPasswordError(false); }
            
            if (hasError) return setLoader(false);

            mockLoginUser({ rollNum, studentName, password }, role);
        } else {
            const email = form.email.value;
            const password = form.password.value;

            let hasError = false;
            if (!email) { setEmailError(true); hasError = true; } else { setEmailError(false); }
            if (!password) { setPasswordError(true); hasError = true; } else { setPasswordError(false); }

            if (hasError) return setLoader(false);

            mockLoginUser({ email, password }, role);
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'rollNumber') setRollNumberError(false);
        if (name === 'studentName') setStudentNameError(false);
    };

    // Effect to handle login status and navigation
    useEffect(() => {
        if (loginState.status === 'success' && loginState.currentUser !== null) {
            if (loginState.currentRole === 'Admin') {
                mockNavigate('/Admin/dashboard');
            } else if (loginState.currentRole === 'Student') {
                mockNavigate('/Student/dashboard');
            } else if (loginState.currentRole === 'Teacher') {
                mockNavigate('/Teacher/dashboard');
            }
            setLoader(false);
        } else if (loginState.status === 'failed') {
            setMessage(loginState.response);
            setShowPopup(true);
            setLoader(false);
        } else if (loginState.status === 'error') {
            setMessage('Network Error');
            setShowPopup(true);
            setLoader(false);
        }
    }, [loginState]);

    return (
        <div style={styles.container}>
            {/* Form Section */}
            <div style={styles.formSection}>
                <div style={styles.formBox}>
                    <h2 style={{ color: '#1a237e', marginBottom: '8px' }}>
                        {role} Login
                    </h2>
                    <p style={{ color: '#757575', marginBottom: '20px' }}>
                        Welcome back! Please enter your details.
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                        {role === 'Student' ? (
                            <>
                                <label>
                                    {rollNumberError && <span style={styles.errorText}>Roll Number is required</span>}
                                    <input
                                        type="number"
                                        name="rollNumber"
                                        placeholder="Enter your Roll Number"
                                        style={{...styles.input, borderColor: rollNumberError ? 'red' : '#ccc'}}
                                        onChange={handleInputChange}
                                        autoFocus
                                    />
                                </label>
                                <label>
                                    {studentNameError && <span style={styles.errorText}>Name is required</span>}
                                    <input
                                        type="text"
                                        name="studentName"
                                        placeholder="Enter your name"
                                        style={{...styles.input, borderColor: studentNameError ? 'red' : '#ccc'}}
                                        onChange={handleInputChange}
                                    />
                                </label>
                            </>
                        ) : (
                            <label>
                                {emailError && <span style={styles.errorText}>Email is required</span>}
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    style={{...styles.input, borderColor: emailError ? 'red' : '#ccc'}}
                                    onChange={handleInputChange}
                                    autoFocus
                                />
                            </label>
                        )}

                        <label style={{ position: 'relative', display: 'block' }}>
                            {passwordError && <span style={styles.errorText}>Password is required</span>}
                            <input
                                type={toggle ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                style={{...styles.input, borderColor: passwordError ? 'red' : '#ccc', paddingRight: '40px'}}
                                onChange={handleInputChange}
                            />
                            {/* Simple icon/text for toggle */}
                            <span
                                onClick={() => setToggle(!toggle)}
                                style={{ 
                                    position: 'absolute', 
                                    right: '10px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    cursor: 'pointer',
                                    color: '#757575'
                                }}
                            >
                                {toggle ? '🙈' : '👁️'}
                            </span>
                        </label>
                        
                        {/* Remember me and forgot password */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#757575', display: 'flex', alignItems: 'center' }}>
                                <input type="checkbox" name="remember" style={{ marginRight: '5px' }} />
                                Remember me
                            </label>
                            <MockLink to="#">Forgot password?</MockLink>
                        </div>

                        <button 
                            type="submit" 
                            style={styles.button}
                            disabled={loader}
                        >
                            {loader ? (
                                <>
                                    <span style={styles.loader}></span>
                                    Logging in...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </button>
                        
                        {/* Sign up link for admin */}
                        {role === 'Admin' && (
                            <div style={{ marginTop: '15px', display: 'flex', fontSize: '0.9rem' }}>
                                <span style={{ color: '#757575' }}>Don't have an account?</span>
                                <MockLink to="/Adminregister">Sign up</MockLink>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Background Image Section (Simplified) */}
            <div style={styles.backgroundSection}>
                Login System
            </div>
            
            {/* Mock Popup */}
            <MockPopup 
                message={message} 
                showPopup={showPopup} 
                setShowPopup={setShowPopup} 
            />
        </div>
    );
};

export default LoginPage;