import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test token - replace with actual token after login
let studentToken = '';
let teacherToken = '';
let courseId = '';

// Helper function to make API requests
const apiRequest = async (endpoint, method = 'GET', body = null, token = '') => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { status: response.status, data };
  } catch (error) {
    console.error('Error:', error.message);
    return { status: 500, error: error.message };
  }
};

// Test functions
const runTests = async () => {
  console.log('🧪 Starting Student Endpoints Tests...\n');
  console.log('='.repeat(50));

  // 1. Sign up as student
  console.log('\n1. Signing up as student...');
  const signupResponse = await apiRequest('/signup', 'POST', {
    fullName: 'Test Student',
    email: `teststudent${Date.now()}@example.com`,
    password: 'password123',
    role: 'student'
  });

  if (signupResponse.data.token) {
    studentToken = signupResponse.data.token;
    console.log('✅ Student signed up successfully');
  }

  // 2. Login as student
  console.log('\n2. Logging in as student...');
  const loginResponse = await apiRequest('/login', 'POST', {
    email: 'student@example.com', // Update with actual test email
    password: 'password123'
  });

  if (loginResponse.data.token) {
    studentToken = loginResponse.data.token;
    console.log('✅ Student logged in successfully');
  }

  // 3. Get all courses (browse)
  console.log('\n3. Getting all available courses...');
  await apiRequest('/student/courses', 'GET', null, studentToken);

  // 4. Get course details
  console.log('\n4. Getting course details...');
  const courseDetailsResponse = await apiRequest(
    `/student/courses/${courseId || 'YOUR_COURSE_ID_HERE'}`,
    'GET',
    null,
    studentToken
  );

  // 5. Get enrolled courses
  console.log('\n5. Getting enrolled courses...');
  await apiRequest('/student/enrolled', 'GET', null, studentToken);

  // 6. Enroll in free course
  console.log('\n6. Attempting to enroll in course...');
  await apiRequest(
    `/student/courses/${courseId || 'YOUR_COURSE_ID_HERE'}/enroll`,
    'POST',
    null,
    studentToken
  );

  // 7. Create checkout session (for paid course)
  console.log('\n7. Creating Stripe checkout session...');
  const checkoutResponse = await apiRequest(
    `/payment/checkout/${courseId || 'YOUR_COURSE_ID_HERE'}`,
    'POST',
    null,
    studentToken
  );

  if (checkoutResponse.data.url) {
    console.log('✅ Checkout URL:', checkoutResponse.data.url);
  }

  // 8. Get payment history
  console.log('\n8. Getting payment history...');
  await apiRequest('/payment/history', 'GET', null, studentToken);

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('\nNote: Replace YOUR_COURSE_ID_HERE with actual course ID from database');
  console.log('Note: Node.js 18+ has native fetch. For older versions, install: npm install node-fetch');
};

// Run tests
runTests().catch(console.error);

