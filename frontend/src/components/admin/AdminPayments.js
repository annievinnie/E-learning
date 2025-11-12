import React from 'react';
import { HeaderActions, PageTitle, SectionCard, SectionTitle, Button, EmptyState } from './AdminSharedStyles';

const AdminPayments = ({
  teacherRevenue,
  loadingPayments,
  selectedTeacherForRevenue,
  onTeacherSelect,
  onShowAllTeachers,
  onRefresh
}) => {
  const selectedTeacherData = selectedTeacherForRevenue 
    ? teacherRevenue.find(t => (t.teacherId || t._id) === selectedTeacherForRevenue)
    : null;

  return (
    <div>
      <HeaderActions>
        <PageTitle style={{ marginBottom: 0 }}>Payments & Revenue</PageTitle>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedTeacherForRevenue && (
            <Button variant="secondary" size="small" onClick={onShowAllTeachers}>
              Show All Teachers
            </Button>
          )}
          <Button variant="primary" size="small" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </HeaderActions>

      {!selectedTeacherForRevenue ? (
        <SectionCard>
          <SectionTitle>Teacher Revenue Overview</SectionTitle>
          {loadingPayments ? (
            <EmptyState>Loading revenue data...</EmptyState>
          ) : teacherRevenue.length === 0 ? (
            <EmptyState>No revenue data found.</EmptyState>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Teacher</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Total Courses</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Total Students</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Total Revenue</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherRevenue.map((teacher) => (
                    <tr 
                      key={teacher.teacherId || teacher._id}
                      style={{ 
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {teacher.profilePicture && (
                            <img
                              src={teacher.profilePicture.startsWith('http') 
                                ? teacher.profilePicture 
                                : `http://localhost:5000${teacher.profilePicture}`}
                              alt={teacher.teacherName}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: '600', color: '#333' }}>{teacher.teacherName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{teacher.teacherEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                        {teacher.courseCount || 0}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                        {teacher.totalStudents || 0}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#2e7d32' }}>
                        ${(teacher.totalRevenue || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Button 
                          variant="primary" 
                          size="small" 
                          onClick={() => onTeacherSelect(teacher.teacherId || teacher._id)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      ) : selectedTeacherData ? (
        <div>
          <SectionCard style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {selectedTeacherData.profilePicture && (
                <img
                  src={selectedTeacherData.profilePicture.startsWith('http') 
                    ? selectedTeacherData.profilePicture 
                    : `http://localhost:5000${selectedTeacherData.profilePicture}`}
                  alt={selectedTeacherData.teacherName}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div>
                <SectionTitle style={{ marginBottom: '0.25rem' }}>{selectedTeacherData.teacherName}</SectionTitle>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>{selectedTeacherData.teacherEmail}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2e7d32' }}>
                  ${(selectedTeacherData.totalRevenue || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Students</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1976d2' }}>
                  {selectedTeacherData.totalStudents || 0}
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Courses</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#7b1fa2' }}>
                  {selectedTeacherData.courseCount || 0}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Course Details</SectionTitle>
            {selectedTeacherData.courses && selectedTeacherData.courses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedTeacherData.courses.map((course) => (
                  <div 
                    key={course.courseId}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      background: '#fafafa'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                          {course.courseTitle}
                        </h4>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          Course Price: ${(course.coursePrice || 0).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Revenue</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2e7d32' }}>
                          ${(course.revenue || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '0.75rem' }}>
                        Students ({course.studentCount || 0}):
                      </div>
                      {course.students && course.students.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {course.students.map((student, idx) => (
                            <div 
                              key={student.id || idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                background: 'white',
                                borderRadius: '6px',
                                border: '1px solid #e0e0e0'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: '500', color: '#333' }}>{student.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{student.email}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                {student.amount > 0 ? (
                                  <>
                                    <div style={{ fontWeight: '600', color: '#2e7d32' }}>
                                      ${(student.amount || 0).toFixed(2)}
                                    </div>
                                    {student.paidAt && (
                                      <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                        {new Date(student.paidAt).toLocaleDateString()}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
                                    Free/No payment
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : course.studentCount > 0 ? (
                        <div style={{ color: '#999', fontStyle: 'italic' }}>
                          {course.studentCount} student(s) enrolled, but details are not available.
                        </div>
                      ) : (
                        <div style={{ color: '#999', fontStyle: 'italic' }}>No students enrolled yet.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>No courses with revenue found for this teacher.</EmptyState>
            )}
          </SectionCard>
        </div>
      ) : (
        <EmptyState>Teacher data not found.</EmptyState>
      )}
    </div>
  );
};

export default AdminPayments;

