import React, { useState } from 'react';

const TeacherAssignments = ({
  assignments,
  courses,
  loadingAssignments,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onEditAssignment,
  editingAssignment
}) => {
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    courseId: '',
    maxPoints: 100
  });
  const [assignmentFormErrors, setAssignmentFormErrors] = useState({});
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [showEditAssignmentForm, setShowEditAssignmentForm] = useState(false);
  const [editAssignmentFormData, setEditAssignmentFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    courseId: '',
    maxPoints: 100
  });
  const [editAssignmentFormErrors, setEditAssignmentFormErrors] = useState({});
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);

  React.useEffect(() => {
    if (editingAssignment) {
      setEditAssignmentFormData({
        title: editingAssignment.title,
        description: editingAssignment.description,
        dueDate: editingAssignment.dueDate.split('T')[0],
        courseId: editingAssignment.course._id,
        maxPoints: editingAssignment.maxPoints
      });
      setEditAssignmentFormErrors({});
      setShowEditAssignmentForm(true);
      setShowAddAssignmentForm(false);
    }
  }, [editingAssignment]);

  const handleAssignmentFormChange = (e) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({ ...prev, [name]: value }));
    if (assignmentFormErrors[name]) {
      setAssignmentFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditAssignmentFormChange = (e) => {
    const { name, value } = e.target;
    setEditAssignmentFormData(prev => ({ ...prev, [name]: value }));
    if (editAssignmentFormErrors[name]) {
      setEditAssignmentFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAssignmentForm = () => {
    const errors = {};
    if (!assignmentFormData.title.trim()) errors.title = 'Assignment title is required';
    if (!assignmentFormData.description.trim()) errors.description = 'Assignment description is required';
    if (!assignmentFormData.dueDate.trim()) errors.dueDate = 'Due date is required';
    if (!assignmentFormData.courseId.trim()) errors.courseId = 'Course selection is required';
    return errors;
  };

  const validateEditAssignmentForm = () => {
    const errors = {};
    if (!editAssignmentFormData.title.trim()) errors.title = 'Assignment title is required';
    if (!editAssignmentFormData.description.trim()) errors.description = 'Assignment description is required';
    if (!editAssignmentFormData.dueDate.trim()) errors.dueDate = 'Due date is required';
    if (!editAssignmentFormData.courseId.trim()) errors.courseId = 'Course selection is required';
    return errors;
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    const errors = validateAssignmentForm();
    if (Object.keys(errors).length > 0) {
      setAssignmentFormErrors(errors);
      return;
    }
    
    setIsSubmittingAssignment(true);
    try {
      await onCreateAssignment(assignmentFormData);
      setAssignmentFormData({ title: '', description: '', dueDate: '', courseId: '', maxPoints: 100 });
      setAssignmentFormErrors({});
      setShowAddAssignmentForm(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    const errors = validateEditAssignmentForm();
    if (Object.keys(errors).length > 0) {
      setEditAssignmentFormErrors(errors);
      return;
    }
    
    setIsUpdatingAssignment(true);
    try {
      await onUpdateAssignment(editingAssignment._id, editAssignmentFormData);
      setEditAssignmentFormData({ title: '', description: '', dueDate: '', courseId: '', maxPoints: 100 });
      setEditAssignmentFormErrors({});
      setShowEditAssignmentForm(false);
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  const handleEditClick = (assignment) => {
    if (onEditAssignment) {
      onEditAssignment(assignment);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem' 
      }}>
        <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '0' }}>
          Assignments
        </h1>
        <button
          onClick={() => {
            setShowAddAssignmentForm(true);
            setShowEditAssignmentForm(false);
          }}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1976d2';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2196f3';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          + Create Assignment
        </button>
      </div>

      {/* Add Assignment Form */}
      {showAddAssignmentForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Create New Assignment
          </h3>
          
          <form onSubmit={handleAddAssignment}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Assignment Title *
              </label>
              <input
                type="text"
                name="title"
                value={assignmentFormData.title}
                onChange={handleAssignmentFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${assignmentFormErrors.title ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter assignment title"
              />
              {assignmentFormErrors.title && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {assignmentFormErrors.title}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={assignmentFormData.description}
                onChange={handleAssignmentFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${assignmentFormErrors.description ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Enter assignment description"
              />
              {assignmentFormErrors.description && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {assignmentFormErrors.description}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={assignmentFormData.dueDate}
                  onChange={handleAssignmentFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${assignmentFormErrors.dueDate ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                {assignmentFormErrors.dueDate && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {assignmentFormErrors.dueDate}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Course *
                </label>
                <select
                  name="courseId"
                  value={assignmentFormData.courseId}
                  onChange={handleAssignmentFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${assignmentFormErrors.courseId ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
                {assignmentFormErrors.courseId && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {assignmentFormErrors.courseId}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Max Points
                </label>
                <input
                  type="number"
                  name="maxPoints"
                  value={assignmentFormData.maxPoints}
                  onChange={handleAssignmentFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isSubmittingAssignment}
                style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isSubmittingAssignment ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: isSubmittingAssignment ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmittingAssignment ? 'Creating...' : 'Create Assignment'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddAssignmentForm(false);
                  setAssignmentFormData({ title: '', description: '', dueDate: '', courseId: '', maxPoints: 100 });
                  setAssignmentFormErrors({});
                }}
                disabled={isSubmittingAssignment}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isSubmittingAssignment ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Assignment Form */}
      {showEditAssignmentForm && editingAssignment && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Edit Assignment
          </h3>
          
          <form onSubmit={handleUpdateAssignment}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Assignment Title *
              </label>
              <input
                type="text"
                name="title"
                value={editAssignmentFormData.title}
                onChange={handleEditAssignmentFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${editAssignmentFormErrors.title ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter assignment title"
              />
              {editAssignmentFormErrors.title && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {editAssignmentFormErrors.title}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={editAssignmentFormData.description}
                onChange={handleEditAssignmentFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${editAssignmentFormErrors.description ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Enter assignment description"
              />
              {editAssignmentFormErrors.description && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {editAssignmentFormErrors.description}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={editAssignmentFormData.dueDate}
                  onChange={handleEditAssignmentFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${editAssignmentFormErrors.dueDate ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                {editAssignmentFormErrors.dueDate && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editAssignmentFormErrors.dueDate}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Course *
                </label>
                <select
                  name="courseId"
                  value={editAssignmentFormData.courseId}
                  onChange={handleEditAssignmentFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${editAssignmentFormErrors.courseId ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
                {editAssignmentFormErrors.courseId && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editAssignmentFormErrors.courseId}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Max Points
                </label>
                <input
                  type="number"
                  name="maxPoints"
                  value={editAssignmentFormData.maxPoints}
                  onChange={handleEditAssignmentFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isUpdatingAssignment}
                style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isUpdatingAssignment ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: isUpdatingAssignment ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isUpdatingAssignment ? 'Updating...' : 'Update Assignment'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowEditAssignmentForm(false);
                  setEditAssignmentFormData({ title: '', description: '', dueDate: '', courseId: '', maxPoints: 100 });
                  setEditAssignmentFormErrors({});
                }}
                disabled={isUpdatingAssignment}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isUpdatingAssignment ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
          My Assignments ({assignments.length})
        </h3>
        
        {loadingAssignments ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading assignments...</div>
          </div>
        ) : assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No assignments found. Create your first assignment using the button above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Title</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Course</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Due Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Points</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Submissions</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{assignment.title}</div>
                      <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {assignment.description}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#666' }}>
                        {assignment.course?.title || 'Unknown Course'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#666' }}>{assignment.maxPoints}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#666' }}>{assignment.submissions?.length || 0}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditClick(assignment)}
                          style={{
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#1976d2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#2196f3'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteAssignment(assignment._id)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;

