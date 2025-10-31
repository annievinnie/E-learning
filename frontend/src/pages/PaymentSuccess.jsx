import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import API from '../api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get(`/payment/verify?session_id=${sessionId}`);
        if (response.data.success) {
          setSuccess(true);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        {loading ? (
          <div>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Verifying payment...</p>
          </div>
        ) : success ? (
          <>
            <CheckCircle size={64} className="text-success mb-3" />
            <h2 className="mb-3">Payment Successful!</h2>
            <p className="mb-4">Your enrollment has been confirmed. You now have access to the course.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/StudentDashboard')}
            >
              Go to My Courses
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-3">Payment Verification Failed</h2>
            <p className="mb-4">There was an issue verifying your payment. Please contact support if you were charged.</p>
            <button
              className="btn btn-primary"
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

