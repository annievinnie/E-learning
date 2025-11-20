import React, { useState, useEffect } from 'react';

const TeacherCourses = ({
  courses,
  loadingCourses,
  onViewModules,
  onEditCourse,
  onDeleteCourse,
  onCreateCourse,
  onUpdateCourse,
  editingCourse
}) => {
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [visibleCoursesCount, setVisibleCoursesCount] = useState(6); // Show 2 rows initially (3 columns x 2 rows = 6)
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    category: 'Other',
    price: 0,
    thumbnailFile: null
  });
  const [courseFormErrors, setCourseFormErrors] = useState({});
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [editCourseFormData, setEditCourseFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    category: 'Other',
    price: 0,
    thumbnailFile: null
  });
  const [editCourseFormErrors, setEditCourseFormErrors] = useState({});
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);

  // Calculate cards per row based on screen size
  useEffect(() => {
    const calculateCardsPerRow = () => {
      const width = window.innerWidth;
      // For auto-fit grid with minmax(300px, 1fr), typically shows 2-3 columns
      if (width >= 900) return 3; // 3 columns
      if (width >= 600) return 2; // 2 columns
      return 1; // 1 column
    };

    const updateCardsPerRow = () => {
      const newCardsPerRow = calculateCardsPerRow();
      setCardsPerRow(newCardsPerRow);
      // Reset visible count to 2 rows when screen size changes
      setVisibleCoursesCount(newCardsPerRow * 2);
    };

    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  React.useEffect(() => {
    if (editingCourse) {
      setEditCourseFormData({
        title: editingCourse.title,
        description: editingCourse.description,
        duration: editingCourse.duration,
        level: editingCourse.level,
        category: editingCourse.category || 'Other',
        price: editingCourse.price || 0,
        thumbnailFile: null
      });
      setEditCourseFormErrors({});
      setShowEditCourseForm(true);
      setShowAddCourseForm(false);
    }
  }, [editingCourse]);

  const handleViewMore = () => {
    setVisibleCoursesCount(prev => prev + cardsPerRow); // Add one more row
  };

  const handleCourseFormChange = (e) => {
    const { name, value, files } = e.target;
    
    // Special handling for file inputs
    if (name === 'thumbnailFile' && files) {
      setCourseFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      return;
    }
    
    // Special handling for duration field to format as hh:mm:ss
    if (name === 'duration') {
      // Remove all non-numeric characters except colon if it's in the right position
      let cleanedValue = value.replace(/[^0-9:]/g, '');
      
      // If there's a colon, remove it and we'll add it back in the right place
      const hasColon = cleanedValue.includes(':');
      const numericValue = cleanedValue.replace(/:/g, '');
      
      // Format as hh:mm:ss
      let formattedValue = '';
      if (numericValue.length === 0) {
        formattedValue = '';
      } else if (numericValue.length <= 2) {
        formattedValue = numericValue;
      } else if (numericValue.length <= 4) {
        const hours = numericValue.slice(0, 2);
        const minutes = numericValue.slice(2, 4);
        formattedValue = `${hours}:${minutes}`;
      } else {
        const hours = numericValue.slice(0, 2);
        const minutes = numericValue.slice(2, 4);
        const seconds = numericValue.slice(4, 6);
        formattedValue = `${hours}:${minutes}:${seconds}`;
      }
      
      setCourseFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setCourseFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (courseFormErrors[name]) {
      setCourseFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEditCourseFormChange = (e) => {
    const { name, value, files } = e.target;
    
    // Special handling for file inputs
    if (name === 'thumbnailFile' && files) {
      setEditCourseFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      return;
    }
    
    // Special handling for duration field to format as hh:mm:ss
    if (name === 'duration') {
      // Remove all non-numeric characters except colon if it's in the right position
      let cleanedValue = value.replace(/[^0-9:]/g, '');
      
      // If there's a colon, remove it and we'll add it back in the right place
      const hasColon = cleanedValue.includes(':');
      const numericValue = cleanedValue.replace(/:/g, '');
      
      // Format as hh:mm:ss
      let formattedValue = '';
      if (numericValue.length === 0) {
        formattedValue = '';
      } else if (numericValue.length <= 2) {
        formattedValue = numericValue;
      } else if (numericValue.length <= 4) {
        const hours = numericValue.slice(0, 2);
        const minutes = numericValue.slice(2, 4);
        formattedValue = `${hours}:${minutes}`;
      } else {
        const hours = numericValue.slice(0, 2);
        const minutes = numericValue.slice(2, 4);
        const seconds = numericValue.slice(4, 6);
        formattedValue = `${hours}:${minutes}:${seconds}`;
      }
      
      setEditCourseFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setEditCourseFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (editCourseFormErrors[name]) {
      setEditCourseFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateCourseForm = () => {
    const errors = {};
    if (!courseFormData.title.trim()) {
      errors.title = 'Course title is required';
    }
    if (!courseFormData.description.trim()) {
      errors.description = 'Course description is required';
    }
    if (!courseFormData.duration.trim()) {
      errors.duration = 'Course duration is required';
    } else {
      // Validate hh:mm:ss format
      const durationPattern = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!durationPattern.test(courseFormData.duration)) {
        errors.duration = 'Duration must be in hh:mm:ss format (e.g., 02:30:45)';
      }
    }
    return errors;
  };

  const validateEditCourseForm = () => {
    const errors = {};
    if (!editCourseFormData.title.trim()) {
      errors.title = 'Course title is required';
    }
    if (!editCourseFormData.description.trim()) {
      errors.description = 'Course description is required';
    }
    if (!editCourseFormData.duration.trim()) {
      errors.duration = 'Course duration is required';
    } else {
      // Validate hh:mm:ss format
      const durationPattern = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!durationPattern.test(editCourseFormData.duration)) {
        errors.duration = 'Duration must be in hh:mm:ss format (e.g., 02:30:45)';
      }
    }
    return errors;
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const errors = validateCourseForm();
    if (Object.keys(errors).length > 0) {
      setCourseFormErrors(errors);
      return;
    }
    
    setIsSubmittingCourse(true);
    try {
      await onCreateCourse(courseFormData);
      setCourseFormData({ title: '', description: '', duration: '', level: 'beginner', category: 'Other', price: 0, thumbnailFile: null });
      setCourseFormErrors({});
      setShowAddCourseForm(false);
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const errors = validateEditCourseForm();
    if (Object.keys(errors).length > 0) {
      setEditCourseFormErrors(errors);
      return;
    }
    
    setIsUpdatingCourse(true);
    try {
      await onUpdateCourse(editingCourse._id, editCourseFormData);
      setEditCourseFormData({ title: '', description: '', duration: '', level: 'beginner', category: 'Other', price: 0, thumbnailFile: null });
      setEditCourseFormErrors({});
      setShowEditCourseForm(false);
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  const handleEditClick = (course) => {
    onEditCourse(course);
  };

  return (
    <div>
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem' 
      }}>
        <h1 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '2.5rem', marginBottom: '0' }}>
          My Courses
        </h1>
        <button
          onClick={() => {
            setShowAddCourseForm(true);
            setShowEditCourseForm(false);
          }}
          style={{
            backgroundColor: '#4caf50',
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
            e.target.style.backgroundColor = '#45a049';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4caf50';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          + Create Course
        </button>
      </div>

      {/* Add Course Form */}
      {showAddCourseForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Create New Course
          </h3>
          
          <form onSubmit={handleAddCourse}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={courseFormData.title}
                onChange={handleCourseFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${courseFormErrors.title ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter course title"
              />
              {courseFormErrors.title && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {courseFormErrors.title}
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
                Description *
              </label>
              <textarea
                name="description"
                value={courseFormData.description}
                onChange={handleCourseFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${courseFormErrors.description ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Enter course description"
              />
              {courseFormErrors.description && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {courseFormErrors.description}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={courseFormData.duration}
                  onChange={handleCourseFormChange}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, and arrow keys
                    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true)) {
                      return;
                    }
                    // Only allow numbers (0-9) from both main keyboard and numpad
                    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    // Prevent paste and handle it manually
                    e.preventDefault();
                    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                    const numericValue = pastedText.replace(/\D/g, '');
                    let formattedValue = '';
                    if (numericValue.length > 0) {
                      if (numericValue.length <= 2) {
                        formattedValue = numericValue;
                      } else if (numericValue.length <= 4) {
                        const hours = numericValue.slice(0, 2);
                        const minutes = numericValue.slice(2, 4);
                        formattedValue = `${hours}:${minutes}`;
                      } else {
                        const hours = numericValue.slice(0, 2);
                        const minutes = numericValue.slice(2, 4);
                        const seconds = numericValue.slice(4, 6);
                        formattedValue = `${hours}:${minutes}:${seconds}`;
                      }
                      setCourseFormData(prev => ({
                        ...prev,
                        duration: formattedValue
                      }));
                    }
                  }}
                  maxLength={8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${courseFormErrors.duration ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                  placeholder="hh:mm:ss (e.g., 02:30:45)"
                />
                {courseFormErrors.duration && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {courseFormErrors.duration}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Level
                </label>
                <select
                  name="level"
                  value={courseFormData.level}
                  onChange={handleCourseFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={courseFormData.category}
                  onChange={handleCourseFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Photography">Photography</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={courseFormData.price}
                  onChange={handleCourseFormChange}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                Thumbnail Image
              </label>
              <input
                type="file"
                name="thumbnailFile"
                accept="image/*"
                onChange={handleCourseFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              {courseFormData.thumbnailFile && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  Selected: {courseFormData.thumbnailFile.name}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isSubmittingCourse}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isSubmittingCourse ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: isSubmittingCourse ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmittingCourse ? 'Creating...' : 'Create Course'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddCourseForm(false);
                  setCourseFormData({ title: '', description: '', duration: '', level: 'beginner', category: 'Other', price: 0, thumbnailFile: null });
                  setCourseFormErrors({});
                }}
                disabled={isSubmittingCourse}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isSubmittingCourse ? 'not-allowed' : 'pointer',
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

      {/* Edit Course Form */}
      {showEditCourseForm && editingCourse && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Edit Course
          </h3>
          
          <form onSubmit={handleUpdateCourse}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={editCourseFormData.title}
                onChange={handleEditCourseFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${editCourseFormErrors.title ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter course title"
              />
              {editCourseFormErrors.title && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {editCourseFormErrors.title}
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
                Description *
              </label>
              <textarea
                name="description"
                value={editCourseFormData.description}
                onChange={handleEditCourseFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${editCourseFormErrors.description ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Enter course description"
              />
              {editCourseFormErrors.description && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {editCourseFormErrors.description}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={editCourseFormData.duration}
                  onChange={handleEditCourseFormChange}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, and arrow keys
                    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true)) {
                      return;
                    }
                    // Only allow numbers (0-9) from both main keyboard and numpad
                    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    // Prevent paste and handle it manually
                    e.preventDefault();
                    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                    const numericValue = pastedText.replace(/\D/g, '');
                    let formattedValue = '';
                    if (numericValue.length > 0) {
                      if (numericValue.length <= 2) {
                        formattedValue = numericValue;
                      } else if (numericValue.length <= 4) {
                        const hours = numericValue.slice(0, 2);
                        const minutes = numericValue.slice(2, 4);
                        formattedValue = `${hours}:${minutes}`;
                      } else {
                        const hours = numericValue.slice(0, 2);
                        const minutes = numericValue.slice(2, 4);
                        const seconds = numericValue.slice(4, 6);
                        formattedValue = `${hours}:${minutes}:${seconds}`;
                      }
                      setEditCourseFormData(prev => ({
                        ...prev,
                        duration: formattedValue
                      }));
                    }
                  }}
                  maxLength={8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${editCourseFormErrors.duration ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                  placeholder="hh:mm:ss (e.g., 02:30:45)"
                />
                {editCourseFormErrors.duration && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {editCourseFormErrors.duration}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Level
                </label>
                <select
                  name="level"
                  value={editCourseFormData.level}
                  onChange={handleEditCourseFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={editCourseFormData.category}
                  onChange={handleEditCourseFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Photography">Photography</option>
                  <option value="Music">Music</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editCourseFormData.price}
                  onChange={handleEditCourseFormChange}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                Thumbnail Image
              </label>
              <input
                type="file"
                name="thumbnailFile"
                accept="image/*"
                onChange={handleEditCourseFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              {editingCourse?.thumbnail && !editCourseFormData.thumbnailFile && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  <div style={{ marginBottom: '0.5rem' }}>Current thumbnail:</div>
                  <img 
                    src={editingCourse.thumbnail.startsWith('http') ? editingCourse.thumbnail : `http://localhost:5000${editingCourse.thumbnail}`} 
                    alt="Current thumbnail" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '120px', 
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0'
                    }} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {editCourseFormData.thumbnailFile && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  New: {editCourseFormData.thumbnailFile.name}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isUpdatingCourse}
                style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isUpdatingCourse ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: isUpdatingCourse ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isUpdatingCourse ? 'Updating...' : 'Update Course'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowEditCourseForm(false);
                  setEditCourseFormData({ title: '', description: '', duration: '', level: 'beginner', category: 'Other', price: 0, thumbnailFile: null });
                  setEditCourseFormErrors({});
                }}
                disabled={isUpdatingCourse}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isUpdatingCourse ? 'not-allowed' : 'pointer',
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

      {/* Courses List */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1rem' }}>
          My Courses ({courses.length})
        </h3>
        
        {loadingCourses ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading courses...</div>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No courses found. Create your first course using the button above.</p>
          </div>
        ) : (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {courses.slice(0, visibleCoursesCount).map((course) => (
              <div key={course._id} style={{
                padding: '0',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Thumbnail - Top */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px 8px 0 0',
                  overflow: 'hidden'
                }}>
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`} 
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.textContent = 'Thumbnail';
                      }}
                    />
                  ) : (
                    <span style={{ color: '#999', fontSize: '1rem', fontWeight: 'bold' }}>Thumbnail</span>
                  )}
                </div>

                {/* Title - Below Thumbnail */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  textAlign: 'center',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    color: '#333', 
                    margin: 0, 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold'
                  }}>
                    {course.title || 'Title'}
                  </h4>
                </div>

                {/* Details - Below Title */}
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  fontSize: '0.85rem',
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>{course.description || 'Mern stack'}</strong>
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Duration: {course.duration || '14:25:36'}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Level: {course.level || 'intermediate'}
                  </div>
                  <div>
                    Students: {course.students?.length || 0} | Status: {course.status || 'active'}
                  </div>
                </div>

                {/* Category Badge - Below Details */}
                {course.category && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'white',
                    textAlign: 'center',
                    borderTop: '1px solid #e9ecef',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {course.category}
                    </span>
                  </div>
                )}

                {/* Action Buttons - Bottom */}
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '0 0 8px 8px'
                }}>
                  <button
                    onClick={() => onViewModules(course)}
                    style={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      flex: 1,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#45a049';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#4caf50';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Manage Modules
                  </button>
                  <button
                    onClick={() => handleEditClick(course)}
                    style={{
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      flex: 1,
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
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteCourse(course._id)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      flex: 1,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#d32f2f';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f44336';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {courses.length > visibleCoursesCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button
                onClick={handleViewMore}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                View More
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherCourses;

