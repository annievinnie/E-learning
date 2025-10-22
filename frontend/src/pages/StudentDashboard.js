import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const StudentDashboard = () => {
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
          <h1 style={{ color: '#4caf50', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Student Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Welcome back, {user?.fullName}! Continue your learning journey.
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
            <h3 style={{ color: '#4caf50', marginBottom: '1rem' }}>Enrolled Courses</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3' }}>5</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#4caf50', marginBottom: '1rem' }}>Assignments</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>12</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#4caf50', marginBottom: '1rem' }}>Average Grade</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>85%</div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ color: '#4caf50', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <button style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                View Courses
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
                Submit Assignment
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
                View Grades
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
                Download Materials
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
            <h3 style={{ color: '#4caf50', marginBottom: '1rem' }}>My Courses</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4>React Fundamentals</h4>
                <p>Teacher: Prof. Smith</p>
                <p>Progress: 75%</p>
                <p>Next Class: Tomorrow 10:00 AM</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4>JavaScript Advanced</h4>
                <p>Teacher: Dr. Johnson</p>
                <p>Progress: 60%</p>
                <p>Next Class: Friday 2:00 PM</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4>Node.js Backend</h4>
                <p>Teacher: Ms. Davis</p>
                <p>Progress: 40%</p>
                <p>Next Class: Monday 9:00 AM</p>
              </div>
            </div>
          </div>

          {/* Recent Assignments */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ color: '#4caf50', marginBottom: '1rem' }}>Recent Assignments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>React Hooks Exercise</span>
                <span style={{ color: '#ff9800' }}>Due: Dec 25</span>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>JavaScript Quiz</span>
                <span style={{ color: '#4caf50' }}>Submitted</span>
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Node.js Project</span>
                <span style={{ color: '#f44336' }}>Overdue</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
