import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

// Simple inline styles - keeping original structure
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
    },
    backgroundSection: {
        flex: 1.5,
        backgroundColor: '#3f51b5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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
        backgroundColor: '#4caf50',
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
        backgroundColor: '#4caf50',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    },
    imageStyle: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
};

// Mock Link component
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
    const [showPassword, setShowPassword] = useState(false);
    
    // Form validation
    const [errors, setErrors] = useState({});
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    // Password validation function
    const validatePassword = (password) => {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        setPasswordRequirements(requirements);
        return Object.values(requirements).every(req => req === true);
    };

    // Get password error message
    const getPasswordErrorMessage = () => {
        const missing = [];
        if (!passwordRequirements.minLength) missing.push('at least 8 characters long');
        if (!passwordRequirements.hasUppercase) missing.push('at least one uppercase letter (A-Z)');
        if (!passwordRequirements.hasLowercase) missing.push('at least one lowercase letter (a-z)');
        if (!passwordRequirements.hasNumber) missing.push('at least one number (0-9)');
        if (!passwordRequirements.hasSpecialChar) missing.push('at least one special character (!@#$%^&* etc.)');
        
        if (missing.length > 0) {
            return `Password must include: ${missing.join(', ')}.`;
        }
        return '';
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm({ ...form, [name]: value });
        setErrors(prev => ({ ...prev, [name]: false }));
        
        // Real-time password validation
        if (name === 'password') {
            validatePassword(value);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        if (!form.fullName) newErrors.fullName = true;
        if (!form.email) newErrors.email = true;
        
        // Validate password with all requirements
        if (!form.password || !validatePassword(form.password)) {
            newErrors.password = true;
        }
        
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
        
        try {
            const response = await fetch('http://localhost:5001/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isApplication) {
                    setMessage(data.message || 'Teacher application submitted successfully! Your application is pending admin approval.');
                    setIsError(false);
                    setShowPopup(true);
                    setTimeout(() => {
                        navigate('/');
                        setLoader(false);
                    }, 3000);
                } else {
                    setMessage(data.message || 'Account created successfully!');
                    setIsError(false);
                    setShowPopup(true);
                    setTimeout(() => {
                        navigate('/');
                        setLoader(false);
                    }, 1000);
                }
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
    };

    return (
        <>
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
                                {errors.password && form.password && (
                                    <span style={styles.errorText}>{getPasswordErrorMessage()}</span>
                                )}
                                {!form.password && errors.password && (
                                    <span style={styles.errorText}>Password is required</span>
                                )}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={form.password}
                                        style={{
                                            ...styles.input, 
                                            borderColor: errors.password ? '#d32f2f' : 
                                                        (form.password && Object.values(passwordRequirements).every(r => r)) ? '#4caf50' : '#ccc',
                                            paddingRight: '45px'
                                        }}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '5px',
                                            color: '#757575',
                                            fontSize: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <Eye size={18} />
                                        ) : (
                                            <EyeOff size={18} />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Password Requirements Indicator */}
                                {form.password && (
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '10px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem'
                                    }}>
                                        <div style={{ marginBottom: '4px', fontWeight: '500', color: '#333' }}>
                                            Password Requirements:
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                color: passwordRequirements.minLength ? '#4caf50' : '#757575'
                                            }}>
                                                <span style={{ marginRight: '8px', fontSize: '14px' }}>
                                                    {passwordRequirements.minLength ? '✓' : '○'}
                                                </span>
                                                At least 8 characters
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                color: passwordRequirements.hasUppercase ? '#4caf50' : '#757575'
                                            }}>
                                                <span style={{ marginRight: '8px', fontSize: '14px' }}>
                                                    {passwordRequirements.hasUppercase ? '✓' : '○'}
                                                </span>
                                                One uppercase letter (A-Z)
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                color: passwordRequirements.hasLowercase ? '#4caf50' : '#757575'
                                            }}>
                                                <span style={{ marginRight: '8px', fontSize: '14px' }}>
                                                    {passwordRequirements.hasLowercase ? '✓' : '○'}
                                                </span>
                                                One lowercase letter (a-z)
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                color: passwordRequirements.hasNumber ? '#4caf50' : '#757575'
                                            }}>
                                                <span style={{ marginRight: '8px', fontSize: '14px' }}>
                                                    {passwordRequirements.hasNumber ? '✓' : '○'}
                                                </span>
                                                One number (0-9)
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                color: passwordRequirements.hasSpecialChar ? '#4caf50' : '#757575'
                                            }}>
                                                <span style={{ marginRight: '8px', fontSize: '14px' }}>
                                                    {passwordRequirements.hasSpecialChar ? '✓' : '○'}
                                                </span>
                                                One special character (!@#$%^&* etc.)
                                            </div>
                                        </div>
                                    </div>
                                )}
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

                {/* Background Section (Right Column) - Image instead of text */}
                <div style={styles.backgroundSection}>
                    <img
                        src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=800&fit=crop&q=80"
                        alt="E-Learning Management System"
                        style={styles.imageStyle}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="color: white; font-size: 2rem; font-weight: bold; padding: 20px; text-align: center;">E-Learning Management System</div>';
                        }}
                    />
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
