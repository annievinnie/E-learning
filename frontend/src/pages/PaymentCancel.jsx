import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        <XCircle size={64} className="text-danger mb-3" />
        <h2 className="mb-3">Payment Cancelled</h2>
        <p className="mb-4">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/StudentDashboard')}
          >
            Back to Dashboard
          </button>
          {courseId && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/course/${courseId}`)}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

