# Forgot Password Feature Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/e-learning

# Server Configuration
PORT=5000

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

# TryCourier Configuration
COURIER_AUTH_TOKEN=your_courier_auth_token_here
COURIER_RESET_PASSWORD_TEMPLATE_ID=your_template_id_here

# JWT Secret (if you plan to use JWT)
JWT_SECRET=your_jwt_secret_here
```

### 3. TryCourier Setup
1. Sign up for TryCourier at https://trycourier.com
2. Get your Auth Token from the dashboard
3. Create a password reset email template with the following variables:
   - `userName`: The user's full name
   - `resetUrl`: The password reset link
4. Copy the template ID and add it to your `.env` file

### 4. Start the Backend Server
```bash
npm run dev
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Frontend Server
```bash
npm start
```

## API Endpoints

### Forgot Password
- **POST** `/api/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "message": "If an account with that email exists, we've sent a password reset link." }`

### Reset Password
- **POST** `/api/reset-password`
- **Body**: `{ "token": "reset_token", "password": "new_password" }`
- **Response**: `{ "message": "Password has been reset successfully." }`

## Features Implemented

1. **Backend**:
   - Added TryCourier integration for email sending
   - Created forgot password endpoint that generates secure reset tokens
   - Created reset password endpoint that validates tokens and updates passwords
   - Added password reset fields to User model
   - Token expires after 10 minutes for security

2. **Frontend**:
   - Updated ForgetPassword page to integrate with backend API
   - Created ResetPassword page for handling password reset
   - Added proper routing for both pages
   - Updated Login page with "Forgot Password" link
   - Added form validation and error handling

## Security Features

- Reset tokens are cryptographically secure (32 random bytes)
- Tokens expire after 10 minutes
- Email existence is not revealed to prevent user enumeration
- Passwords are properly hashed using bcrypt
- Input validation on both frontend and backend

## Usage Flow

1. User clicks "Forgot Password" on login page
2. User enters email address
3. System sends reset email via TryCourier
4. User clicks link in email
5. User enters new password
6. Password is updated and user is redirected to login
