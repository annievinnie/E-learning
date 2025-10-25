import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
};

export default AdminDashboard;
