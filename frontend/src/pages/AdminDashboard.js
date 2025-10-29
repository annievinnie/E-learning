import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '20px' }}>
      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#1976d2', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Welcome back, {user?.fullName}! Manage your e-learning platform.
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

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <button style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Manage Students
              </button>
              <button style={{
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Manage Teachers
              </button>
              <button style={{
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Manage Courses
              </button>
              <button style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                System Settings
              </button>
            </div>
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
              </div>
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
    </div>
  );
};

export default AdminDashboard;
