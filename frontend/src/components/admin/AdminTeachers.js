import React, { useState } from 'react';
import API from '../../api';
import { 
  HeaderActions, 
  PageTitle, 
  SectionCard, 
  SectionTitle, 
  Button, 
  EmptyState, 
  ApplicationCard,
  FormGroup,
  FormLabel,
  ErrorText,
  FilterSelect
} from './AdminSharedStyles';

const AdminTeachers = ({
  teacherFilter,
  onFilterChange,
  pendingApplications,
  rejectedApplications,
  teachers,
  loadingTeachers,
  showAddTeacherForm,
  onShowAddTeacherForm,
  onRefreshTeachers,
  onRefreshPending,
  onRefreshRejected,
  onRefreshDashboardStats
}) => {
  const [teacherFormData, setTeacherFormData] = useState({ fullName: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [approvalPassword, setApprovalPassword] = useState('');
  const [approvalPasswordConfirm, setApprovalPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showEditTeacherForm, setShowEditTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '', password: '', isApproved: true });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [teacherFilter]);

  const handleTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setTeacherFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeacherFormBlur = (e) => {
    const { name } = e.target;
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateTeacherForm = () => {
    const errors = {};
    if (!teacherFormData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!teacherFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(teacherFormData.email)) errors.email = 'Please enter a valid email address';
    }
    if (!teacherFormData.password.trim()) {
      errors.password = 'Password is required';
    } else if (teacherFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const errors = validateTeacherForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await API.post('/admin/teachers', teacherFormData);
      if (response.data.success) {
        alert(response.data.message || 'Teacher added successfully! Password has been set and email sent to teacher.');
      }
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setFormErrors({});
      onShowAddTeacherForm(false);
      onRefreshTeachers();
      onRefreshDashboardStats();
    } catch (err) {
      console.error('Error adding teacher:', err);
      alert(err.response?.data?.message || 'Failed to add teacher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAddTeacher = () => {
    onShowAddTeacherForm(false);
    setTeacherFormData({ fullName: '', email: '', password: '' });
    setFormErrors({});
  };

  const handleApproveApplication = (application) => {
    setSelectedApplication(application);
    setApprovalPassword('');
    setApprovalPasswordConfirm('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!approvalPassword || approvalPassword.trim() === '') {
      setPasswordError('Password is required');
      return;
    }
    if (approvalPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    if (approvalPassword !== approvalPasswordConfirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    try {
      const response = await API.post(`/admin/approve-teacher/${selectedApplication._id}`, {
        password: approvalPassword
      });
      if (response.data.success) {
        alert('Teacher application approved successfully! Password has been set and email sent to teacher.');
        setShowPasswordModal(false);
        setApprovalPassword('');
        setApprovalPasswordConfirm('');
        setSelectedApplication(null);
        if (teacherFilter === 'pending') {
          onRefreshPending();
        } else if (teacherFilter === 'approved') {
          onRefreshTeachers();
        }
        onRefreshDashboardStats();
      } else {
        alert(response.data.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert(error.response?.data?.message || 'Failed to approve application');
    }
  };

  const openRejectionModal = (application) => {
    setSelectedApplication(application);
    setShowApprovalModal(true);
  };

  const handleRejectApplication = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await API.post(`/admin/reject-teacher/${selectedApplication._id}`, { rejectionReason });
      alert('Teacher application rejected');
      setShowApprovalModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      onRefreshPending();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      fullName: teacher.fullName || '',
      email: teacher.email || '',
      password: '',
      isApproved: teacher.isApproved !== undefined ? teacher.isApproved : true
    });
    setEditFormErrors({});
    setShowEditTeacherForm(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleUpdateTeacher = async (e) => {
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
        isApproved: editFormData.isApproved
      };
      if (editFormData.password.trim()) {
        updateData.password = editFormData.password;
      }
      await API.put(`/admin/teachers/${editingTeacher.id || editingTeacher._id}`, updateData);
      alert('Teacher updated successfully!');
      setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
      setEditFormErrors({});
      setShowEditTeacherForm(false);
      setEditingTeacher(null);
      onRefreshTeachers();
    } catch (err) {
      console.error('Error updating teacher:', err);
      alert(err.response?.data?.message || 'Failed to update teacher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEditTeacher = () => {
    setShowEditTeacherForm(false);
    setEditingTeacher(null);
    setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
    setEditFormErrors({});
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }
    try {
      await API.delete(`/admin/teachers/${teacherId}`);
      alert('Teacher deleted successfully!');
      onRefreshTeachers();
      onRefreshDashboardStats();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert(error.response?.data?.message || 'Failed to delete teacher. Please try again.');
    }
  };

  return (
    <div>
      <HeaderActions>
        <PageTitle style={{ marginBottom: 0 }}>Teachers Management</PageTitle>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontWeight: '600', color: '#333', fontSize: '1rem' }}>Filter:</label>
            <FilterSelect value={teacherFilter} onChange={(e) => onFilterChange(e.target.value)}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="deleted">Deleted</option>
            </FilterSelect>
          </div>
          {teacherFilter === 'approved' && (
            <Button variant="success" onClick={() => onShowAddTeacherForm(true)}>
              + Add Teacher
            </Button>
          )}
        </div>
      </HeaderActions>

      {/* Pending Applications */}
      {teacherFilter === 'pending' && (
        <SectionCard>
          <SectionTitle>Pending Teacher Applications ({pendingApplications.length})</SectionTitle>
          {loadingTeachers ? (
            <EmptyState>Loading applications...</EmptyState>
          ) : pendingApplications.length === 0 ? (
            <EmptyState>No pending applications found.</EmptyState>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingApplications.map((application) => (
                <ApplicationCard key={application._id} status="pending">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#e65100', fontSize: '1.2rem' }}>
                        {application.fullName}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                          <strong>Email:</strong> {application.email}
                        </p>
                        {application.age && (
                          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                            <strong>Age:</strong> {application.age}
                          </p>
                        )}
                        {application.phone && (
                          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                            <strong>Phone:</strong> {application.phone}
                          </p>
                        )}
                        {application.confidenceLevel && (
                          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                            <strong>Confidence Level:</strong> {application.confidenceLevel}
                          </p>
                        )}
                      </div>
                      {application.teachingExperience && (
                        <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                          <strong>Experience:</strong> {application.teachingExperience}
                        </p>
                      )}
                      {application.coursesKnown && application.coursesKnown.length > 0 && (
                        <div style={{ margin: '0.5rem 0' }}>
                          <strong style={{ color: '#666', fontSize: '0.9rem' }}>Courses:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {application.coursesKnown.map((course, idx) => (
                              <span key={idx} style={{
                                background: '#e3f2fd',
                                color: '#1976d2',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem'
                              }}>
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
                        Applied: {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Button variant="success" size="small" onClick={() => handleApproveApplication(application)}>
                        Approve
                      </Button>
                      <Button variant="danger" size="small" onClick={() => openRejectionModal(application)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </ApplicationCard>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Rejected Applications */}
      {teacherFilter === 'rejected' && (
        <SectionCard>
          <SectionTitle>Rejected Teacher Applications ({rejectedApplications.length})</SectionTitle>
          {loadingTeachers ? (
            <EmptyState>Loading applications...</EmptyState>
          ) : rejectedApplications.length === 0 ? (
            <EmptyState>No rejected applications found.</EmptyState>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rejectedApplications.map((application) => (
                <ApplicationCard key={application._id} status="rejected">
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#c62828' }}>
                      {application.fullName}
                    </h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                      Email: {application.email}
                    </p>
                    {application.rejectionReason && (
                      <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontStyle: 'italic' }}>
                        Reason: {application.rejectionReason}
                      </p>
                    )}
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                      Rejected: {application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </ApplicationCard>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Deleted Teachers */}
      {teacherFilter === 'deleted' && (
        <SectionCard>
          <SectionTitle>Deleted Teachers</SectionTitle>
          <EmptyState>
            Deleted teachers cannot be viewed as they have been permanently removed from the system.
          </EmptyState>
        </SectionCard>
      )}

      {/* Add Teacher Form */}
      {teacherFilter === 'approved' && showAddTeacherForm && (
        <SectionCard key="add-teacher-form-card">
          <SectionTitle>Add New Teacher</SectionTitle>
          <form onSubmit={handleAddTeacher} key="add-teacher-form">
            <FormGroup>
              <FormLabel>Full Name *</FormLabel>
              <input
                key="fullName-input"
                type="text"
                name="fullName"
                value={teacherFormData.fullName || ''}
                onChange={handleTeacherFormChange}
                placeholder="Enter teacher's full name"
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: `2px solid ${formErrors.fullName ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '10px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  background: '#fafafa'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  handleTeacherFormBlur(e);
                  if (!formErrors.fullName) {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.background = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {formErrors.fullName && <ErrorText>{formErrors.fullName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Email *</FormLabel>
              <input
                key="email-input"
                type="email"
                name="email"
                value={teacherFormData.email || ''}
                onChange={handleTeacherFormChange}
                placeholder="Enter teacher's email"
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: `2px solid ${formErrors.email ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '10px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  background: '#fafafa'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  handleTeacherFormBlur(e);
                  if (!formErrors.email) {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.background = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Password *</FormLabel>
              <input
                key="password-input"
                type="password"
                name="password"
                value={teacherFormData.password || ''}
                onChange={handleTeacherFormChange}
                placeholder="Enter password (min 6 characters)"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: `2px solid ${formErrors.password ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '10px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  background: '#fafafa'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  handleTeacherFormBlur(e);
                  if (!formErrors.password) {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.background = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {formErrors.password && <ErrorText>{formErrors.password}</ErrorText>}
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit" variant="success" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Teacher'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancelAddTeacher} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Approved Teachers List */}
      {teacherFilter === 'approved' && (
        <SectionCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <SectionTitle style={{ marginBottom: 0 }}>
              Approved Teachers ({teachers.filter(t => t.isApproved).length})
            </SectionTitle>
            <Button variant="primary" size="small" onClick={onRefreshTeachers}>
              Refresh
            </Button>
          </div>

          {loadingTeachers ? (
            <EmptyState>Loading teachers...</EmptyState>
          ) : teachers.filter(t => t.isApproved).length === 0 ? (
            <EmptyState>No approved teachers found. Add a teacher to get started.</EmptyState>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderBottom: '2px solid #667eea',
                    color: 'white'
                  }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.filter(t => t.isApproved).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((teacher) => (
                    <tr 
                      key={teacher.id || teacher._id} 
                      style={{ 
                        borderBottom: '1px solid #eee',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{teacher.fullName}</td>
                      <td style={{ padding: '1rem', color: '#666' }}>{teacher.email}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                          color: 'white',
                          display: 'inline-block',
                          boxShadow: '0 2px 8px rgba(86, 171, 47, 0.3)'
                        }}>
                          {teacher.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>
                        {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <Button variant="primary" size="small" onClick={() => handleEditTeacher(teacher)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="small" onClick={() => handleDeleteTeacher(teacher.id || teacher._id)}>
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
          {teachers.filter(t => t.isApproved).length > itemsPerPage && (
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, teachers.filter(t => t.isApproved).length)} of {teachers.filter(t => t.isApproved).length} teachers
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
                  Page {currentPage} of {Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentPage === Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage) ? '#e0e0e0' : '#667eea',
                    color: currentPage === Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage) ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage)) {
                      e.target.style.backgroundColor = '#5a6fd8';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== Math.ceil(teachers.filter(t => t.isApproved).length / itemsPerPage)) {
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
      )}

      {/* Edit Teacher Form Modal */}
      {showEditTeacherForm && editingTeacher && (
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
              Edit Teacher
            </h3>

            <form onSubmit={handleUpdateTeacher}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
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
                  placeholder="Enter teacher's full name"
                />
                {editFormErrors.fullName && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editFormErrors.fullName}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
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
                  placeholder="Enter teacher's email"
                />
                {editFormErrors.email && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editFormErrors.email}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    name="isApproved"
                    checked={editFormData.isApproved}
                    onChange={handleEditFormChange}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Teacher is approved</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancelEditTeacher}
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
                  {isSubmitting ? 'Updating...' : 'Update Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal for Approval */}
      {showPasswordModal && selectedApplication && (
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
            width: '90%'
          }}>
            <h3 style={{ color: '#1976d2', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              Set Password for {selectedApplication.fullName}
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Password *
              </label>
              <input
                type="password"
                value={approvalPassword}
                onChange={(e) => setApprovalPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${passwordError ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                value={approvalPasswordConfirm}
                onChange={(e) => setApprovalPasswordConfirm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${passwordError ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm password"
              />
            </div>
            {passwordError && (
              <div style={{ color: '#f44336', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {passwordError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setApprovalPassword('');
                  setApprovalPasswordConfirm('');
                  setPasswordError('');
                  setSelectedApplication(null);
                }}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitApproval}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Approve & Set Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showApprovalModal && selectedApplication && (
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
            width: '90%'
          }}>
            <h3 style={{ color: '#f44336', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              Reject Application
            </h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Please provide a reason for rejecting {selectedApplication.fullName}'s application:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                minHeight: '100px',
                marginBottom: '1rem',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedApplication(null);
                  setRejectionReason('');
                }}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectApplication}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;

