import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../../api';

const TeacherApplicationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    teachingExperience: '',
    coursesKnown: [],
    confidenceLevel: '',
  });
  const [currentCourse, setCurrentCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleAddCourse = () => {
    if (currentCourse.trim() && !formData.coursesKnown.includes(currentCourse.trim())) {
      setFormData(prev => ({
        ...prev,
        coursesKnown: [...prev.coursesKnown, currentCourse.trim()]
      }));
      setCurrentCourse('');
    }
  };

  const handleRemoveCourse = (course) => {
    setFormData(prev => ({
      ...prev,
      coursesKnown: prev.coursesKnown.filter(c => c !== course)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.age || formData.age < 18) {
      setError('Age is required and must be at least 18');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!formData.teachingExperience.trim()) {
      setError('Teaching experience is required');
      return;
    }
    if (formData.coursesKnown.length === 0) {
      setError('Please add at least one course you know');
      return;
    }
    if (!formData.confidenceLevel) {
      setError('Please select your confidence level');
      return;
    }

    setLoading(true);
    setError(''); // Clear previous errors

    try {
      console.log('Submitting application with data:', formData);
      console.log('API instance:', API);
      console.log('API base URL:', API.defaults?.baseURL);
      
      // Explicitly use full URL to ensure it reaches the backend on port 5000
      const backendUrl = 'http://localhost:5000/api/teacher/apply';
      console.log('Making request to:', backendUrl);
      console.log('Request data:', JSON.stringify(formData, null, 2));
      
      const response = await axios.post(backendUrl, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {})
        },
        timeout: 10000 // 10 second timeout
      });
      console.log('Application response:', response.data);
      
      if (response.data && response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        const errorMsg = response.data?.message || 'Failed to submit application. Please try again.';
        console.error('Unexpected response:', response.data);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('=== APPLICATION ERROR DETAILS ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      console.error('Request config:', err.config);
      console.error('================================');
      
      // More detailed error messages
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (err.response) {
        // Server responded with an error status
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid form data. Please check all fields are filled correctly.';
        } else if (err.response.status === 401) {
          errorMessage = 'Unauthorized. Please try again.';
        } else if (err.response.status === 403) {
          errorMessage = 'Access forbidden.';
        } else if (err.response.status === 404) {
          errorMessage = 'Endpoint not found. Please check if the backend server is configured correctly.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else {
          errorMessage = `Server error (${err.response.status}). Please try again.`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network error: Could not connect to the server. Please make sure the backend server is running on http://localhost:5001';
      } else {
        // Something else happened
        errorMessage = `Error: ${err.message || 'Unknown error occurred'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#1a237e', marginBottom: '15px' }}>Application Submitted!</h2>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '20px' }}>
            Admin will contact you shortly. Thank you for your interest in becoming a teacher!
          </p>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#1a237e', marginBottom: '10px', textAlign: 'center' }}>
          Teacher Application Form
        </h2>
        <p style={{ color: '#757575', marginBottom: '30px', textAlign: 'center' }}>
          Fill out the form below to apply as a teacher on our platform
        </p>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #ef5350'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Full Name <span style={{ color: 'red' }}>*</span>
            </span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </label>

          {/* Age */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Age <span style={{ color: 'red' }}>*</span>
            </span>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="18"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </label>

          {/* Email */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Email <span style={{ color: 'red' }}>*</span>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </label>

          {/* Phone */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Phone Number <span style={{ color: 'red' }}>*</span>
            </span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              required
            />
          </label>

          {/* Teaching Experience */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Teaching Experience <span style={{ color: 'red' }}>*</span>
            </span>
            <textarea
              name="teachingExperience"
              value={formData.teachingExperience}
              onChange={handleInputChange}
              placeholder="Describe your teaching experience (e.g., '5 years teaching Mathematics', 'Taught coding bootcamp for 2 years')"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical',
                fontFamily: 'Arial, sans-serif',
                boxSizing: 'border-box'
              }}
              required
            />
          </label>

          {/* Courses Known */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Courses You Know <span style={{ color: 'red' }}>*</span>
            </span>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={currentCourse}
                onChange={(e) => setCurrentCourse(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCourse();
                  }
                }}
                placeholder="Enter course name and press Enter or click Add"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handleAddCourse}
                style={{
                  padding: '12px 20px',
                  background: '#3f51b5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Add
              </button>
            </div>
            {formData.coursesKnown.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.coursesKnown.map((course, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(course)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1976d2',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0',
                        lineHeight: '1'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </label>

          {/* Confidence Level */}
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>
              Confidence Level <span style={{ color: 'red' }}>*</span>
            </span>
            <select
              name="confidenceLevel"
              value={formData.confidenceLevel}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                background: 'white'
              }}
              required
            >
              <option value="">Select confidence level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ccc' : '#3f51b5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherApplicationForm;

