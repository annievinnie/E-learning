import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>Welcome to E-Learning Platform</HeroTitle>
          <HeroSubtitle>
            Your comprehensive e-learning platform for students, teachers, and administrators.
            Access courses, manage assignments, and track progress all in one place.
          </HeroSubtitle>
          <ButtonGroup>
            <PrimaryButton onClick={handleGetStarted}>
              Get Started
            </PrimaryButton>
            <SecondaryButton onClick={handleSignUp}>
              Sign Up
            </SecondaryButton>
          </ButtonGroup>
        </HeroContent>
        <HeroImage>
          <div style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#666'
          }}>
            🎓 E-Learning Platform
          </div>
        </HeroImage>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionTitle>Why Choose E-Learning Platform?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>👨‍💼</FeatureIcon>
            <FeatureTitle>Admin Dashboard</FeatureTitle>
            <FeatureDescription>
              Comprehensive system management with user statistics, course oversight, and administrative controls.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>👨‍🏫</FeatureIcon>
            <FeatureTitle>Teacher Tools</FeatureTitle>
            <FeatureDescription>
              Create courses, manage students, grade assignments, and track student progress with powerful teaching tools.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>👨‍🎓</FeatureIcon>
            <FeatureTitle>Student Experience</FeatureTitle>
            <FeatureDescription>
              Access courses, submit assignments, view grades, and download materials in an intuitive interface.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* Stats Section */}
      <StatsSection>
        <StatItem>
          <StatNumber>1000+</StatNumber>
          <StatLabel>Active Students</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>50+</StatNumber>
          <StatLabel>Expert Teachers</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>100+</StatNumber>
          <StatLabel>Courses Available</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>95%</StatNumber>
          <StatLabel>Success Rate</StatLabel>
        </StatItem>
      </StatsSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <CTATitle>Ready to Start Learning?</CTATitle>
          <CTADescription>
            Join thousands of students and teachers who are already using E-Learning Platform to enhance their learning experience.
          </CTADescription>
          <CTAButton onClick={handleGetStarted}>
            Start Learning Today
          </CTAButton>
        </CTAContent>
      </CTASection>

      {/* Footer */}
      <Footer>
        <FooterContent>
          <FooterTitle>E-Learning</FooterTitle>
          <FooterDescription>
            Empowering education through technology. Making learning accessible, engaging, and effective for everyone.
          </FooterDescription>
          <FooterLinks>
            <FooterLink href="#about">About</FooterLink>
            <FooterLink href="#contact">Contact</FooterLink>
            <FooterLink href="#privacy">Privacy</FooterLink>
            <FooterLink href="#terms">Terms</FooterLink>
          </FooterLinks>
        </FooterContent>
        <FooterBottom>
          <p>&copy; 2025 E-Learning. All rights reserved.</p>
        </FooterBottom>
      </Footer>
    </HomeContainer>
  );
};

export default HomePage;

// Styled Components
const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  color: white;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff5252;
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: white;
  border: 2px solid white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    color: #667eea;
    transform: translateY(-2px);
  }
`;

const HeroImage = styled.div`
  flex: 1;
`;

const FeaturesSection = styled.section`
  padding: 4rem 2rem;
  background: white;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const StatsSection = styled.section`
  display: flex;
  justify-content: space-around;
  padding: 3rem 2rem;
  background: #f8f9fa;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  text-align: center;
  margin: 1rem;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  color: #666;
`;

const CTASection = styled.section`
  padding: 4rem 2rem;
  background: #333;
  color: white;
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff5252;
    transform: translateY(-2px);
  }
`;

const Footer = styled.footer`
  background: #222;
  color: white;
  padding: 3rem 2rem 1rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const FooterTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const FooterDescription = styled.p`
  margin-bottom: 2rem;
  opacity: 0.8;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FooterLink = styled.a`
  color: white;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #444;
  padding-top: 1rem;
  opacity: 0.6;
`;
