import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import API from '../api';
import { CheckCircle } from 'lucide-react';

const Container = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: #28a745;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #28a745;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const MerchOrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyOrder(sessionId);
    }
  }, [searchParams]);

  const verifyOrder = async (sessionId) => {
    try {
      const response = await API.get(`/merchandise/orders/verify?session_id=${sessionId}`);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error verifying order:', error);
    }
  };

  return (
    <Container>
      <SuccessIcon>
        <CheckCircle size={80} />
      </SuccessIcon>
      <Title>Order Successful!</Title>
      <Message>
        Thank you for your purchase! Your order has been confirmed and will be processed shortly.
        {order && (
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#999' }}>
            Order Total: ${order.totalAmount.toFixed(2)}
          </div>
        )}
      </Message>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button onClick={() => navigate('/merch')}>Continue Shopping</Button>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </Container>
  );
};

export default MerchOrderSuccess;

