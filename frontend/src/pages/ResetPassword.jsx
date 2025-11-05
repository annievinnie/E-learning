import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

// API function for reset password
const resetPasswordAPI = async (token, password) => {
    const response = await fetch('http://localhost:5001/api/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
    });
    
    const data = await response.json();
    return { success: response.ok, data };
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

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setMessage('Invalid reset link. Please request a new password reset.');
            setSuccess(false);
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

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

        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
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
                setMessage(result.data.message);
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                setMessage(result.data.message || 'Something went wrong. Please try again.');
                setSuccess(false);
            }
        } catch (error) {
            setLoader(false);
            setMessage('Network error. Please check your connection and try again.');
            setSuccess(false);
        }
    };

    const handleInputChange = () => {
        setPasswordError('');
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
                        <label>
                            {passwordError && <span style={styles.errorText}>{passwordError}</span>}
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter new password"
                                style={{...styles.input, borderColor: passwordError ? 'red' : '#ccc'}}
                                onChange={handleInputChange}
                                autoFocus
                            />
                        </label>

                        <label>
                            {confirmPasswordError && <span style={styles.errorText}>{confirmPasswordError}</span>}
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                style={{...styles.input, borderColor: confirmPasswordError ? 'red' : '#ccc'}}
                                onChange={handleInputChange}
                            />
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
