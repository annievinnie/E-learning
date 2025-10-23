# E-Learning Platform

A full-stack e-learning platform with user authentication and role-based dashboards.

## Features

- **User Authentication**: Secure login with JWT tokens
- **Role-based Access**: Separate dashboards for Admin, Teacher, and Student
- **Modern UI**: Clean and responsive design
- **Real-time Updates**: Live data updates in dashboards

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGO_URI=mongodb://localhost:27017/elearning
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

4. Make sure MongoDB is running on your system

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

## Usage

1. **Homepage**: Visit `http://localhost:3000` to see the homepage
2. **Choose User Type**: Click "Login" to select your user type (Admin, Teacher, Student)
3. **Login**: Use the login form with your credentials
4. **Dashboard**: After successful login, you'll be redirected to your role-specific dashboard

## User Roles

### Admin Dashboard
- View system statistics (total students, teachers, courses)
- Manage students, teachers, and courses
- System settings and reports
- Recent activity monitoring

### Teacher Dashboard
- View enrolled students and courses
- Create and manage courses
- Grade assignments
- Track student progress

### Student Dashboard
- View enrolled courses
- Submit assignments
- Check grades and progress
- Download course materials

## API Endpoints

- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (requires authentication)

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React
- React Router for navigation
- Axios for API calls
- Material-UI for components

## Testing

To test the login functionality:

1. Start both backend and frontend servers
2. Navigate to the homepage
3. Click "Login" and select a user type
4. Use the following test credentials:
   - Email: `admin@test.com`
   - Password: `password123`
   - Role: `admin` (or `teacher`, `student`)

Make sure to create test users through the signup endpoint first.
