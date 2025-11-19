import React, { useState } from 'react';
import API from '../../api';
import { 
  HeaderActions, 
  PageTitle, 
  SectionCard, 
  SectionTitle, 
  Button, 
  EmptyState,
  FormGroup,
  FormLabel,
  ErrorText
} from './AdminSharedStyles';

const AdminStudents = ({ students, loadingStudents, onRefresh, onRefreshDashboardStats }) => {
  const [showEditStudentForm, setShowEditStudentForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset to page 1 when students data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [students.length]);
  
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setEditFormData({
      fullName: student.fullName || '',
      email: student.email || '',
      phone: student.phone || '',
      password: ''
    });
    setEditFormErrors({});
    setShowEditStudentForm(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) errors.email = 'Please enter a valid email address';
    }
    if (editFormData.password && editFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const updateData = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone || ''
      };
      if (editFormData.password.trim()) {
        updateData.password = editFormData.password;
      }
      await API.put(`/admin/students/${editingStudent.id || editingStudent._id}`, updateData);
      alert('Student updated successfully!');
      setEditFormData({ fullName: '', email: '', phone: '', password: '' });
      setEditFormErrors({});
      setShowEditStudentForm(false);
      setEditingStudent(null);
      onRefresh();
      onRefreshDashboardStats();
    } catch (err) {
      console.error('Error updating student:', err);
      alert(err.response?.data?.message || 'Failed to update student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEditStudent = () => {
    setShowEditStudentForm(false);
    setEditingStudent(null);
    setEditFormData({ fullName: '', email: '', phone: '', password: '' });
    setEditFormErrors({});
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete "${studentName}"? This action cannot be undone and will remove them from all enrolled courses.`)) {
      return;
    }
    try {
      await API.delete(`/admin/students/${studentId}`);
      alert('Student deleted successfully!');
      onRefresh();
      onRefreshDashboardStats();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(error.response?.data?.message || 'Failed to delete student. Please try again.');
    }
  };

  return (
    <div>
      <HeaderActions>
        <PageTitle style={{ marginBottom: 0 }}>Students Management</PageTitle>
        <Button variant="primary" size="small" onClick={onRefresh}>
          Refresh
        </Button>
      </HeaderActions>

      <SectionCard>
        <SectionTitle>
          All Students ({students.length})
        </SectionTitle>
        {loadingStudents ? (
          <EmptyState>Loading students...</EmptyState>
        ) : students.length === 0 ? (
          <EmptyState>No students found.</EmptyState>
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Courses</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((student) => (
                  <tr 
                    key={student._id || student.id} 
                    style={{ 
                      borderBottom: '1px solid #eee',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{student.fullName}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{student.email}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{student.phone || 'N/A'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                      <span style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'inline-block'
                      }}>
                        {student.enrolledCoursesCount || 0}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#666' }}>
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Button variant="primary" size="small" onClick={() => handleEditStudent(student)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="small" onClick={() => handleDeleteStudent(student.id || student._id, student.fullName)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {students.length > itemsPerPage && (
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} students
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
                Page {currentPage} of {Math.ceil(students.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(students.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(students.length / itemsPerPage)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === Math.ceil(students.length / itemsPerPage) ? '#e0e0e0' : '#667eea',
                  color: currentPage === Math.ceil(students.length / itemsPerPage) ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === Math.ceil(students.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== Math.ceil(students.length / itemsPerPage)) {
                    e.target.style.backgroundColor = '#5a6fd8';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== Math.ceil(students.length / itemsPerPage)) {
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

      {/* Edit Student Form Modal */}
      {showEditStudentForm && editingStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ color: '#1976d2', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              Edit Student
            </h3>

            <form onSubmit={handleUpdateStudent}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={editFormData.fullName}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${editFormErrors.fullName ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter student's full name"
                />
                {editFormErrors.fullName && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editFormErrors.fullName}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${editFormErrors.email ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter student's email"
                />
                {editFormErrors.email && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editFormErrors.email}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${editFormErrors.password ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter new password (optional)"
                />
                {editFormErrors.password && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editFormErrors.password}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancelEditStudent}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    border: '1px solid #ccc',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;

