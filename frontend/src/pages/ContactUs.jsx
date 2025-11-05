import { useState } from 'react';

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
    overflow: 'hidden',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
  textarea: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif',
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
  successText: {
    color: 'green',
    fontSize: '0.85rem',
    marginBottom: '5px',
    display: 'block',
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
  errorPopup: {
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
const Popup = ({ message, show, onClose, isError = false }) => {
  if (!show) return null;

  return (
    <div 
      style={isError ? styles.errorPopup : styles.popup}
      onClick={onClose}
    >
      {message}
    </div>
  );
};

// ------------------ Contact Us Page ------------------
export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isErrorPopup, setIsErrorPopup] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Contact form submitted with:', formData);
    
    // Basic validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setIsErrorPopup(true);
      setShowPopup(true);
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      setIsErrorPopup(true);
      setShowPopup(true);
      return;
    }
    
    if (!formData.message.trim()) {
      setError('Message is required');
      setIsErrorPopup(true);
      setShowPopup(true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsErrorPopup(true);
      setShowPopup(true);
      return;
    }

    setLoader(true);
    setError('');
    setSuccess('');

    try {
      // For now, just simulate a successful submission
      // In the future, this would make an API call to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Contact form submitted successfully');
      setSuccess('Thank you for your message! We will get back to you soon.');
      setIsErrorPopup(false);
      setShowPopup(true);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        message: ''
      });
      
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again.');
      setIsErrorPopup(true);
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
          <h2 style={{ color: '#1a237e', marginBottom: '8px' }}>Contact Us</h2>
          <p style={{ color: '#757575', marginBottom: '20px' }}>
            We'd love to here you! Send us a message and we'll respond as soon as possible.
          </p>

          <form onSubmit={handleSubmit}>
            {error && <span style={styles.errorText}>{error}</span>}
            {success && <span style={styles.successText}>{success}</span>}

            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              style={styles.input}
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              style={styles.input}
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <textarea
              name="message"
              placeholder="Enter your message"
              style={styles.textarea}
              value={formData.message}
              onChange={handleInputChange}
              required
            />

            <button 
              type="submit" 
              style={styles.button} 
              disabled={loader}
              onMouseEnter={(e) => {
                if (!loader) {
                  e.target.style.backgroundColor = '#303f9f';
                }
              }}
              onMouseLeave={(e) => {
                if (!loader) {
                  e.target.style.backgroundColor = '#3f51b5';
                }
              }}
            >
              {loader ? (
                <>
                  <span style={styles.loader}></span> Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Background Section */}
      <div style={styles.backgroundSection}>
        <img
          src="/images/contactUs.jpeg"
          alt="Contact Us"
          style={styles.imageStyle}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div style="color: white; font-size: 2rem; font-weight: bold; padding: 20px; text-align: center;">Get in Touch</div>';
          }}
        />
      </div>

      {/* Popup Message */}
      <Popup 
        message={isErrorPopup ? error : success} 
        show={showPopup} 
        onClose={() => setShowPopup(false)}
        isError={isErrorPopup}
      />
    </div>
  );
}
