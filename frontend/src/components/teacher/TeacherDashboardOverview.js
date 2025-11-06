import React from 'react';
import styled from 'styled-components';

const PageTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
`;

const PageSubtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-weight: 400;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color1 || '#667eea'} 0%, ${props => props.color2 || '#764ba2'} 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  &:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); }
  &::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); transition: all 0.5s ease; }
  &:hover::before { top: -30%; right: -30%; }
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
`;

const SectionCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  &:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid;
  border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
`;

const TeacherDashboardOverview = ({ user, courses, assignments }) => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <PageTitle>Teacher Dashboard</PageTitle>
        <PageSubtitle>
          Welcome back, {user?.fullName}! Manage your courses and students.
        </PageSubtitle>
      </div>
      
      <StatsGrid>
        <StatCard color1="#56ab2f" color2="#a8e063">
          <StatTitle>My Students</StatTitle>
          <StatValue>24</StatValue>
        </StatCard>

        <StatCard color1="#f6d365" color2="#fda085">
          <StatTitle>My Courses</StatTitle>
          <StatValue>{courses.length}</StatValue>
        </StatCard>

        <StatCard color1="#667eea" color2="#764ba2">
          <StatTitle>Assignments</StatTitle>
          <StatValue>{assignments.length}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Recent Activity */}
      <SectionCard>
        <SectionTitle>Recent Activity</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            📚 <strong>New course created:</strong> "Cloud Computing Fundamentals" - 2 modules added
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            📝 <strong>Assignment posted:</strong> "React Component Project" - Due Feb 20, 2024
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            🎥 <strong>Video uploaded:</strong> "What is Cloud Computing?" - 15:30 duration
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            👥 <strong>Student enrolled:</strong> John Doe joined "React Development" course
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default TeacherDashboardOverview;

