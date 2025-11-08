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
  color: #2e7d32;
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

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

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

      {studentsData.courses.map((course) => (
        <CourseSection key={course.courseId}>
          <CourseCard>
            <CourseHeader>
              <CourseTitle>{course.courseTitle}</CourseTitle>
              <StudentCount>{course.studentCount} {course.studentCount === 1 ? 'Student' : 'Students'}</StudentCount>
            </CourseHeader>
            {course.students && course.students.length > 0 ? (
              <StudentsList>
                {course.students.map((student) => (
                  <StudentCard key={student.studentId}>
                    <StudentAvatar $hasImage={!!student.profilePicture}>
                      {student.profilePicture ? (
                        <AvatarImage
                          src={student.profilePicture.startsWith('http') 
                            ? student.profilePicture 
                            : `http://localhost:5000${student.profilePicture.startsWith('/') ? '' : '/'}${student.profilePicture}`}
                          alt={student.studentName}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.textContent = getInitials(student.studentName);
                          }}
                        />
                      ) : (
                        getInitials(student.studentName)
                      )}
                    </StudentAvatar>
                    <StudentInfo>
                      <StudentName>{student.studentName}</StudentName>
                      <StudentEmail>{student.email}</StudentEmail>
                      <EnrolledDate>Enrolled on {student.enrolledDateFormatted}</EnrolledDate>
                    </StudentInfo>
                  </StudentCard>
                ))}
              </StudentsList>
            ) : (
              <StudentsList>
                <EmptyState style={{ padding: '2rem' }}>
                  <p>No students enrolled in this course yet.</p>
                </EmptyState>
              </StudentsList>
            )}
          </CourseCard>
        </CourseSection>
      ))}
    </Container>
  );
};

export default TeacherStudents;
