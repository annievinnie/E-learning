import React, { useState } from 'react';

const TeacherCourseModules = ({
  selectedCourse,
  onBackToCourses,
  onAddModule,
  onDeleteModule
}) => {
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [moduleType, setModuleType] = useState('video'); // 'video' or 'mcq'
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '', videoFile: null, duration: '' });
  const [mcqQuestions, setMcqQuestions] = useState([{ question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '' }]);
  const [moduleFormErrors, setModuleFormErrors] = useState({});
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);

  // Function to calculate video duration
  const calculateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration; // Duration in seconds
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);
        
        // Format as HH:MM:SS or MM:SS
        let formattedDuration;
        if (hours > 0) {
          formattedDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        resolve(formattedDuration);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleModuleFormChange = async (e) => {
    const { name, value, files } = e.target;
    
    if (files && files[0] && name === 'videoFile') {
      // When video file is selected, calculate duration
      setIsCalculatingDuration(true);
      try {
        const duration = await calculateVideoDuration(files[0]);
        setModuleFormData(prev => ({ 
          ...prev, 
          [name]: files[0],
          duration: duration
        }));
      } catch (error) {
        console.error('Error calculating video duration:', error);
        setModuleFormData(prev => ({ 
          ...prev, 
          [name]: files[0],
          duration: '0:00'
        }));
      } finally {
        setIsCalculatingDuration(false);
      }
    } else {
      setModuleFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    }
    
    if (moduleFormErrors[name]) {
      setModuleFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateModuleForm = () => {
    const errors = {};
    if (!moduleFormData.title.trim()) errors.title = 'Module title is required';
    if (!moduleFormData.description.trim()) errors.description = 'Module description is required';
    
    if (moduleType === 'video') {
      if (!moduleFormData.videoFile) errors.videoFile = 'Video file is required';
    } else if (moduleType === 'mcq') {
      if (mcqQuestions.length === 0) {
        errors.mcqQuestions = 'At least one MCQ question is required';
      } else {
        mcqQuestions.forEach((q, qIndex) => {
          if (!q.question.trim()) {
            errors[`mcqQuestion_${qIndex}`] = 'Question text is required';
          }
          if (q.options.length < 2) {
            errors[`mcqOptions_${qIndex}`] = 'At least 2 options are required';
          }
          const correctCount = q.options.filter(opt => opt.isCorrect).length;
          if (correctCount !== 1) {
            errors[`mcqCorrect_${qIndex}`] = 'Exactly one option must be marked as correct';
          }
          q.options.forEach((opt, optIndex) => {
            if (!opt.text.trim()) {
              errors[`mcqOption_${qIndex}_${optIndex}`] = 'Option text is required';
            }
          });
        });
      }
    }
    return errors;
  };

  const handleAddModuleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateModuleForm();
    if (Object.keys(errors).length > 0) {
      setModuleFormErrors(errors);
      return;
    }
    
    setIsSubmittingModule(true);
    try {
      const moduleData = {
        ...moduleFormData,
        moduleType: moduleType,
        order: selectedCourse?.modules ? selectedCourse.modules.length + 1 : 1
      };

      if (moduleType === 'mcq') {
        moduleData.mcqQuestions = mcqQuestions;
      }

      await onAddModule(moduleData);
      setModuleFormData({ title: '', description: '', videoFile: null, duration: '' });
      setMcqQuestions([{ question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '' }]);
      setModuleFormErrors({});
      setModuleType('video');
      setShowAddModuleForm(false);
    } catch (error) {
      console.error('Error creating module:', error);
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const addMcqQuestion = () => {
    setMcqQuestions([...mcqQuestions, { question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '' }]);
  };

  const removeMcqQuestion = (index) => {
    setMcqQuestions(mcqQuestions.filter((_, i) => i !== index));
  };

  const updateMcqQuestion = (qIndex, field, value) => {
    const updated = [...mcqQuestions];
    updated[qIndex][field] = value;
    setMcqQuestions(updated);
  };

  const addMcqOption = (qIndex) => {
    const updated = [...mcqQuestions];
    updated[qIndex].options.push({ text: '', isCorrect: false });
    setMcqQuestions(updated);
  };

  const removeMcqOption = (qIndex, optIndex) => {
    const updated = [...mcqQuestions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== optIndex);
      setMcqQuestions(updated);
    }
  };

  const updateMcqOption = (qIndex, optIndex, field, value) => {
    const updated = [...mcqQuestions];
    if (field === 'isCorrect') {
      // Only one option can be correct, uncheck others
      updated[qIndex].options.forEach((opt, i) => {
        opt.isCorrect = i === optIndex ? value : false;
      });
    } else {
      updated[qIndex].options[optIndex][field] = value;
    }
    setMcqQuestions(updated);
  };

  if (!selectedCourse) {
    return <div>No course selected. Please select a course first.</div>;
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem' 
      }}>
        <div>
          <button
            onClick={onBackToCourses}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #ccc',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}
          >
            ← Back to Courses
          </button>
          <h1 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '2.5rem', marginBottom: '0' }}>
            {selectedCourse?.title} - Modules
          </h1>
        </div>
        <button
          onClick={() => setShowAddModuleForm(true)}
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
          + Add Module
        </button>
      </div>

      {/* Add Module Form */}
      {showAddModuleForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Add New Module
          </h3>
          
          <form onSubmit={handleAddModuleSubmit}>
            {/* Module Type Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#333', fontSize: '1rem' }}>
                Module Type *
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.75rem 1rem', border: `2px solid ${moduleType === 'video' ? '#667eea' : '#ccc'}`, borderRadius: '8px', backgroundColor: moduleType === 'video' ? '#f0f4ff' : 'white', transition: 'all 0.3s' }}>
                  <input
                    type="radio"
                    name="moduleType"
                    value="video"
                    checked={moduleType === 'video'}
                    onChange={(e) => setModuleType(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ fontWeight: '500' }}>📹 Regular Module (Video)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.75rem 1rem', border: `2px solid ${moduleType === 'mcq' ? '#667eea' : '#ccc'}`, borderRadius: '8px', backgroundColor: moduleType === 'mcq' ? '#f0f4ff' : 'white', transition: 'all 0.3s' }}>
                  <input
                    type="radio"
                    name="moduleType"
                    value="mcq"
                    checked={moduleType === 'mcq'}
                    onChange={(e) => setModuleType(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ fontWeight: '500' }}>📝 MCQ Quiz (Test Knowledge)</span>
                </label>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Module Title *
              </label>
              <input
                type="text"
                name="title"
                value={moduleFormData.title}
                onChange={handleModuleFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${moduleFormErrors.title ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter module title"
              />
              {moduleFormErrors.title && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {moduleFormErrors.title}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={moduleFormData.description}
                onChange={handleModuleFormChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${moduleFormErrors.description ? '#f44336' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Enter module description"
              />
              {moduleFormErrors.description && (
                <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {moduleFormErrors.description}
                </span>
              )}
            </div>

            {/* Video File Input - Only for video modules */}
            {moduleType === 'video' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Video File *
                </label>
                <input
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  onChange={handleModuleFormChange}
                  disabled={isCalculatingDuration}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${moduleFormErrors.videoFile ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    opacity: isCalculatingDuration ? 0.6 : 1
                  }}
                />
                {isCalculatingDuration && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#2196f3' }}>
                    Calculating video duration...
                  </div>
                )}
                {moduleFormErrors.videoFile && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {moduleFormErrors.videoFile}
                  </span>
                )}
                {moduleFormData.videoFile && !isCalculatingDuration && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    Selected: {moduleFormData.videoFile.name} ({(moduleFormData.videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                    {moduleFormData.duration && (
                      <span style={{ marginLeft: '1rem', color: '#667eea', fontWeight: '500' }}>
                        Duration: {moduleFormData.duration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MCQ Questions Form - Only for MCQ modules */}
            {moduleType === 'mcq' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', color: '#333', fontSize: '1rem' }}>
                    MCQ Questions *
                  </label>
                  <button
                    type="button"
                    onClick={addMcqQuestion}
                    style={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    + Add Question
                  </button>
                </div>
                
                {moduleFormErrors.mcqQuestions && (
                  <div style={{ color: '#f44336', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {moduleFormErrors.mcqQuestions}
                  </div>
                )}

                {mcqQuestions.map((q, qIndex) => (
                  <div key={qIndex} style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, color: '#667eea' }}>Question {qIndex + 1}</h4>
                      {mcqQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMcqQuestion(qIndex)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                        Question Text *
                      </label>
                      <textarea
                        value={q.question}
                        onChange={(e) => updateMcqQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter your question..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${moduleFormErrors[`mcqQuestion_${qIndex}`] ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          minHeight: '80px',
                          resize: 'vertical'
                        }}
                      />
                      {moduleFormErrors[`mcqQuestion_${qIndex}`] && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {moduleFormErrors[`mcqQuestion_${qIndex}`]}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                        Options * (Select one as correct)
                      </label>
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name={`correct_${qIndex}`}
                            checked={option.isCorrect}
                            onChange={(e) => updateMcqOption(qIndex, optIndex, 'isCorrect', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateMcqOption(qIndex, optIndex, 'text', e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              border: `1px solid ${moduleFormErrors[`mcqOption_${qIndex}_${optIndex}`] ? '#f44336' : '#ccc'}`,
                              borderRadius: '4px',
                              fontSize: '0.95rem'
                            }}
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeMcqOption(qIndex, optIndex)}
                              style={{
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addMcqOption(qIndex)}
                        style={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          marginTop: '0.5rem'
                        }}
                      >
                        + Add Option
                      </button>
                      {moduleFormErrors[`mcqOptions_${qIndex}`] && (
                        <div style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                          {moduleFormErrors[`mcqOptions_${qIndex}`]}
                        </div>
                      )}
                      {moduleFormErrors[`mcqCorrect_${qIndex}`] && (
                        <div style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                          {moduleFormErrors[`mcqCorrect_${qIndex}`]}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                        Explanation (Optional)
                      </label>
                      <textarea
                        value={q.explanation}
                        onChange={(e) => updateMcqQuestion(qIndex, 'explanation', e.target.value)}
                        placeholder="Explain the correct answer..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          minHeight: '60px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isSubmittingModule || isCalculatingDuration}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: (isSubmittingModule || isCalculatingDuration) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: (isSubmittingModule || isCalculatingDuration) ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmittingModule ? 'Creating...' : isCalculatingDuration ? 'Calculating...' : 'Create Module'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddModuleForm(false);
                  setModuleFormData({ title: '', description: '', videoFile: null, duration: '' });
                  setMcqQuestions([{ question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '' }]);
                  setModuleFormErrors({});
                  setModuleType('video');
                }}
                disabled={isSubmittingModule}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ccc',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isSubmittingModule ? 'not-allowed' : 'pointer',
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

      {/* Modules List */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1rem' }}>
          Course Modules ({selectedCourse?.modules?.length || 0})
        </h3>
        
        {selectedCourse?.modules?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No modules found. Add your first module using the button above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedCourse?.modules?.map((module) => (
              <div key={module.id || module._id} style={{
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#667eea', margin: 0, fontSize: '1.2rem' }}>
                      Module {module.order}: {module.title}
                    </h4>
                    <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      {module.description}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteModule(module.id || module._id)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Delete Module
                  </button>
                </div>

                {/* Module Type Badge */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    backgroundColor: module.moduleType === 'mcq' ? '#ff9800' : '#2196f3',
                    color: 'white'
                  }}>
                    {module.moduleType === 'mcq' ? '📝 MCQ Quiz' : '📹 Video Module'}
                  </span>
                </div>

                {/* Video in Module */}
                {module.moduleType === 'video' && module.video ? (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#f44336',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}>
                        ▶
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                          {module.video.title}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>
                          {module.video.description} {module.video.duration && `• Duration: ${module.video.duration}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : module.moduleType === 'mcq' && module.mcqQuestions ? (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ff9800' }}>
                      📝 MCQ Quiz: {module.mcqQuestions.length} Question{module.mcqQuestions.length !== 1 ? 's' : ''}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>
                      Test knowledge from previous modules
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                    No content in this module.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseModules;

