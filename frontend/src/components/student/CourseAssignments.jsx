import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, ChevronDown } from 'lucide-react';
import API from '../../api';

const CourseAssignments = ({ courseId, isEnrolled }) => {
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [expandedAssignments, setExpandedAssignments] = useState([]);
  const [hoveredAssignments, setHoveredAssignments] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (courseId && isEnrolled) {
      fetchAssignments();
    } else if (courseId && !isEnrolled) {
      setAccessDenied(true);
      setLoadingAssignments(false);
    }
  }, [courseId, isEnrolled]);

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    setAccessDenied(false);
    try {
      const response = await API.get(`/student/courses/${courseId}/assignments`);
      if (response.data.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      if (error.response?.status === 403 || error.response?.data?.requiresEnrollment) {
        setAccessDenied(true);
      }
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return '';
    // If it's already a full URL, return as is
    if (fileUrl.startsWith('http')) return fileUrl;
    // Otherwise, prepend the backend URL
    return `http://localhost:5000${fileUrl}`;
  };

  const handleViewPDF = (fileUrl) => {
    const fullUrl = getFileUrl(fileUrl);
    if (fullUrl) {
      window.open(fullUrl, '_blank');
    }
  };

  const handleDownloadPDF = (fileUrl, fileName) => {
    const fullUrl = getFileUrl(fileUrl);
    if (fullUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName || 'assignment.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleAssignment = (assignmentId) => {
    setExpandedAssignments((prev) =>
      prev.includes(assignmentId)
        ? prev.filter((id) => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const handleMouseEnter = (assignmentId) => {
    setHoveredAssignments((prev) => {
      if (!prev.includes(assignmentId)) {
        return [...prev, assignmentId];
      }
      return prev;
    });
  };

  const handleMouseLeave = (assignmentId) => {
    setHoveredAssignments((prev) => prev.filter((id) => id !== assignmentId));
  };

  const isExpanded = (assignmentId) => {
    return expandedAssignments.includes(assignmentId) || hoveredAssignments.includes(assignmentId);
  };

  return (
    <div>
      <h4>Course Assignments</h4>
      <p className="text-muted mb-4">View and download assignment PDFs for self-learning and practice.</p>
      
      {accessDenied || !isEnrolled ? (
        <div className="card border-0 shadow-sm p-5 mt-3">
          <div className="text-center">
            <FileText size={48} className="text-muted mb-3" />
            <h5 className="mb-3">Assignments Locked</h5>
            <p className="text-muted mb-4">
              You need to enroll in this course to access assignments and downloadable resources.
            </p>
            <p className="text-muted small">
              Please enroll in the course to view and download assignment materials.
            </p>
          </div>
        </div>
      ) : loadingAssignments ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading assignments...</span>
          </div>
        </div>
      ) : assignments.length > 0 ? (
        <div>
          {assignments.map((assignment) => {
            const assignmentId = assignment._id || assignment.id;
            const expanded = isExpanded(assignmentId);
            
            return (
              <div
                key={assignmentId}
                className="mb-0"
                style={{
                  borderBottom: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => handleMouseEnter(assignmentId)}
                onMouseLeave={() => handleMouseLeave(assignmentId)}
              >
                {/* Title Header - Clickable and Hoverable */}
                <div
                  className="d-flex justify-content-between align-items-center p-3"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: expanded ? '#f8f9fa' : 'white',
                    transition: 'background-color 0.3s ease',
                    userSelect: 'none'
                  }}
                  onClick={() => toggleAssignment(assignmentId)}
                >
                  <div className="d-flex align-items-center flex-grow-1">
                    <ChevronDown
                      size={20}
                      className="me-2"
                      style={{
                        transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 1s ease',
                        color: '#666'
                      }}
                    />
                    <h5 className="mb-0" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                      {assignment.title}
                    </h5>
                  </div>
                </div>

                {/* Expandable Content */}
                <div
                  style={{
                    maxHeight: expanded ? '1000px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
                    opacity: expanded ? 1 : 0,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div className="p-3">
                    {assignment.description && (
                      <p className="text-muted mb-3">{assignment.description}</p>
                    )}
                    
                    {assignment.instructions && (
                      <p className="text-muted small mb-3">
                        <strong>Instructions:</strong> {assignment.instructions}
                      </p>
                    )}
                    
                    {assignment.attachments && assignment.attachments.length > 0 ? (
                      <div>
                        <h6 className="mb-3" style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                          Assignment Files:
                        </h6>
                        <div className="list-group">
                          {assignment.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="list-group-item d-flex justify-content-between align-items-center"
                              style={{ border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '0.5rem' }}
                            >
                              <div className="d-flex align-items-center">
                                <FileText size={20} className="text-danger me-3" />
                                <div>
                                  <div className="fw-semibold">{attachment.fileName || 'Assignment.pdf'}</div>
                                  {attachment.fileSize && (
                                    <small className="text-muted">{formatFileSize(attachment.fileSize)}</small>
                                  )}
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewPDF(attachment.fileUrl);
                                  }}
                                  title="View PDF"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF(attachment.fileUrl, attachment.fileName);
                                  }}
                                  title="Download PDF"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-info mb-0">
                        <FileText size={16} className="me-2" />
                        No PDF file attached to this assignment yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-4 mt-3">
          <div className="text-center">
            <FileText size={48} className="text-muted mb-3" />
            <p className="text-muted mb-0">No assignments available for this course yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssignments;

