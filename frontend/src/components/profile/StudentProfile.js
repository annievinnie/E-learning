import React, { useState, useEffect } from 'react';
import API from '../../api';

const StudentProfile = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    profilePicture: '',
    interests: []
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [pictureInputType, setPictureInputType] = useState('file'); // 'file' or 'url'
  const [currentInterest, setCurrentInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        bio: user.bio || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        zipCode: user.zipCode || '',
        profilePicture: user.profilePicture || '',
        interests: user.interests || []
      });
      
      // Set profile picture preview
      if (user.profilePicture) {
        if (user.profilePicture.startsWith('http')) {
          setProfilePicturePreview(user.profilePicture);
          setProfilePictureUrl(user.profilePicture);
          setPictureInputType('url');
        } else {
          // Local file path - construct full URL
          setProfilePicturePreview(`http://localhost:5000${user.profilePicture}`);
          setPictureInputType('file');
        }
      } else {
        setProfilePicturePreview('');
        setProfilePictureUrl('');
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddInterest = () => {
    if (currentInterest.trim() && !formData.interests.includes(currentInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, currentInterest.trim()]
      }));
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, GIF, or WebP).' });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
        return;
      }
      
      setProfilePictureFile(file);
      setProfilePictureUrl(''); // Clear URL when file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUrlChange = (e) => {
    const url = e.target.value;
    setProfilePictureUrl(url);
    setProfilePictureFile(null); // Clear file when URL is entered
    
    // Validate URL format
    if (url) {
      try {
        new URL(url);
        setProfilePicturePreview(url);
        setMessage({ type: '', text: '' });
      } catch (error) {
        // Invalid URL, but don't show error until they try to save
        setProfilePicturePreview('');
      }
    } else {
      setProfilePicturePreview('');
    }
  };

  const handleUseUrl = async () => {
    if (!profilePictureUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid image URL.' });
      return;
    }

    try {
      // Validate URL format
      new URL(profilePictureUrl);
      
      // Validate it's an image URL (basic check)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const isImageUrl = imageExtensions.some(ext => 
        profilePictureUrl.toLowerCase().includes(ext)
      ) || profilePictureUrl.includes('image') || profilePictureUrl.includes('img');
      
      if (!isImageUrl) {
        setMessage({ type: 'error', text: 'Please enter a valid image URL.' });
        return;
      }

      setLoading(true);
      setMessage({ type: '', text: '' });

      // Update profile with URL
      const response = await API.put('/profile', {
        ...formData,
        profilePicture: profilePictureUrl
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setProfilePicturePreview(profilePictureUrl);
        setFormData(prev => ({
          ...prev,
          profilePicture: profilePictureUrl
        }));
        if (onUpdate) {
          onUpdate(response.data.user);
        }
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setMessage({ type: 'error', text: 'Please enter a valid URL.' });
      } else {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to update profile picture. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePictureFile) return;
    
    setUploadingPicture(true);
    setMessage({ type: '', text: '' });
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePictureFile);
      
      const response = await API.post('/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' });
        setProfilePictureFile(null);
        if (onUpdate) {
          onUpdate(response.data.user);
        }
        // Update formData with new profile picture path
        setFormData(prev => ({
          ...prev,
          profilePicture: response.data.user.profilePicture
        }));
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload profile picture. Please try again.' 
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // If URL is provided and input type is URL, include it in the update
      const submitData = { ...formData };
      if (pictureInputType === 'url' && profilePictureUrl.trim()) {
        submitData.profilePicture = profilePictureUrl;
      }
      
      const response = await API.put('/profile', submitData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (onUpdate) {
          onUpdate(response.data.user);
        }
        // Update localStorage
        if (response.data.user.fullName) {
          localStorage.setItem('name', response.data.user.fullName);
        }
        // Update preview if URL was used
        if (pictureInputType === 'url' && profilePictureUrl.trim()) {
          setProfilePicturePreview(profilePictureUrl);
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>

      {message.text && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed'
              }}
            />
            <small style={{ color: '#666' }}>Email cannot be changed</small>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            placeholder="Tell us about yourself..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              marginBottom: '0.5rem'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Zip Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
            Interests
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              placeholder="Add an interest"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={handleAddInterest}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Add
            </button>
          </div>
          {formData.interests.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.interests.map((interest, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1976d2',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: 0,
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
            Profile Picture
          </label>
          
          {/* Toggle between File and URL */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setPictureInputType('file');
                setProfilePictureUrl('');
                setProfilePictureFile(null);
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: pictureInputType === 'file' ? '#667eea' : '#f5f5f5',
                color: pictureInputType === 'file' ? 'white' : '#333',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setPictureInputType('url');
                setProfilePictureFile(null);
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: pictureInputType === 'url' ? '#667eea' : '#f5f5f5',
                color: pictureInputType === 'url' ? 'white' : '#333',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Use URL
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              {pictureInputType === 'file' ? (
                <>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleProfilePictureChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      marginBottom: '0.5rem'
                    }}
                  />
                  {profilePictureFile && (
                    <button
                      type="button"
                      onClick={handleUploadProfilePicture}
                      disabled={uploadingPicture}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: uploadingPicture ? '#ccc' : '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        cursor: uploadingPicture ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
                    </button>
                  )}
                  <small style={{ display: 'block', color: '#666', marginTop: '0.5rem' }}>
                    Select an image file (JPEG, PNG, GIF, or WebP). Max size: 5MB
                  </small>
                </>
              ) : (
                <>
                  <input
                    type="url"
                    value={profilePictureUrl}
                    onChange={handleProfilePictureUrlChange}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleUseUrl}
                    disabled={loading || !profilePictureUrl.trim()}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: (loading || !profilePictureUrl.trim()) ? '#ccc' : '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      cursor: (loading || !profilePictureUrl.trim()) ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {loading ? 'Saving...' : 'Use URL'}
                  </button>
                  <small style={{ display: 'block', color: '#666', marginTop: '0.5rem' }}>
                    Paste a direct link to an image (must be a valid image URL)
                  </small>
                </>
              )}
            </div>
            {(profilePicturePreview || formData.profilePicture) && (
              <div>
                <img
                  src={profilePicturePreview || (formData.profilePicture?.startsWith('http') 
                    ? formData.profilePicture 
                    : `http://localhost:5000${formData.profilePicture}`)}
                  alt="Profile preview"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '2px solid #ccc'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: loading ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;

