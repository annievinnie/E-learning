import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
// A simple internal style object for a clean look, mimicking a basic CSS file
const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        fontFamily: 'Inter, Arial, sans-serif',
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
        borderRadius: '8px 0 0 8px', // Rounded on the left side
    },
    backgroundSection: {
        flex: 1.5,
        backgroundColor: '#3f51b5', // Simple dark blue background
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold',
        padding: '20px',
        textAlign: 'center',
        borderRadius: '0 8px 8px 0', // Rounded on the right side
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
    select: {
        width: '100%',
        padding: '12px',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
    },
    button: {
        width: '100%',
        padding: '12px',
        marginTop: '20px',
        marginBottom: '10px',
        backgroundColor: '#4caf50', // Green button for signup
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
    },
    errorText: {
        color: '#d32f2f',
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
        backgroundColor: '#4caf50', // Success color
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    }
};

// Mock Link/StyledLink component
const MockLink = ({ to, children }) => (
    <a href={to || '#'} style={styles.link}>{children}</a>
);

// Mock Popup component
const MockPopup = ({ message, showPopup, setShowPopup, isError = false }) => {
    useEffect(() => {
        if (showPopup) {
            const timer = setTimeout(() => {
                setShowPopup(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showPopup, setShowPopup]);

    if (!showPopup) return null;

    const popupStyle = {
        ...styles.popup,
        backgroundColor: isError ? '#f44336' : '#4caf50',
    };

    return (
        <div style={popupStyle}>
            {message}
        </div>
    );
};

// Main Signup Component
const SignupPage = () => {
  const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    
    // Simple mock for form validation
    const [errors, setErrors] = useState({});

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm({ ...form, [name]: value });
        setErrors(prev => ({ ...prev, [name]: false })); // Clear error on change
    };

    const validateForm = () => {
        let newErrors = {};
        if (!form.fullName) newErrors.fullName = true;
        if (!form.email) newErrors.email = true;
        if (!form.password || form.password.length < 3) newErrors.password = true;
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            setMessage('Please fill out all fields correctly.');
            setIsError(true);
            setShowPopup(true);
            return;
        }

        setLoader(true);
        
        // --- Mock API Call Simulation ---
            try {
            const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(data.message || 'Account created successfully!');
            setIsError(false);
            setShowPopup(true);
            setTimeout(() => {
                // console.log('Navigating to login...');
                navigate('/');
                setLoader(false);
            }, 1000);
        } else {
            setMessage(data.message || 'Registration failed.');
            setIsError(true);
            setShowPopup(true);
            setLoader(false);
        }
    } catch (error) {
        console.error(error);
        setMessage('Network error.');
        setIsError(true);
        setShowPopup(true);
        setLoader(false);
    }

        // --- End Mock API Call Simulation ---
    };

    return (
        <>
            {/* Inject CSS for keyframes since inline styles don't support it */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            
            <div style={styles.container}>
                {/* Form Section (Left Column) */}
                <div style={styles.formSection}>
                    <div style={styles.formBox}>
                        <h2 style={{ color: '#1a237e', marginBottom: '8px' }}>
                            Create Your Account
                        </h2>
                        <p style={{ color: '#757575', marginBottom: '20px' }}>
                            Join our platform by filling in your details below.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Full Name Field */}
                            <label style={{ display: 'block', position: 'relative' }}>
                                {errors.fullName && <span style={styles.errorText}>Full Name is required</span>}
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={form.fullName}
                                    style={{...styles.input, borderColor: errors.fullName ? 'red' : '#ccc'}}
                                    onChange={handleInputChange}
                                    autoFocus
                                />
                            </label>

                            {/* Role Selection Field */}
                            <label style={{ display: 'block', position: 'relative' }}>
                                <select 
                                    name="role"
                                    value={form.role}
                                    style={styles.select}
                                    onChange={handleInputChange}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>

                            {/* Email Field */}
                            <label style={{ display: 'block', position: 'relative' }}>
                                {errors.email && <span style={styles.errorText}>Valid Email is required</span>}
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={form.email}
                                    style={{...styles.input, borderColor: errors.email ? 'red' : '#ccc'}}
                                    onChange={handleInputChange}
                                />
                            </label>

                            {/* Password Field */}
                            <label style={{ display: 'block', position: 'relative' }}>
                                {errors.password && <span style={styles.errorText}>Password (min 3 chars) is required</span>}
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    style={{...styles.input, borderColor: errors.password ? 'red' : '#ccc'}}
                                    onChange={handleInputChange}
                                />
                            </label>
                            
                            <button 
                                type="submit" 
                                style={styles.button}
                                disabled={loader}
                            >
                                {loader ? (
                                    <>
                                        <span style={styles.loader}></span>
                                        Signing Up...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                            
                            {/* Login Link */}
                            <div style={{ marginTop: '15px', display: 'flex', fontSize: '0.9rem', justifyContent: 'center' }}>
                                <span style={{ color: '#757575' }}>Already have an account?</span>
                                <MockLink to="/">Login</MockLink>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Background Section (Right Column) */}
                <div style={styles.backgroundSection}>
                    <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                        E-Learning Management System
                    </div>
                </div>
                
                {/* Mock Popup */}
                <MockPopup 
                    message={message} 
                    showPopup={showPopup} 
                    setShowPopup={setShowPopup} 
                    isError={isError}
                />
            </div>
        </>
    );
};

export default SignupPage;
