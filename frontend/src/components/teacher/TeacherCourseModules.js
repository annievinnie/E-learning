import React, { useState } from 'react';

const TeacherCourseModules = ({
  selectedCourse,
  onBackToCourses,
  onAddModule,
  onDeleteModule,
  onAddVideo,
  onDeleteVideo
}) => {
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '', order: 1 });
  const [moduleFormErrors, setModuleFormErrors] = useState({});
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  const [videoFormData, setVideoFormData] = useState({ title: '', description: '', videoFile: null, duration: '', order: 1 });
  const [videoFormErrors, setVideoFormErrors] = useState({});
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  const handleModuleFormChange = (e) => {
    const { name, value } = e.target;
    setModuleFormData(prev => ({ ...prev, [name]: value }));
    if (moduleFormErrors[name]) {
      setModuleFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVideoFormChange = (e) => {
    const { name, value, files } = e.target;
    setVideoFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    if (videoFormErrors[name]) {
      setVideoFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateModuleForm = () => {
    const errors = {};
    if (!moduleFormData.title.trim()) errors.title = 'Module title is required';
    if (!moduleFormData.description.trim()) errors.description = 'Module description is required';
    return errors;
  };

  const validateVideoForm = () => {
    const errors = {};
    if (!videoFormData.title.trim()) errors.title = 'Video title is required';
    if (!videoFormData.description.trim()) errors.description = 'Video description is required';
    if (!videoFormData.videoFile) errors.videoFile = 'Video file is required';
    if (!videoFormData.duration.trim()) errors.duration = 'Video duration is required';
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
      await onAddModule({
        ...moduleFormData,
        order: selectedCourse?.modules ? selectedCourse.modules.length + 1 : 1
      });
      setModuleFormData({ title: '', description: '', order: 1 });
      setModuleFormErrors({});
      setShowAddModuleForm(false);
    } catch (error) {
      console.error('Error creating module:', error);
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleAddVideoSubmit = async (e) => {
    e.preventDefault();
    const errors = validateVideoForm();
    if (Object.keys(errors).length > 0) {
      setVideoFormErrors(errors);
      return;
    }
    
    setIsSubmittingVideo(true);
    try {
      await onAddVideo(selectedModule, videoFormData);
      setVideoFormData({ title: '', description: '', videoFile: null, duration: '', order: 1 });
      setVideoFormErrors({});
      setShowAddVideoForm(false);
      setSelectedModule(null);
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleAddVideoToModule = (module) => {
    setSelectedModule(module);
    setVideoFormData({
      title: '',
      description: '',
      videoFile: null,
      duration: '',
      order: module.videos ? module.videos.length + 1 : 1
    });
    setVideoFormErrors({});
    setShowAddVideoForm(true);
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
          <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '0' }}>
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
          <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Add New Module
          </h3>
          
          <form onSubmit={handleAddModuleSubmit}>
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

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isSubmittingModule}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: isSubmittingModule ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  opacity: isSubmittingModule ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmittingModule ? 'Creating...' : 'Create Module'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAddModuleForm(false);
                  setModuleFormData({ title: '', description: '', order: 1 });
                  setModuleFormErrors({});
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

      {/* Add Video Form Modal */}
      {showAddVideoForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              Add Video to "{selectedModule?.title}"
            </h3>
            
            <form onSubmit={handleAddVideoSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Video Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={videoFormData.title}
                  onChange={handleVideoFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${videoFormErrors.title ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter video title"
                />
                {videoFormErrors.title && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {videoFormErrors.title}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={videoFormData.description}
                  onChange={handleVideoFormChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${videoFormErrors.description ? '#f44336' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter video description"
                />
                {videoFormErrors.description && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {videoFormErrors.description}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Video File *
                  </label>
                  <input
                    type="file"
                    name="videoFile"
                    accept="video/*"
                    onChange={handleVideoFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${videoFormErrors.videoFile ? '#f44336' : '#ccc'}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  {videoFormErrors.videoFile && (
                    <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {videoFormErrors.videoFile}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={videoFormData.duration}
                    onChange={handleVideoFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${videoFormErrors.duration ? '#f44336' : '#ccc'}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., 15:30"
                  />
                  {videoFormErrors.duration && (
                    <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {videoFormErrors.duration}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={isSubmittingVideo}
                  style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: isSubmittingVideo ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    opacity: isSubmittingVideo ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isSubmittingVideo ? 'Uploading...' : 'Upload Video'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideoForm(false);
                    setSelectedModule(null);
                  }}
                  disabled={isSubmittingVideo}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    border: '1px solid #ccc',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: isSubmittingVideo ? 'not-allowed' : 'pointer',
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
        </div>
      )}

      {/* Modules List */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
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
                    <h4 style={{ color: '#2e7d32', margin: 0, fontSize: '1.2rem' }}>
                      Module {module.order}: {module.title}
                    </h4>
                    <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      {module.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAddVideoToModule(module)}
                      style={{
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      + Add Video
                    </button>
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
                </div>

                {/* Videos in Module */}
                {module.videos && module.videos.length > 0 ? (
                  <div style={{ marginTop: '1rem' }}>
                    <h5 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Videos ({module.videos.length})
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {module.videos.map((video) => (
                        <div key={video.id || video._id} style={{
                          padding: '0.75rem',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
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
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                {video.order}. {video.title}
                              </div>
                              <div style={{ color: '#666', fontSize: '0.8rem' }}>
                                {video.description} • Duration: {video.duration}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              onDeleteVideo(video.id || video._id, module);
                            }}
                            style={{
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.7rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                    No videos in this module yet. Click "Add Video" to get started.
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

