import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showEditTeacherForm, setShowEditTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState('approved'); // 'approved', 'pending', 'rejected', 'deleted'
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    isApproved: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (response.data.user.role === 'admin') {
          fetchPendingApplications();
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchPendingApplications = async () => {
    try {
      const response = await API.get('/admin/pending-teachers');
      setPendingApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await API.get('/admin/teachers');
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Failed to fetch teachers. Please try again.');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchRejectedApplications = async () => {
    setLoadingTeachers(true);
    try {
      const response = await API.get('/admin/rejected-teachers');
      setRejectedApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching rejected applications:', error);
      alert('Failed to fetch rejected applications. Please try again.');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleFilterChange = (filter) => {
    setTeacherFilter(filter);
    if (filter === 'approved') {
      fetchTeachers();
    } else if (filter === 'pending') {
      fetchPendingApplications();
    } else if (filter === 'rejected') {
      fetchRejectedApplications();
    } else if (filter === 'deleted') {
      // Deleted teachers can't be fetched since we use hard delete
      setTeachers([]);
    }
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      await API.post(`/admin/approve-teacher/${applicationId}`);
      alert('Teacher application approved successfully! Teacher can now login.');
      // Refresh based on current filter
      if (teacherFilter === 'pending') {
        fetchPendingApplications();
      } else if (teacherFilter === 'approved') {
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  const handleRejectApplication = async (applicationId, reason) => {
    try {
      await API.post(`/admin/reject-teacher/${applicationId}`, { rejectionReason: reason });
      alert('Teacher application rejected');
      setShowApprovalModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      fetchPendingApplications(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

  const openRejectionModal = (application) => {
    setSelectedApplication(application);
    setShowApprovalModal(true);
  };

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
      setShowEditTeacherForm(false);
      setEditingTeacher(null);
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
      setFormErrors({});
      setEditFormErrors({});
      } else {
      // Fetch data based on current filter when switching to teachers section
      if (teacherFilter === 'approved') {
        fetchTeachers();
      } else if (teacherFilter === 'pending') {
        fetchPendingApplications();
      } else if (teacherFilter === 'rejected') {
        fetchRejectedApplications();
      }
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
      await API.post('/admin/teachers', teacherFormData);
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

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      fullName: teacher.fullName || '',
      email: teacher.email || '',
      password: '', // Don't pre-fill password
      isApproved: teacher.isApproved !== undefined ? teacher.isApproved : true
    });
    setEditFormErrors({});
    setShowEditTeacherForm(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    // Password is optional when editing, but if provided, must be at least 6 characters
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

    setIsSubmitting(true);

    try {
      const updateData = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        isApproved: editFormData.isApproved
      };

      // Only include password if it was provided
      if (editFormData.password.trim()) {
        updateData.password = editFormData.password;
      }

      await API.put(`/admin/teachers/${editingTeacher.id || editingTeacher._id}`, updateData);
      alert('Teacher updated successfully!');
      
      // Reset form
      setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
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
      setIsSubmitting(false);
    }
  };

  const handleCancelEditTeacher = () => {
    setShowEditTeacherForm(false);
    setEditingTeacher(null);
    setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
    setEditFormErrors({});
  };

  const handleDeleteTeacher = async (teacherId) => {
    const teacher = teachers.find(t => (t.id || t._id) === teacherId);
    const teacherName = teacher?.fullName || 'this teacher';
    
    if (!window.confirm(`Are you sure you want to delete ${teacherName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/admin/teachers/${teacherId}`);
      alert('Teacher deleted successfully!');
      fetchTeachers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting teacher:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete teacher. Please try again.';
      alert(errorMessage);
    }
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
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '500', color: '#333' }}>Filter:</label>
                  <select
                    value={teacherFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
                {teacherFilter === 'approved' && (
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
                  >
                    + Add Teacher
                  </button>
                )}
              </div>
            </div>

            {/* Filter-based content display */}
            {teacherFilter === 'pending' && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>
                  Pending Teacher Applications ({pendingApplications.length})
                </h3>
                {loadingTeachers ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Loading...</p>
                  </div>
                ) : pendingApplications.length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                    No pending applications found.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingApplications.map((application) => (
                      <div key={application._id} style={{
                        padding: '1rem',
                        backgroundColor: '#fff3e0',
                        borderRadius: '8px',
                        border: '1px solid #ff9800'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#e65100' }}>
                              {application.fullName}
                            </h4>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                              Email: {application.email}
                            </p>
                            <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                              Applied: {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleApproveApplication(application._id)}
                              style={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectionModal(application)}
                              style={{
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {teacherFilter === 'rejected' && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>
                  Rejected Teacher Applications ({rejectedApplications.length})
                </h3>
                {loadingTeachers ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Loading...</p>
                  </div>
                ) : rejectedApplications.length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                    No rejected applications found.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {rejectedApplications.map((application) => (
                      <div key={application._id} style={{
                        padding: '1rem',
                        backgroundColor: '#ffebee',
                        borderRadius: '8px',
                        border: '1px solid #f44336'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#c62828' }}>
                            {application.fullName}
                          </h4>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                            Email: {application.email}
                          </p>
                          {application.rejectionReason && (
                            <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontStyle: 'italic' }}>
                              Reason: {application.rejectionReason}
                            </p>
                          )}
                          <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                            Rejected: {application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {teacherFilter === 'deleted' && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>
                  Deleted Teachers
                </h3>
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  Deleted teachers cannot be viewed as they have been permanently removed from the system.
                </p>
              </div>
            )}

            {/* Add Teacher Form - only show for approved filter */}
            {teacherFilter === 'approved' && showAddTeacherForm && (
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

            {/* Approved Teachers List */}
            {teacherFilter === 'approved' && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#1976d2', marginBottom: '0' }}>
                    Approved Teachers ({teachers.filter(t => t.isApproved).length})
                  </h3>
                  <button
                    onClick={fetchTeachers}
                    style={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Refresh
                  </button>
                </div>

                {loadingTeachers ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Loading teachers...</p>
                  </div>
                ) : teachers.filter(t => t.isApproved).length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                    No approved teachers found. Add a teacher to get started.
                  </p>
                ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '1rem'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Name</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Email</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#333' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Joined</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#333' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.filter(t => t.isApproved).map((teacher) => (
                        <tr key={teacher.id || teacher._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.75rem' }}>{teacher.fullName}</td>
                          <td style={{ padding: '0.75rem' }}>{teacher.email}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              backgroundColor: teacher.isApproved ? '#e8f5e9' : '#fff3e0',
                              color: teacher.isApproved ? '#2e7d32' : '#e65100'
                            }}>
                              {teacher.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditTeacher(teacher)}
                                style={{
                                  backgroundColor: '#1976d2',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTeacher(teacher.id || teacher._id)}
                                style={{
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
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
            )}

            {/* Edit Teacher Form Modal */}
            {showEditTeacherForm && editingTeacher && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  maxWidth: '500px',
                  width: '90%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <h3 style={{ color: '#1976d2', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
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

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Password (leave blank to keep current)
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
                        placeholder="Enter new password (optional)"
                      />
                      {editFormErrors.password && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {editFormErrors.password}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500',
                        color: '#333',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          name="isApproved"
                          checked={editFormData.isApproved}
                          onChange={handleEditFormChange}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>Teacher is approved</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleCancelEditTeacher}
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          border: '1px solid #ccc',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Teacher'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

      case 'analytics':
        return (
          <div>
            <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '1rem' }}>Analytics</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>Analytics and reporting features will be implemented here.</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '1rem' }}>System Settings</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>System settings and configuration will be implemented here.</p>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div>
            <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '1rem' }}>Messages</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>Message center and communication features will be implemented here.</p>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div>
            <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '1rem' }}>Reports</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>Report generation and export features will be implemented here.</p>
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

        {/* Rejection Modal (rendered at top-level so it isn't nested incorrectly) */}
        {showApprovalModal && selectedApplication && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ marginTop: 0, color: '#f44336' }}>Reject Teacher Application</h3>
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to reject {selectedApplication?.fullName}'s application?
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Reason for rejection (optional):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedApplication(null);
                    setRejectionReason('');
                  }}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectApplication(selectedApplication._id, rejectionReason)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
