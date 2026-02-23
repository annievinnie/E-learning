import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, XCircle, BookOpen, User } from 'lucide-react';
import API from '../../api';
import styled from 'styled-components';

const PageTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
`;

const PageSubtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-weight: 400;
`;

const QuestionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CourseBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  flex: 1;
`;

const QuestionContent = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const AnswersSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f0f0;
`;

const AnswerCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid #667eea;
`;

const ReplyForm = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : props.variant === 'success'
    ? 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)'
    : '#6c757d'};
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #888;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
`;

const TeacherQnA = () => {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await API.get('/qna/teacher/questions');
      if (response.data.success) {
        setQuestions(response.data.questions || []);
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      setCourses([]);
    } finally {
      setLoading(false);
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
        alert('Reply posted successfully!');
      }
    } catch (error) {
      console.error('Error replying:', error);
      alert(error.response?.data?.message || 'Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
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

  const filteredQuestions = selectedCourse === 'all' 
    ? questions 
    : questions.filter(q => q.course?._id === selectedCourse);

  const unansweredQuestions = filteredQuestions.filter(q => 
    !q.isResolved && (!q.answers || q.answers.length === 0)
  );
  const answeredQuestions = filteredQuestions.filter(q => 
    q.isResolved || (q.answers && q.answers.length > 0)
  );

  if (loading) {
    return (
      <LoadingSpinner>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading questions...</span>
        </div>
      </LoadingSpinner>
    );
  }

  return (
    <div>
      <PageTitle>Student Questions & Answers</PageTitle>
      <PageSubtitle>View and answer questions from your students</PageSubtitle>

      {/* Course Filter */}
      {courses.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ marginRight: '1rem', fontWeight: 600, color: '#333' }}>
            Filter by Course:
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Unanswered Questions */}
      {unansweredQuestions.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={24} />
            Unanswered Questions ({unansweredQuestions.length})
          </h3>
          {unansweredQuestions.map((question) => (
            <QuestionCard key={question._id}>
              <CourseBadge>
                <BookOpen size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                {question.course?.title || 'Unknown Course'}
              </CourseBadge>
              
              <QuestionHeader>
                <div style={{ flex: 1 }}>
                  <QuestionTitle>{question.title}</QuestionTitle>
                  <QuestionContent>{question.content}</QuestionContent>
                </div>
                <Button
                  variant="success"
                  onClick={() => handleToggleResolved(question._id, question.isResolved)}
                  title={question.isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                >
                  {question.isResolved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                </Button>
              </QuestionHeader>

              <MetaInfo>
                <span>
                  <User size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  {question.authorName || question.author?.fullName}
                </span>
                <span>•</span>
                <span>{formatDate(question.createdAt)}</span>
              </MetaInfo>

              {replyingTo === question._id ? (
                <ReplyForm>
                  <TextArea
                    placeholder="Write your answer..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="primary"
                      onClick={() => handleReply(question._id)}
                      disabled={submitting || !replyContent.trim()}
                    >
                      <Send size={16} />
                      {submitting ? 'Posting...' : 'Post Answer'}
                    </Button>
                    <SecondaryButton onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}>
                      Cancel
                    </SecondaryButton>
                  </div>
                </ReplyForm>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setReplyingTo(question._id)}
                >
                  <MessageSquare size={16} />
                  Reply to Question
                </Button>
              )}

              {question.answers && question.answers.length > 0 && (
                <AnswersSection>
                  <h5 style={{ marginBottom: '1rem', color: '#333' }}>
                    Replies ({question.answers.length})
                  </h5>
                  {question.answers.map((answer) => (
                    <AnswerCard key={answer._id}>
                      <p style={{ marginBottom: '0.5rem', color: '#333' }}>{answer.content}</p>
                      <MetaInfo style={{ marginBottom: 0 }}>
                        <span>
                          <User size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                          {answer.authorName || answer.author?.fullName}
                          {answer.authorRole === 'teacher' && (
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              background: '#667eea', 
                              color: 'white', 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}>
                              Teacher
                            </span>
                          )}
                        </span>
                        <span>•</span>
                        <span>{formatDate(answer.createdAt)}</span>
                      </MetaInfo>
                    </AnswerCard>
                  ))}
                </AnswersSection>
              )}
            </QuestionCard>
          ))}
        </div>
      )}

      {/* Answered Questions */}
      {answeredQuestions.length > 0 && (
        <div>
          <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={24} />
            Answered Questions ({answeredQuestions.length})
          </h3>
          {answeredQuestions.map((question) => (
            <QuestionCard key={question._id}>
              <CourseBadge>
                <BookOpen size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                {question.course?.title || 'Unknown Course'}
              </CourseBadge>
              
              <QuestionHeader>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <QuestionTitle>{question.title}</QuestionTitle>
                    {question.isResolved && (
                      <span style={{ 
                        background: '#2e7d32', 
                        color: 'white', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        <CheckCircle size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                        Resolved
                      </span>
                    )}
                  </div>
                  <QuestionContent>{question.content}</QuestionContent>
                </div>
                <Button
                  variant="success"
                  onClick={() => handleToggleResolved(question._id, question.isResolved)}
                  title={question.isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                >
                  {question.isResolved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                </Button>
              </QuestionHeader>

              <MetaInfo>
                <span>
                  <User size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  {question.authorName || question.author?.fullName}
                </span>
                <span>•</span>
                <span>{formatDate(question.createdAt)}</span>
              </MetaInfo>

              {question.answers && question.answers.length > 0 && (
                <AnswersSection>
                  <h5 style={{ marginBottom: '1rem', color: '#333' }}>
                    Replies ({question.answers.length})
                  </h5>
                  {question.answers.map((answer) => (
                    <AnswerCard key={answer._id}>
                      <p style={{ marginBottom: '0.5rem', color: '#333' }}>{answer.content}</p>
                      <MetaInfo style={{ marginBottom: 0 }}>
                        <span>
                          <User size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                          {answer.authorName || answer.author?.fullName}
                          {answer.authorRole === 'teacher' && (
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              background: '#667eea', 
                              color: 'white', 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}>
                              Teacher
                            </span>
                          )}
                        </span>
                        <span>•</span>
                        <span>{formatDate(answer.createdAt)}</span>
                      </MetaInfo>
                    </AnswerCard>
                  ))}
                </AnswersSection>
              )}

              {replyingTo === question._id ? (
                <ReplyForm>
                  <TextArea
                    placeholder="Write your answer..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="primary"
                      onClick={() => handleReply(question._id)}
                      disabled={submitting || !replyContent.trim()}
                    >
                      <Send size={16} />
                      {submitting ? 'Posting...' : 'Post Answer'}
                    </Button>
                    <SecondaryButton onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}>
                      Cancel
                    </SecondaryButton>
                  </div>
                </ReplyForm>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    variant="primary"
                    onClick={() => setReplyingTo(question._id)}
                  >
                    <MessageSquare size={16} />
                    Add Reply
                  </Button>
                </div>
              )}
            </QuestionCard>
          ))}
        </div>
      )}

      {filteredQuestions.length === 0 && (
        <EmptyState>
          <MessageSquare size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h4>No Questions Yet</h4>
          <p>Students haven't asked any questions in your courses yet.</p>
        </EmptyState>
      )}
    </div>
  );
};

export default TeacherQnA;

