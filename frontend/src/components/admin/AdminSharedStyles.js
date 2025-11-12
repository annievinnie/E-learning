import styled from 'styled-components';

export const PageTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
`;

export const PageSubtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-weight: 400;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color1 || '#667eea'} 0%, ${props => props.color2 || '#764ba2'} 100%);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  &:hover { 
    transform: translateY(-5px); 
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); 
  }
  &::before { 
    content: ''; 
    position: absolute; 
    top: -50%; 
    right: -50%; 
    width: 200%; 
    height: 200%; 
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); 
    transition: all 0.5s ease; 
  }
  &:hover::before { 
    top: -30%; 
    right: -30%; 
  }
`;

export const StatTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
`;

export const SectionCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid;
  border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
`;

export const Button = styled.button`
  background: ${props => props.variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    props.variant === 'success' ? 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' :
    props.variant === 'danger' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
    props.variant === 'warning' ? 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' :
    '#f0f0f0'};
  color: ${props => props.variant === 'secondary' ? '#333' : 'white'};
  border: none;
  padding: ${props => props.size === 'small' ? '0.5rem 1rem' : props.size === 'large' ? '1rem 2rem' : '0.75rem 1.5rem'};
  border-radius: 10px;
  cursor: pointer;
  font-size: ${props => props.size === 'small' ? '0.9rem' : props.size === 'large' ? '1.1rem' : '1rem'};
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ApplicationCard = styled.div`
  background: ${props => props.status === 'pending' ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' :
    props.status === 'rejected' ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' :
    'white'};
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${props => props.status === 'pending' ? '#ff9800' : props.status === 'rejected' ? '#f44336' : '#e0e0e0'};
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

export const ErrorText = styled.span`
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;
  font-style: italic;
`;

export const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const FilterSelect = styled.select`
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  font-size: 1rem;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

