import { useState } from 'react';

// A simple internal style object for a clean look, mirroring the LoginPage styles
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
  // Keyframes for the simple loader animation (Note: inline styles don't easily support keyframes, 
  // but we'll include the style object property for conceptual completeness)
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

// Mock Link component (since we don't have react-router-dom)
const MockLink = ({ to, children, style }) => (
    <a href={to || '#'} style={{...styles.link, ...style}}>{children}</a>
);

// ------------------ ForgetPasswordPage Component ------------------

const ForgetPasswordPage = ({ role = 'User' }) => {
    // We only need the loader and email state for this simple component
    const [loader, setLoader] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        setMessage('');
        setSuccess(false);
        setLoader(true);

        const email = event.target.email.value;

        if (!email) {
            setEmailError(true);
            setLoader(false);
            return;
        }
        setEmailError(false);

        // --- Mocking API Request ---
        setTimeout(() => {
            setLoader(false);
            if (email.includes('@')) {
                // Simulate successful request
                setMessage('A password reset link has been sent to your email address.');
                setSuccess(true);
            } else {
                // Simulate failure (e.g., email not found)
                setMessage('Could not find an account associated with that email.');
                setSuccess(false);
            }
        }, 2000);
    };

    const handleInputChange = () => {
        setEmailError(false);
        setMessage('');
    };

    return (
        <div style={styles.container}>
            {/* Form Section */}
            <div style={styles.formSection}>
                <div style={styles.formBox}>
                    <h2 style={{ color: '#1a237e', marginBottom: '8px' }}>
                        Forgot Password
                    </h2>
                    <p style={{ color: '#757575', marginBottom: '20px', lineHeight: '1.4' }}>
                        Enter your {role}'s email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
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
                            disabled={loader}
                        >
                            {loader ? (
                                <>
                                    <span style={styles.loader}></span>
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                        
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <MockLink to="/" style={{ fontSize: '0.9rem' }}>
                                Back to Login
                            </MockLink>
                        </div>

                    </form>
                </div>
            </div>

            {/* Background Image Section (Simplified) */}
            <div style={styles.backgroundSection}>
                Password Reset
            </div>
        </div>
    );
};

export default ForgetPasswordPage;