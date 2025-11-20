import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { XCircle } from 'lucide-react';

const Container = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
`;

const CancelIcon = styled.div`
  color: #dc3545;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #dc3545;
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

const MerchOrderCancel = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <CancelIcon>
        <XCircle size={80} />
      </CancelIcon>
      <Title>Order Cancelled</Title>
      <Message>
        Your order was cancelled. No charges were made. You can continue shopping or return to your dashboard.
      </Message>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button onClick={() => navigate('/merch')}>Continue Shopping</Button>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </Container>
  );
};

export default MerchOrderCancel;

