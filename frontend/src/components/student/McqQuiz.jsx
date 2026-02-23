import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const McqQuiz = ({ module, onClose }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length !== module.mcqQuestions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    let correctCount = 0;
    module.mcqQuestions.forEach((q, qIndex) => {
      const selectedOptionIndex = selectedAnswers[qIndex];
      if (selectedOptionIndex !== undefined && q.options[selectedOptionIndex]?.isCorrect) {
        correctCount++;
      }
    });

    setScore({
      correct: correctCount,
      total: module.mcqQuestions.length,
      percentage: Math.round((correctCount / module.mcqQuestions.length) * 100)
    });
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
              📝 {module.title}
            </h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              {module.description}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.5rem',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0f0f0';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {!submitted ? (
            <>
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={20} color="#2196f3" />
                  <strong style={{ color: '#1976d2' }}>Instructions</strong>
                </div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                  Answer all {module.mcqQuestions.length} questions. Select the correct answer for each question.
                </p>
              </div>

              {module.mcqQuestions.map((question, qIndex) => (
                <div key={qIndex} style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}>
                  <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>
                    Question {qIndex + 1}: {question.question}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {question.options.map((option, optIndex) => {
                      const isSelected = selectedAnswers[qIndex] === optIndex;
                      return (
                        <label
                          key={optIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem',
                            border: `2px solid ${isSelected ? '#2196f3' : '#ddd'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#e3f2fd' : 'white',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#2196f3';
                              e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#ddd';
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name={`question_${qIndex}`}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(qIndex, optIndex)}
                            style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                          />
                          <span style={{ flex: 1, color: '#333' }}>{option.text}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #ccc',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length !== module.mcqQuestions.length}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: Object.keys(selectedAnswers).length === module.mcqQuestions.length ? '#4caf50' : '#ccc',
                    color: 'white',
                    cursor: Object.keys(selectedAnswers).length === module.mcqQuestions.length ? 'pointer' : 'not-allowed',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                >
                  Submit Quiz
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
                padding: '2rem',
                backgroundColor: score.percentage >= 70 ? '#e8f5e9' : score.percentage >= 50 ? '#fff3e0' : '#ffebee',
                borderRadius: '8px',
                border: `3px solid ${score.percentage >= 70 ? '#4caf50' : score.percentage >= 50 ? '#ff9800' : '#f44336'}`
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>Quiz Results</h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: score.percentage >= 70 ? '#4caf50' : score.percentage >= 50 ? '#ff9800' : '#f44336', marginBottom: '0.5rem' }}>
                  {score.percentage}%
                </div>
                <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>
                  You got {score.correct} out of {score.total} questions correct
                </p>
              </div>

              {/* Question Review */}
              {module.mcqQuestions.map((question, qIndex) => {
                const selectedOptionIndex = selectedAnswers[qIndex];
                const selectedOption = question.options[selectedOptionIndex];
                const isCorrect = selectedOption?.isCorrect;

                return (
                  <div key={qIndex} style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
                    borderRadius: '8px',
                    backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      {isCorrect ? (
                        <CheckCircle size={24} color="#4caf50" />
                      ) : (
                        <XCircle size={24} color="#f44336" />
                      )}
                      <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
                        Question {qIndex + 1}: {question.question}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {question.options.map((option, optIndex) => {
                        const isSelected = selectedOptionIndex === optIndex;
                        const isCorrectOption = option.isCorrect;
                        let bgColor = 'white';
                        let borderColor = '#ddd';

                        if (isCorrectOption) {
                          bgColor = '#c8e6c9';
                          borderColor = '#4caf50';
                        } else if (isSelected && !isCorrectOption) {
                          bgColor = '#ffcdd2';
                          borderColor = '#f44336';
                        }

                        return (
                          <div
                            key={optIndex}
                            style={{
                              padding: '0.75rem',
                              border: `2px solid ${borderColor}`,
                              borderRadius: '6px',
                              backgroundColor: bgColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {isCorrectOption && <CheckCircle size={20} color="#4caf50" />}
                            {isSelected && !isCorrectOption && <XCircle size={20} color="#f44336" />}
                            <span style={{ flex: 1, color: '#333' }}>{option.text}</span>
                            {isCorrectOption && <span style={{ color: '#4caf50', fontWeight: '600' }}>✓ Correct</span>}
                            {isSelected && !isCorrectOption && <span style={{ color: '#f44336', fontWeight: '600' }}>Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#fff3cd',
                        borderRadius: '6px',
                        borderLeft: '4px solid #ffc107'
                      }}>
                        <strong style={{ color: '#856404' }}>Explanation: </strong>
                        <span style={{ color: '#856404' }}>{question.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #2196f3',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#2196f3',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Retake Quiz
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default McqQuiz;

