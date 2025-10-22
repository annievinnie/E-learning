<<<<<<< Updated upstream
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
=======
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
>>>>>>> Stashed changes

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);

      if (res.data.user.role === "teacher") navigate("/teacher");
      else if (res.data.user.role === "student") navigate("/student");
      else if (res.data.user.role === "admin") navigate("/admin");
      else navigate("/courses");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

<<<<<<< Updated upstream
  return (
    <div className="container d-flex flex-column align-items-center mt-5">
      <h2 className="mb-3">Login</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleLogin} className="w-50">
        <input type="email" className="form-control mb-2" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="form-control mb-2" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
=======
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
    const navigate = useNavigate();
    const [loginState, setLoginState] = useState({
        status: null,
        currentUser: null,
        response: null,
        currentRole: null,
    });
    
    // Real API call for login
    const loginUser = async (fields, userRole) => {
        try {
            const response = await API.post('/login', fields);
            const { token, user } = response.data;
            
            // Store token in localStorage
            localStorage.setItem('token', token);
            
            // Dispatch custom event to notify navbar of auth state change
            window.dispatchEvent(new CustomEvent('authStateChanged'));
            
            setLoginState({
                status: 'success',
                currentUser: user,
                currentRole: user.role,
            });
        } catch (error) {
            console.error('Login error:', error);
            setLoginState({
                status: 'failed',
                response: error.response?.data?.message || 'Login failed. Please try again.',
                currentRole: null,
            });
        }
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

    // Navigation function
    const navigateToDashboard = (userRole) => {
        if (userRole === 'admin') {
            navigate('/admin/dashboard');
        } else if (userRole === 'student') {
            navigate('/student/dashboard');
        } else if (userRole === 'teacher') {
            navigate('/teacher/dashboard');
        }
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

            loginUser({ email: rollNum, password }, role);
        } else {
            const email = form.email.value;
            const password = form.password.value;

            let hasError = false;
            if (!email) { setEmailError(true); hasError = true; } else { setEmailError(false); }
            if (!password) { setPasswordError(true); hasError = true; } else { setPasswordError(false); }

            if (hasError) return setLoader(false);

            loginUser({ email, password }, role);
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
            navigateToDashboard(loginState.currentRole);
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
                        Login
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
                        
                        {/* Sign up link for admin
                        {role === 'Admin' && (
                            <div style={{ marginTop: '15px', display: 'flex', fontSize: '0.9rem' }}>
                                <span style={{ color: '#757575' }}>Don't have an account?</span>
                                <MockLink to="/Adminregister">Sign up</MockLink>
                            </div>
                        )} */}
                        {/* Sign Link */}
                            <div style={{ marginTop: '15px', display: 'flex', fontSize: '0.9rem', justifyContent: 'center' }}>
                                <span style={{ color: '#757575' }}>Don't have an account?</span>
                                <MockLink to="/signup">Signup</MockLink>
                            </div>
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
>>>>>>> Stashed changes
