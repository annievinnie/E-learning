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
  const [teacherFormData, setTeacherFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
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
  }, [navigate]);

  const fetchPendingApplications = async () => {
    try {
      const response = await API.get('/admin/pending-teachers');
      setPendingApplications(response.data.applications);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
    }
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      await API.post(`/admin/approve-teacher/${applicationId}`);
      alert('Teacher application approved successfully! Teacher can now login.');
      fetchPendingApplications(); // Refresh the list
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
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setFormErrors({});
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
      // For now, just simulate a successful submission
      // In the future, this would make an API call to create a teacher
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Teacher created:', teacherFormData);
      alert('Teacher added successfully!');
      
      // Reset form
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setFormErrors({});
      setShowAddTeacherForm(false);
      
    } catch (err) {
      console.error('Error adding teacher:', err);
      alert('Failed to add teacher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAddTeacher = () => {
    setShowAddTeacherForm(false);
    setTeacherFormData({ fullName: '', email: '', password: '' });
    setFormErrors({});
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
              {/* <div style={{
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
              </div> */}
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

          {/* Pending Teacher Applications */}
          {pendingApplications.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>
                Pending Teacher Applications ({pendingApplications.length})
              </h3>
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
                          Applied: {new Date(application.createdAt).toLocaleDateString()}
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
            </div>
          )}

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

            {/* Teachers List */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>
                Current Teachers
              </h3>
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Teacher list will be displayed here. Currently showing placeholder content.
              </p>
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
        </div>
      </main>

      {/* Rejection Modal */}
      {showApprovalModal && (
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
      </div>
    </div>
  );
};

export default AdminDashboard;
