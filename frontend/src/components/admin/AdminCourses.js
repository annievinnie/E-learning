import React, { useState } from 'react';
import { HeaderActions, PageTitle, SectionCard, SectionTitle, Button, EmptyState } from './AdminSharedStyles';

const AdminCourses = ({ 
  courses, 
  loadingCourses, 
  selectedTeacher, 
  onTeacherSelect, 
  onRefresh,
  onDeleteCourse 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeacher]);
  
  // Get unique teachers from courses
  const uniqueTeachers = [...new Map(
    courses
      .filter(c => c.teacher && c.teacher._id)
      .map(c => [c.teacher._id, c.teacher])
  ).values()];

  // Filter courses by selected teacher
  const filteredCourses = selectedTeacher 
    ? courses.filter(c => c.teacher?._id === selectedTeacher || c.teacher?.id === selectedTeacher)
    : courses;

  return (
    <div>
      <HeaderActions>
        <PageTitle style={{ marginBottom: 0 }}>Courses Management</PageTitle>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedTeacher && (
            <Button 
              variant="secondary" 
              size="small" 
              onClick={() => onTeacherSelect(null)}
            >
              Show All Courses
            </Button>
          )}
          <Button variant="primary" size="small" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </HeaderActions>

      {/* Teacher Filter Section */}
      {courses.length > 0 && (
        <SectionCard style={{ marginBottom: '1.5rem' }}>
          <SectionTitle style={{ marginBottom: '1rem' }}>Filter by Teacher</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {uniqueTeachers.map((teacher) => {
              const teacherCourses = courses.filter(c => 
                c.teacher?._id === teacher._id || c.teacher?.id === teacher._id
              );
              const isSelected = selectedTeacher === (teacher._id || teacher.id);
              
              return (
                <button
                  key={teacher._id || teacher.id}
                  onClick={() => onTeacherSelect(teacher._id || teacher.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#667eea' : '#e0e0e0'}`,
                    background: isSelected 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'white',
                    color: isSelected ? 'white' : '#333',
                    cursor: 'pointer',
                    fontWeight: isSelected ? '600' : '500',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  {teacher.fullName || 'Unknown'} ({teacherCourses.length})
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle>
          {selectedTeacher 
            ? `${uniqueTeachers.find(t => (t._id || t.id) === selectedTeacher)?.fullName || 'Teacher'}'s Courses (${filteredCourses.length})`
            : `All Courses (${courses.length})`
          }
        </SectionTitle>
        {loadingCourses ? (
          <EmptyState>Loading courses...</EmptyState>
        ) : filteredCourses.length === 0 ? (
          <EmptyState>
            {selectedTeacher ? 'No courses found for this teacher.' : 'No courses found.'}
          </EmptyState>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '1rem'
            }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderBottom: '2px solid #667eea',
                  color: 'white'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Title</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Teacher</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Level</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Students</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((course) => (
                  <tr 
                    key={course._id || course.id} 
                    style={{ 
                      borderBottom: '1px solid #eee',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{course.title}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>
                      <span
                        onClick={() => onTeacherSelect(course.teacher?._id || course.teacher?.id)}
                        style={{
                          color: '#667eea',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#5a6fd8'}
                        onMouseLeave={(e) => e.target.style.color = '#667eea'}
                      >
                        {course.teacher?.fullName || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#666' }}>{course.category || 'Other'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: course.level === 'beginner' 
                          ? 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)'
                          : course.level === 'intermediate'
                          ? 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'inline-block',
                        textTransform: 'capitalize'
                      }}>
                        {course.level || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                      {course.students?.length || 0}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: course.status === 'active' 
                          ? 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)'
                          : course.status === 'inactive'
                          ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                          : '#ccc',
                        color: 'white',
                        display: 'inline-block',
                        textTransform: 'capitalize'
                      }}>
                        {course.status || 'draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#666' }}>
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Button 
                        variant="danger" 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCourse(course._id || course.id, course.title);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {filteredCourses.length > itemsPerPage && (
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
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
                Page {currentPage} of {Math.ceil(filteredCourses.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCourses.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredCourses.length / itemsPerPage)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === Math.ceil(filteredCourses.length / itemsPerPage) ? '#e0e0e0' : '#667eea',
                  color: currentPage === Math.ceil(filteredCourses.length / itemsPerPage) ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === Math.ceil(filteredCourses.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== Math.ceil(filteredCourses.length / itemsPerPage)) {
                    e.target.style.backgroundColor = '#5a6fd8';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== Math.ceil(filteredCourses.length / itemsPerPage)) {
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
      </SectionCard>
    </div>
  );
};

export default AdminCourses;

