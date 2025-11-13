import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setVerifying(false);
        return;
      }

      try {
        const response = await API.get(`/payment/verify?session_id=${sessionId}`);
        if (response.data.success) {
          setSuccess(true);
          // Redirect to My Courses after 2 seconds
          setTimeout(() => {
            navigate('/my-courses');
          }, 2000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        {verifying ? (
          <>
            <div className="spinner-border text-primary mb-4" role="status" style={{ width: '64px', height: '64px' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2>Verifying Payment...</h2>
            <p className="text-muted">Please wait while we confirm your payment.</p>
          </>
        ) : success ? (
          <>
            <CheckCircle size={64} className="text-success mb-3" />
            <h2 className="mb-3">Payment Successful!</h2>
            <p className="mb-4">Your enrollment has been confirmed. You now have access to the course.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/my-courses')}
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <div className="text-danger mb-4" style={{ fontSize: '64px' }}>✗</div>
            <h2 className="text-danger">Payment Verification Failed</h2>
            <p className="text-muted">{error || 'There was an issue verifying your payment.'}</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/StudentDashboard')}
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
