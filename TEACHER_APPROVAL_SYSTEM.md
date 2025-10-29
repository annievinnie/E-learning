# Teacher Application & Approval System Implementation

## Overview
This implementation adds a comprehensive teacher application and approval system to your e-learning platform. Teachers cannot register directly - they must submit an application first, which requires admin approval before they can complete registration and access the platform.

## Features Implemented

### Backend Changes

1. **User Model Updates** (`backend/models/User.js`)
   - Added `isApproved` field (default: true for students/admins, false for teachers)
   - Teachers start with `isApproved: false`

2. **New TeacherApplication Model** (`backend/models/TeacherApplication.js`)
   - Tracks teacher applications before registration
   - Stores teacher details, hashed password, and admin review information
   - Supports pending, approved, and rejected states
   - Links to actual User account after approval

3. **Enhanced User Controller** (`backend/controllers/userController.js`)
   - **Signup**: Creates application for teachers (no direct registration), sends admin notification
   - **Login**: Only allows login for approved teachers (students/admins login normally)
   - **Admin Functions**: 
     - `getPendingTeacherApplications()` - Get all pending applications
     - `approveTeacherApplication()` - Approve application and create user account
     - `rejectTeacherApplication()` - Reject application with reason

4. **New API Routes** (`backend/routes/userRoutes.js`)
   - `GET /api/admin/pending-teachers` - Get pending teacher applications
   - `POST /api/admin/approve-teacher/:applicationId` - Approve application and create user
   - `POST /api/admin/reject-teacher/:applicationId` - Reject application

### Frontend Changes

1. **Signup Page** (`frontend/src/pages/Signup.jsx`)
   - Shows special application message for teachers
   - Longer display time for application notification

2. **Admin Dashboard** (`frontend/src/pages/AdminDashboard.js`)
   - Displays pending teacher applications
   - Approve/Reject buttons for each application
   - Rejection modal with reason input
   - Real-time updates after actions

3. **Login Page** (`frontend/src/pages/Login.jsx`)
   - Shows application pending message for unapproved teachers
   - Prevents login for unapproved teachers

## How It Works

### Teacher Application Flow
1. Teacher fills out signup form and selects "Teacher" role
2. System creates TeacherApplication record (NOT a User account)
3. Admin receives email notification (if Courier configured)
4. Teacher sees application submitted message

### Admin Approval Flow
1. Admin logs into dashboard
2. Sees pending teacher applications in dedicated section
3. Can approve or reject each application
4. **Approve**: Creates actual User account, teacher can now login
5. **Reject**: Application marked as rejected, teacher receives email with reason

### Teacher Login Flow
1. Teacher attempts to login
2. System checks if User account exists (only exists if approved)
3. If no account: Shows "application pending" message
4. If account exists: Normal login flow continues

## Environment Variables Needed

Add these to your `.env` file:

```env
# Admin email for notifications
ADMIN_EMAIL=admin@yourdomain.com

# Courier Email Service (optional)
COURIER_AUTH_TOKEN=your-courier-auth-token
COURIER_TEACHER_APPROVAL_TEMPLATE_ID=teacher-approval-template-id
COURIER_TEACHER_APPROVED_TEMPLATE_ID=teacher-approved-template-id
COURIER_TEACHER_REJECTED_TEMPLATE_ID=teacher-rejected-template-id
```

## Email Templates (Courier)

If using Courier email service, create these templates:

1. **Teacher Approval Request** (to admin)
   - Subject: "New Teacher Approval Request"
   - Body: Include teacher name, email, and admin dashboard link

2. **Teacher Approved** (to teacher)
   - Subject: "Your Teacher Account Has Been Approved"
   - Body: Welcome message and login link

3. **Teacher Rejected** (to teacher)
   - Subject: "Teacher Account Request Update"
   - Body: Rejection message with reason and contact info

## Testing the System

1. **Apply as Teacher**:
   - Go to signup page
   - Select "Teacher" role
   - Complete application form
   - Should see application submitted message

2. **Admin Approval**:
   - Login as admin
   - Check dashboard for pending applications
   - Approve or reject applications

3. **Teacher Login**:
   - Try logging in as unapproved teacher
   - Should see application pending message
   - After approval, should login normally

## Security Features

- JWT token verification for admin routes
- Role-based access control
- Email notifications for transparency
- Audit trail with timestamps
- Rejection reasons for accountability

## Database Schema

### User Collection
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ["student", "teacher", "admin"]),
  isApproved: Boolean (default: true),
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### TeacherApplication Collection
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  status: String (enum: ["pending", "approved", "rejected"]),
  appliedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: User),
  rejectionReason: String,
  userId: ObjectId (ref: User), // Set after approval
  createdAt: Date,
  updatedAt: Date
}
```

The system is now fully functional and ready for use!
