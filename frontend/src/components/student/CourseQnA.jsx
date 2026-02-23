import React, { useState, useEffect } from 'react';
import { MessageSquare, Lock, Send, Trash2, CheckCircle, XCircle, User } from 'lucide-react';
import API from '../../api';

const CourseQnA = ({ course, courseId, isEnrolled }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ content: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const id = courseId || course?._id;
    if (id && isEnrolled) {
      fetchQuestions();
    }
  }, [courseId, course?._id, isEnrolled]);

  const fetchQuestions = async () => {
    const id = courseId || course?._id;
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await API.get(`/qna/courses/${id}/questions`);
      if (response.data.success) {
        setQuestions(response.data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.content.trim()) {
      alert('Please enter your question.');
      return;
    }

    const id = courseId || course?._id;
    if (!id) return;

    setSubmitting(true);
    try {
      const response = await API.post(`/qna/courses/${id}/questions`, {
        content: newQuestion.content.trim()
      });

      if (response.data.success) {
        setQuestions([response.data.question, ...questions]);
        setNewQuestion({ content: '' });
        setShowAskForm(false);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      alert(error.response?.data?.message || 'Failed to post question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (questionId) => {
    if (!replyContent.trim()) {
      alert('Please enter a reply.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post(`/qna/questions/${questionId}/replies`, {
        content: replyContent.trim()
      });

      if (response.data.success) {
        const updatedQuestions = questions.map(q =>
          q._id === questionId ? response.data.question : q
        );
        setQuestions(updatedQuestions);
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error replying:', error);
      alert(error.response?.data?.message || 'Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await API.delete(`/qna/questions/${questionId}`);
      if (response.data.success) {
        setQuestions(questions.filter(q => q._id !== questionId));
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert(error.response?.data?.message || 'Failed to delete question.');
    }
  };

  const handleDeleteAnswer = async (questionId, answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      const response = await API.delete(`/qna/questions/${questionId}/answers/${answerId}`);
      if (response.data.success) {
        const updatedQuestions = questions.map(q =>
          q._id === questionId ? response.data.question : q
        );
        setQuestions(updatedQuestions);
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
      alert(error.response?.data?.message || 'Failed to delete answer.');
    }
  };

  const handleToggleResolved = async (questionId, currentStatus) => {
    try {
      const response = await API.put(`/qna/questions/${questionId}/resolved`, {
        isResolved: !currentStatus
      });
      if (response.data.success) {
        const updatedQuestions = questions.map(q =>
          q._id === questionId ? response.data.question : q
        );
        setQuestions(updatedQuestions);
      }
    } catch (error) {
      console.error('Error toggling resolved status:', error);
      alert(error.response?.data?.message || 'Failed to update status.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  if (!isEnrolled) {
    return (
      <div>
        <h4>Questions & Answers</h4>
        <p className="text-muted">Ask questions and get answers from instructors and fellow students.</p>
        <div className="card border-0 shadow-sm p-5 mt-3">
          <div className="text-center">
            <Lock size={48} className="text-muted mb-3" />
            <h5 className="mb-3">Q & A Section Locked</h5>
            <p className="text-muted mb-4">
              You need to enroll in this course to access the Q & A section and interact with instructors and fellow students.
            </p>
            <p className="text-muted small">
              Please enroll in the course to ask questions and participate in discussions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>Questions & Answers</h4>
          <p className="text-muted mb-0">Ask questions and get answers from instructors and fellow students.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAskForm(!showAskForm)}
        >
          <MessageSquare size={18} className="me-2" />
          Ask a Question
        </button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <div className="card border-0 shadow-sm p-4 mb-4">
          <h5 className="mb-3">Ask a Question</h5>
          <form onSubmit={handleAskQuestion}>
            <div className="mb-3">
              <label className="form-label">Question Details</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Enter your question..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ content: e.target.value })}
                required
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Question'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowAskForm(false);
                  setNewQuestion({ content: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading questions...</span>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 mt-3">
          <div className="text-center">
            <MessageSquare size={48} className="text-muted mb-3" />
            <h5 className="mb-3">No Questions Yet</h5>
            <p className="text-muted mb-0">Be the first to ask a question about this course!</p>
          </div>
        </div>
      ) : (
        <div>
          {questions.map((question) => (
            <div key={question._id} className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                {/* Question Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h5 className="mb-0">{question.title}</h5>
                      {question.isResolved && (
                        <span className="badge bg-success">
                          <CheckCircle size={14} className="me-1" />
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-muted mb-2">{question.content}</p>
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <div className="d-flex align-items-center gap-1">
                        <User size={14} />
                        <span>{question.authorName || question.author?.fullName}</span>
                        {question.authorRole === 'teacher' && (
                          <span className="badge bg-primary ms-1">Teacher</span>
                        )}
                      </div>
                      <span>•</span>
                      <span>{formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {currentUserId === question.author?._id?.toString() || currentUserId === question.author?.toString() ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteQuestion(question._id)}
                          title="Delete question"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleToggleResolved(question._id, question.isResolved)}
                          title={question.isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                        >
                          {question.isResolved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </>
                    ) : question.course?.teacher?.toString() === currentUserId && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleToggleResolved(question._id, question.isResolved)}
                        title={question.isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                      >
                        {question.isResolved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Answers Section */}
                {question.answers && question.answers.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <h6 className="mb-3">Replies ({question.answers.length})</h6>
                    {question.answers.map((answer) => (
                      <div key={answer._id} className="mb-3 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <p className="mb-2">{answer.content}</p>
                            <div className="d-flex align-items-center gap-3 text-muted small">
                              <div className="d-flex align-items-center gap-1">
                                <User size={14} />
                                <span>{answer.authorName || answer.author?.fullName}</span>
                                {answer.authorRole === 'teacher' && (
                                  <span className="badge bg-primary ms-1">Teacher</span>
                                )}
                              </div>
                              <span>•</span>
                              <span>{formatDate(answer.createdAt)}</span>
                            </div>
                          </div>
                          {currentUserId === answer.author?._id?.toString() || currentUserId === answer.author?.toString() ? (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteAnswer(question._id, answer._id)}
                              title="Delete answer"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === question._id ? (
                  <div className="mt-3 pt-3 border-top">
                    <div className="mb-2">
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleReply(question._id)}
                        disabled={submitting || !replyContent.trim()}
                      >
                        <Send size={14} className="me-1" />
                        {submitting ? 'Posting...' : 'Post Reply'}
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-top">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setReplyingTo(question._id)}
                    >
                      <MessageSquare size={14} className="me-1" />
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseQnA;
