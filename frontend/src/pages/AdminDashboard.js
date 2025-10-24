import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [showEditTeacherForm, setShowEditTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user profile
    API.get('/profile')
      .then(response => {
        setUser(response.data.user);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    // Dispatch custom event to notify navbar of auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    navigate('/');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Reset form when switching sections
    if (section !== 'teachers') {
      setShowAddTeacherForm(false);
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setFormErrors({});
    } else {
      // Fetch teachers when switching to teachers section
      fetchTeachers();
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await API.get('/teachers');
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Failed to fetch teachers. Please try again.');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setTeacherFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateTeacherForm = () => {
    const errors = {};
    
    if (!teacherFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!teacherFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(teacherFormData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (!teacherFormData.password.trim()) {
      errors.password = 'Password is required';
    } else if (teacherFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    const errors = validateTeacherForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await API.post('/teachers', teacherFormData);
      console.log('Teacher created:', response.data);
      alert('Teacher added successfully!');
      
      // Reset form
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setFormErrors({});
      setShowAddTeacherForm(false);
      
      // Refresh teachers list
      fetchTeachers();
      
    } catch (err) {
      console.error('Error adding teacher:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add teacher. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAddTeacher = () => {
    setShowAddTeacherForm(false);
    setTeacherFormData({ fullName: '', email: '', password: '' });
    setFormErrors({});
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await API.delete(`/teachers/${teacherId}`);
        alert('Teacher deleted successfully!');
        // Refresh teachers list
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete teacher. Please try again.';
        alert(errorMessage);
      }
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      fullName: teacher.fullName,
      email: teacher.email,
      password: ''
    });
    setEditFormErrors({});
    setShowEditTeacherForm(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (!editFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Password is optional for edit, but if provided, must be at least 6 characters
    if (editFormData.password && editFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const response = await API.put(`/teachers/${editingTeacher.id}`, editFormData);
      console.log('Teacher updated:', response.data);
      alert('Teacher updated successfully!');
      
      // Reset form and close modal
      setEditFormData({ fullName: '', email: '', password: '' });
      setEditFormErrors({});
      setShowEditTeacherForm(false);
      setEditingTeacher(null);
      
      // Refresh teachers list
      fetchTeachers();
      
    } catch (err) {
      console.error('Error updating teacher:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update teacher. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEditTeacher = () => {
    setShowEditTeacherForm(false);
    setEditFormData({ fullName: '', email: '', password: '' });
    setEditFormErrors({});
    setEditingTeacher(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Content components for different sections
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
  return (
          <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                Dashboard Overview
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
                Welcome back, {user?.fullName}! Here's what's happening on your platform.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Stats Cards */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>Total Students</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>1,234</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>Total Teachers</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>56</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>Active Courses</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>89</div>
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                New student registered: John Doe
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                Course "React Basics" created by Teacher Smith
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                System backup completed successfully
              </div>
            </div>
          </div>
        </div>
          </div>
        );
      
      case 'students':
        return (
          <div>
            <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '1rem' }}>Students Management</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>Student management features will be implemented here.</p>
            </div>
          </div>
        );
      
      case 'teachers':
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem' 
            }}>
              <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '0' }}>
                Teachers Management
              </h1>
              <button
                onClick={() => setShowAddTeacherForm(true)}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#45a049';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4caf50';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                + Add Teacher
              </button>
            </div>

            {/* Add Teacher Form */}
            {showAddTeacherForm && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ color: '#1976d2', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                  Add New Teacher
                </h3>
                
                <form onSubmit={handleAddTeacher}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={teacherFormData.fullName}
                      onChange={handleTeacherFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.fullName ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter teacher's full name"
                    />
                    {formErrors.fullName && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {formErrors.fullName}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={teacherFormData.email}
                      onChange={handleTeacherFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.email ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter teacher's email"
                    />
                    {formErrors.email && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={teacherFormData.password}
                      onChange={handleTeacherFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.password ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter password (min 6 characters)"
                    />
                    {formErrors.password && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {formErrors.password}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        opacity: isSubmitting ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Teacher'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancelAddTeacher}
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        border: '1px solid #ccc',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Teacher Form Modal */}
            {showEditTeacherForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  width: '90%',
                  maxWidth: '500px',
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}>
                  <h3 style={{ color: '#1976d2', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                    Edit Teacher
                  </h3>
                  
                  <form onSubmit={handleUpdateTeacher}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={editFormData.fullName}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${editFormErrors.fullName ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter teacher's full name"
                      />
                      {editFormErrors.fullName && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {editFormErrors.fullName}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${editFormErrors.email ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter teacher's email"
                      />
                      {editFormErrors.email && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {editFormErrors.email}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        New Password (optional)
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${editFormErrors.password ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter new password (leave blank to keep current)"
                      />
                      {editFormErrors.password && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {editFormErrors.password}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        style={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isUpdating ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          opacity: isUpdating ? 0.7 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isUpdating ? 'Updating...' : 'Update Teacher'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancelEditTeacher}
                        disabled={isUpdating}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          border: '1px solid #ccc',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isUpdating ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Teachers List */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>
                Current Teachers ({teachers.length})
              </h3>
              
              {loadingTeachers ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div>Loading teachers...</div>
                </div>
              ) : teachers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No teachers found. Add your first teacher using the button above.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Name
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Email
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Joined
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500' }}>{teacher.fullName}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: '#666' }}>{teacher.email}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                              {new Date(teacher.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditTeacher(teacher)}
                                style={{
                                  backgroundColor: '#2196f3',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#1976d2';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#2196f3';
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                style={{
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#d32f2f';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#f44336';
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'courses':
        return (
          <div>
            <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '1rem' }}>Courses Management</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>Course management features will be implemented here.</p>
            </div>
          </div>
        );
      
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div style={{ 
        marginLeft: '250px', 
        flex: 1, 
        padding: '2rem',
        overflow: 'auto'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;