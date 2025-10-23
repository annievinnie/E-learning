import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const TeacherDashboard = () => {
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
          <h1 style={{ color: '#ff9800', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Teacher Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Welcome back, {user?.fullName}! Manage your courses and students.
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
            <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>My Students</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>156</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>My Courses</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>8</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>Assignments</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>23</div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>Quick Actions</h3>
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
                Create Course
              </button>
              <button style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Add Assignment
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
                Grade Students
              </button>
              <button style={{
                backgroundColor: '#ff5722',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                View Reports
              </button>
            </div>
          </div>

          {/* My Courses */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>My Courses</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4>React Fundamentals</h4>
                <p>Students: 45</p>
                <p>Status: Active</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4>JavaScript Advanced</h4>
                <p>Students: 32</p>
                <p>Status: Active</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4>Node.js Backend</h4>
                <p>Students: 28</p>
                <p>Status: Active</p>
              </div>
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
            <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                New assignment posted: "React Hooks Exercise"
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                Graded 15 submissions for "JavaScript Quiz"
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                Student John Doe submitted assignment
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
