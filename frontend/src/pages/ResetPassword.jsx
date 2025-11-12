import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import API from '../api';

// API function for reset password
const resetPasswordAPI = async (token, password) => {
    try {
        const response = await API.post('/reset-password', { token, password });
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            data: error.response?.data || { message: error.message || 'Network error. Please check your connection and try again.' }
        };
    }
};

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
    paddingRight: '45px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#757575',
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
    fontWeight: '500',
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
};

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setMessage('Invalid reset link. Please request a new password reset.');
            setSuccess(false);
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    // Password validation function
    const validatePassword = (pwd) => {
        const requirements = {
            minLength: pwd.length >= 8,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
        };
        setPasswordRequirements(requirements);
        return Object.values(requirements).every(req => req === true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setSuccess(false);
        setPasswordError('');
        setConfirmPasswordError('');
        setLoader(true);

        const password = event.target.password.value;
        const confirmPassword = event.target.confirmPassword.value;

        // Validation
        if (!password) {
            setPasswordError('Password is required');
            setLoader(false);
            return;
        }

        if (!validatePassword(password)) {
            setPasswordError('Password does not meet all requirements');
            setLoader(false);
            return;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            setLoader(false);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            setLoader(false);
            return;
        }

        try {
            const result = await resetPasswordAPI(token, password);
            setLoader(false);
            
            if (result.success) {
                setMessage(result.data.message || 'Password has been reset successfully!');
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                // Show specific error message from backend
                const errorMsg = result.data?.message || 'Something went wrong. Please try again.';
                setMessage(errorMsg);
                setSuccess(false);
            }
        } catch (error) {
            setLoader(false);
            console.error('Reset password error:', error);
            // This catch block should rarely be hit now since resetPasswordAPI handles errors
            setMessage(error.message || 'Network error. Please check your connection and try again.');
            setSuccess(false);
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);
        setPasswordError('');
        setMessage('');
    };

    const handleConfirmPasswordChange = () => {
        setConfirmPasswordError('');
        setMessage('');
    };

    return (
        <div style={styles.container}>
            {/* Form Section */}
            <div style={styles.formSection}>
                <div style={styles.formBox}>
                    <h2 style={{ color: '#1a237e', marginBottom: '8px' }}>
                        Reset Password
                    </h2>
                    <p style={{ color: '#757575', marginBottom: '20px', lineHeight: '1.4' }}>
                        Enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                        <label style={{ display: 'block', position: 'relative' }}>
                            {passwordError && <span style={styles.errorText}>{passwordError}</span>}
                            <div style={styles.inputWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter new password"
                                    value={password}
                                    style={{
                                        ...styles.input, 
                                        borderColor: passwordError ? 'red' : '#ccc',
                                        paddingRight: '45px'
                                    }}
                                    onChange={handlePasswordChange}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            
                            {/* Password Requirements */}
                            {password && (
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

                        <label style={{ display: 'block', position: 'relative' }}>
                            {confirmPasswordError && <span style={styles.errorText}>{confirmPasswordError}</span>}
                            <div style={styles.inputWrapper}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    style={{
                                        ...styles.input, 
                                        borderColor: confirmPasswordError ? 'red' : '#ccc',
                                        paddingRight: '45px'
                                    }}
                                    onChange={handleConfirmPasswordChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </label>
                        
                        {/* Display the message/result of the submission */}
                        {message && (
                            <p style={{ 
                                color: success ? 'green' : 'red', 
                                fontSize: '0.9rem', 
                                marginTop: '10px' 
                            }}>
                                {message}
                            </p>
                        )}

                        <button 
                            type="submit" 
                            style={styles.button}
                            disabled={loader || !token}
                        >
                            {loader ? (
                                <>
                                    <span style={styles.loader}></span>
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                        
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <Link to="/" style={{ fontSize: '0.9rem', ...styles.link }}>
                                Back to Login
                            </Link>
                        </div>

                    </form>
                </div>
            </div>

            {/* Background Image Section */}
            <div style={styles.backgroundSection}>
                Password Reset
            </div>
        </div>
    );
};

export default ResetPasswordPage;
