import React, { useState, useEffect } from 'react';
import API from '../../api';

const AdminProfile = ({ user, onUpdate }) => {
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
    department: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
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
        department: user.department || ''
      });
      
      // Set profile picture preview
      if (user.profilePicture) {
        if (user.profilePicture.startsWith('http')) {
          setProfilePicturePreview(user.profilePicture);
        } else {
          // Local file path - construct full URL
          setProfilePicturePreview(`http://localhost:5000${user.profilePicture}`);
        }
      } else {
        setProfilePicturePreview('');
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ 
          type: 'error', 
          text: 'Invalid file type. Please select an image file (JPEG, PNG, GIF, or WebP).' 
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ 
          type: 'error', 
          text: 'File size too large. Please select an image smaller than 5MB.' 
        });
        return;
      }

      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePictureFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

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
        
        // Update the form data with the new profile picture path
        if (response.data.profilePicture) {
          setFormData(prev => ({
            ...prev,
            profilePicture: response.data.profilePicture
          }));
          setProfilePicturePreview(`http://localhost:5000${response.data.profilePicture}`);
        }
        
        // Update user in parent component
        if (onUpdate && response.data.user) {
          onUpdate(response.data.user);
        }
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
      const response = await API.put('/profile', formData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (onUpdate) {
          onUpdate(response.data.user);
        }
        // Update localStorage
        if (response.data.user.fullName) {
          localStorage.setItem('name', response.data.user.fullName);
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
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Academic Affairs, Student Services, IT"
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
            Profile Picture
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
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
                    fontWeight: '500'
                  }}
                >
                  {uploadingPicture ? 'Uploading...' : 'Upload Picture'}
                </button>
              )}
              <small style={{ display: 'block', color: '#666', marginTop: '0.5rem' }}>
                Select an image file (JPEG, PNG, GIF, or WebP). Max size: 5MB
              </small>
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

export default AdminProfile;

