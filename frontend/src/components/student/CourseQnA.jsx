import React from 'react';
import { MessageSquare, Lock } from 'lucide-react';

const CourseQnA = ({ course, isEnrolled }) => {
  return (
    <div>
      <h4>Questions & Answers</h4>
      <p className="text-muted">Ask questions and get answers from instructors and fellow students.</p>
      
      {!isEnrolled ? (
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
      ) : (
        <div className="card border-0 shadow-sm p-4 mt-3">
          <div className="text-center">
            <MessageSquare size={48} className="text-muted mb-3" />
            <p className="text-muted mb-0">Q & A section will be displayed here.</p>
            <p className="text-muted small mt-2">This feature is coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseQnA;

