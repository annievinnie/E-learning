import React from 'react';
import { PageTitle, PageSubtitle, StatsGrid, StatCard, StatTitle, StatValue } from './AdminSharedStyles';

const AdminDashboardOverview = ({ user, dashboardStats }) => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <PageTitle>Dashboard Overview</PageTitle>
        <PageSubtitle>
          Welcome back, {user?.fullName}! Here's what's happening on your platform.
        </PageSubtitle>
      </div>

      <StatsGrid>
        <StatCard color1="#56ab2f" color2="#a8e063">
          <StatTitle>Total Students</StatTitle>
          <StatValue>{dashboardStats.totalStudents.toLocaleString()}</StatValue>
        </StatCard>

        <StatCard color1="#f6d365" color2="#fda085">
          <StatTitle>Total Teachers</StatTitle>
          <StatValue>{dashboardStats.totalTeachers.toLocaleString()}</StatValue>
        </StatCard>

        <StatCard color1="#667eea" color2="#764ba2">
          <StatTitle>Active Courses</StatTitle>
          <StatValue>{dashboardStats.totalCourses.toLocaleString()}</StatValue>
        </StatCard>

        <StatCard color1="#f093fb" color2="#f5576c">
          <StatTitle>Pending Applications</StatTitle>
          <StatValue>{dashboardStats.pendingApplications.toLocaleString()}</StatValue>
        </StatCard>

        <StatCard color1="#2e7d32" color2="#4caf50">
          <StatTitle>Total Revenue</StatTitle>
          <StatValue>${dashboardStats.totalRevenue.toFixed(2)}</StatValue>
        </StatCard>
      </StatsGrid>
    </div>
  );
};

export default AdminDashboardOverview;

