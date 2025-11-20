import React from 'react';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #667eea;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #f5f5f5;
    color: #333;
    
    &:hover {
      background: #e0e0e0;
    }
  `}
  
  ${props => props.size === 'small' && `
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;
  font-style: italic;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: ${props => props.bgColor || '#f5f5f5'};
  border-radius: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || '#333'};
`;

const CourseCard = styled.div`
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
  margin-bottom: 1.5rem;
`;

const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const CourseTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const CoursePrice = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const RevenueSection = styled.div`
  text-align: right;
`;

const RevenueLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const RevenueValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #667eea;
`;

const StudentsSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const StudentsTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
`;

const StudentCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  margin-bottom: 0.5rem;
`;

const StudentInfo = styled.div``;

const StudentName = styled.div`
  font-weight: 500;
  color: #333;
`;

const StudentEmail = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const PaymentInfo = styled.div`
  text-align: right;
`;

const PaymentAmount = styled.div`
  font-weight: 600;
  color: #667eea;
`;

const PaymentDate = styled.div`
  font-size: 0.75rem;
  color: #999;
`;

const TeacherPayments = ({ teacherData, loadingPayments, onRefresh }) => {
  if (loadingPayments) {
    return (
      <Container>
        <HeaderActions>
          <PageTitle>My Payments & Revenue</PageTitle>
          <Button variant="primary" size="small" onClick={onRefresh}>
            Refresh
          </Button>
        </HeaderActions>
        <SectionCard>
          <EmptyState>Loading revenue data...</EmptyState>
        </SectionCard>
      </Container>
    );
  }

  if (!teacherData) {
    return (
      <Container>
        <HeaderActions>
          <PageTitle>My Payments & Revenue</PageTitle>
          <Button variant="primary" size="small" onClick={onRefresh}>
            Refresh
          </Button>
        </HeaderActions>
        <SectionCard>
          <EmptyState>No revenue data found.</EmptyState>
        </SectionCard>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderActions>
        <PageTitle style={{ marginBottom: 0 }}>My Payments & Revenue</PageTitle>
        <Button variant="primary" size="small" onClick={onRefresh}>
          Refresh
        </Button>
      </HeaderActions>

      <SectionCard style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {teacherData.profilePicture && (
            <img
              src={teacherData.profilePicture.startsWith('http') 
                ? teacherData.profilePicture 
                : `http://localhost:5001${teacherData.profilePicture}`}
              alt={teacherData.teacherName}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          )}
          <div>
            <SectionTitle style={{ marginBottom: '0.25rem' }}>{teacherData.teacherName}</SectionTitle>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>{teacherData.teacherEmail}</div>
          </div>
        </div>
        <StatsGrid>
          <StatCard bgColor="#f0f4ff">
            <StatLabel>Total Revenue</StatLabel>
            <StatValue color="#667eea">
              ${(teacherData.totalRevenue || 0).toFixed(2)}
            </StatValue>
          </StatCard>
          <StatCard bgColor="#e3f2fd">
            <StatLabel>Total Students</StatLabel>
            <StatValue color="#1976d2">
              {teacherData.totalStudents || 0}
            </StatValue>
          </StatCard>
          <StatCard bgColor="#f3e5f5">
            <StatLabel>Total Courses</StatLabel>
            <StatValue color="#7b1fa2">
              {teacherData.courseCount || 0}
            </StatValue>
          </StatCard>
        </StatsGrid>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Course Details</SectionTitle>
        {teacherData.courses && teacherData.courses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {teacherData.courses.map((course) => (
              <CourseCard key={course.courseId}>
                <CourseHeader>
                  <div>
                    <CourseTitle>{course.courseTitle}</CourseTitle>
                    <CoursePrice>Course Price: ${(course.coursePrice || 0).toFixed(2)}</CoursePrice>
                  </div>
                  <RevenueSection>
                    <RevenueLabel>Revenue</RevenueLabel>
                    <RevenueValue>${(course.revenue || 0).toFixed(2)}</RevenueValue>
                  </RevenueSection>
                </CourseHeader>
                <StudentsSection>
                  <StudentsTitle>
                    Students ({course.studentCount || 0}):
                  </StudentsTitle>
                  {course.students && course.students.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {course.students.map((student, idx) => (
                        <StudentCard key={student.id || idx}>
                          <StudentInfo>
                            <StudentName>{student.name}</StudentName>
                            <StudentEmail>{student.email}</StudentEmail>
                          </StudentInfo>
                          <PaymentInfo>
                            {student.amount > 0 ? (
                              <>
                                <PaymentAmount>${(student.amount || 0).toFixed(2)}</PaymentAmount>
                                {student.paidAt && (
                                  <PaymentDate>
                                    {new Date(student.paidAt).toLocaleDateString()}
                                  </PaymentDate>
                                )}
                              </>
                            ) : (
                              <div style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
                                Free/No payment
                              </div>
                            )}
                          </PaymentInfo>
                        </StudentCard>
                      ))}
                    </div>
                  ) : course.studentCount > 0 ? (
                    <div style={{ color: '#999', fontStyle: 'italic' }}>
                      {course.studentCount} student(s) enrolled, but details are not available.
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontStyle: 'italic' }}>No students enrolled yet.</div>
                  )}
                </StudentsSection>
              </CourseCard>
            ))}
          </div>
        ) : (
          <EmptyState>No courses with revenue found.</EmptyState>
        )}
      </SectionCard>
    </Container>
  );
};

export default TeacherPayments;

