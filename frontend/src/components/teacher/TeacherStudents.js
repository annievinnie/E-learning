import React, { useState, useEffect } from 'react';
import API from '../../api';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 200px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
`;

const CourseSection = styled.div`
  margin-bottom: 2rem;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const CourseHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CourseTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
`;

const StudentCount = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const StudentsList = styled.div`
  padding: 1.5rem;
`;

const StudentCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9f9f9;
  }
`;

const StudentAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  overflow: hidden;
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background-color: #ffffff;
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.25rem;
`;

const StudentEmail = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const EnrolledDate = styled.div`
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const TeacherStudents = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentsData, setStudentsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);
  
  // Reset to page 1 when students data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [studentsData]);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/courses/students/enrolled');
      
      if (response.data.success) {
        setStudentsData(response.data);
      } else {
        setError(response.data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setError(err.response?.data?.message || 'Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>My Students</Title>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!studentsData || !studentsData.courses || studentsData.courses.length === 0) {
    return (
      <Container>
        <Header>
          <Title>My Students</Title>
        </Header>
        <EmptyState>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No enrolled students yet</p>
          <p style={{ color: '#999' }}>Students who enroll in your courses will appear here.</p>
        </EmptyState>
      </Container>
    );
  }

  // Flatten all students from all courses for pagination
  const allStudents = [];
  studentsData.courses.forEach((course) => {
    if (course.students && course.students.length > 0) {
      course.students.forEach((student) => {
        allStudents.push({ ...student, courseTitle: course.courseTitle, courseId: course.courseId });
      });
    }
  });

  const totalStudents = allStudents.length;
  const paginatedStudents = allStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(totalStudents / itemsPerPage);

  return (
    <Container>
      <Header>
        <Title>My Students</Title>
      </Header>

      {/* <StatsContainer>
        <StatCard>
          <StatLabel>Total Courses</StatLabel>
          <StatValue>{studentsData.totalCourses || 0}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Students</StatLabel>
          <StatValue>{studentsData.totalUniqueStudents || 0}</StatValue>
        </StatCard>
      </StatsContainer> */}

      {/* Students Table */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1rem' }}>
          My Students ({studentsData.totalUniqueStudents || 0})
        </h3>
        
        {studentsData.courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No students enrolled in your courses yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>Student</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>Course</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, index) => (
                    <tr key={`${student.courseId}-${student.studentId}-${index}`} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: student.profilePicture ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            {student.profilePicture ? (
                              <img
                                src={student.profilePicture.startsWith('http') 
                                  ? student.profilePicture 
                                  : `${process.env.REACT_APP_API_URL}${student.profilePicture.startsWith('/') ? '' : '/'}${student.profilePicture}`}
                                alt={student.studentName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '50%'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.textContent = getInitials(student.studentName);
                                }}
                              />
                            ) : (
                              getInitials(student.studentName)
                            )}
                          </div>
                          <div style={{ fontWeight: '500' }}>{student.studentName}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>
                        {student.email}
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>
                        {student.courseTitle}
                      </td>
                      <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                        {student.enrolledDateFormatted || 'N/A'}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalStudents > itemsPerPage && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalStudents)} of {totalStudents} students
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === 1 ? '#e0e0e0' : '#667eea',
                  color: currentPage === 1 ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = '#5a6fd8';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = '#667eea';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                Previous
              </button>
              <span style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: 'white', 
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#667eea',
                border: '1px solid #667eea'
              }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#667eea',
                  color: currentPage === totalPages ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.backgroundColor = '#5a6fd8';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.backgroundColor = '#667eea';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default TeacherStudents;
