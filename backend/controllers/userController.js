import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import User from "../models/User.js";
import TeacherApplication from "../models/TeacherApplication.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Merchandise from "../models/Merchandise.js";
import getCourierClient from "../config/courier.js";

// -------------------- SIGNUP --------------------
export const signupUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Normalize role to lowercase to match enum values
    const normalizedRole = role ? role.toLowerCase() : "student";

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Check for any teacher application with this email
    const existingApplication = await TeacherApplication.findOne({ email });
    
    if (existingApplication) {
      const appStatus = existingApplication.status || 'pending'; // Default to pending if status is missing
      
      // Check if there's actually a User account (application might be approved but user deleted)
      const actualUser = await User.findOne({ email, role: 'teacher' });
      
      // If role is teacher, block if pending or if approved AND user exists
      if (normalizedRole === "teacher") {
        if (appStatus === 'pending') {
          return res.status(400).json({ message: "Email already has a pending application." });
        } else if (appStatus === 'approved' && actualUser) {
          return res.status(400).json({ message: "This email already has an approved teacher application. Please log in instead." });
        }
        // If approved but no user exists (orphaned application), allow them to apply again
        // If rejected, allow them to apply again (will create a new application)
      } else {
        // For students/admins, only block if there's an actual teacher User account
        // Don't block based on application status alone - check if user actually exists
        if (actualUser && actualUser.role === 'teacher') {
          return res.status(400).json({ 
            message: "This email is already registered as a teacher. Please log in instead." 
          });
        }
        // If no actual user exists, allow signup even if application is approved/rejected/pending
        // This handles cases where applications exist but users were deleted
      }
    }

    // If role is teacher, create an application instead of direct registration
    if (normalizedRole === "teacher") {
      const hashedPassword = await bcrypt.hash(password, 10);

      const teacherApplication = new TeacherApplication({
        fullName,
        email,
        password: hashedPassword,
        status: "pending"
      });

      await teacherApplication.save();
      console.log(`\n✅ Teacher application saved successfully:`);
      console.log(`   Database: ${teacherApplication.db.databaseName}`);
      console.log(`   Collection: ${teacherApplication.collection.name}`);
      console.log(`   Application ID: ${teacherApplication._id}`);
      console.log(`   Email: ${teacherApplication.email}\n`);

      // Send notification email to admin (if configured)
      try {
        if (process.env.COURIER_AUTH_TOKEN) {
          const courier = getCourierClient();
          await courier.send({
            message: {
              to: {
                email: process.env.ADMIN_EMAIL || "admin@example.com",
              },
              template: process.env.COURIER_TEACHER_APPROVAL_TEMPLATE_ID || "teacher-approval-template",
              data: {
                teacherName: fullName,
                teacherEmail: email,
                adminUrl: `${process.env.FRONTEND_URL}/admin-dashboard`,
              },
            },
          });
        }
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
        // Don't fail the application if email fails
      }

      return res.status(201).json({ 
        message: "Teacher application submitted successfully! Your application is pending admin approval. You will receive an email once approved.",
        isApplication: true
      });
    }

    // For students and admins, proceed with normal registration
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: normalizedRole,
      isApproved: true, // Students and admins are approved by default
    });

    await newUser.save();
    console.log(`\n✅ User saved successfully to database:`);
    console.log(`   Database: ${newUser.db.databaseName}`);
    console.log(`   Collection: ${newUser.collection.name}`);
    console.log(`   User ID: ${newUser._id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}\n`);
    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if teacher is approved
    if (user.role === "teacher" && !user.isApproved) {
      return res.status(403).json({ 
        message: "Your teacher account is pending admin approval. Please wait for approval before logging in.",
        requiresApproval: true
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      if (!process.env.COURIER_AUTH_TOKEN) {
        console.log(`⚠️ Courier not configured. Password reset link for ${user.email}: ${resetUrl}`);
        res.status(200).json({
          message:
            "Password reset link generated. Check server logs for the link (Courier not configured).",
        });
        return;
      }

      const courier = getCourierClient();
      
      const emailData = {
        name: user.fullName,
        email: user.email,
        resetUrl: resetUrl,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      };
      
      console.log(`📧 Sending password reset email to ${user.email}`);
      console.log(`📧 Email data:`, JSON.stringify({ ...emailData, resetUrl: resetUrl.substring(0, 50) + '...' }, null, 2));
      
      // Use template-based sending (like teacher approval)
      const templateId = process.env.COURIER_RESET_PASSWORD_TEMPLATE_ID || process.env.COURIER_RESET_PASSWORD_EVENT_ID;
      
      if (!templateId) {
        throw new Error('COURIER_RESET_PASSWORD_TEMPLATE_ID must be set in .env');
      }
      
      console.log(`📧 Using template: ${templateId}`);
      console.log(`📧 Sending to: ${user.email}`);
      
      const result = await courier.send({
        message: {
          to: {
            email: user.email,
          },
          template: templateId,
          data: emailData,
        },
      });
      
      console.log(`✅ Password reset email sent to ${user.email}`);
      console.log(`📧 Courier response:`, JSON.stringify(result, null, 2));

      res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError);
      console.error("Full error details:", JSON.stringify(emailError, null, 2));
      
      // Don't clear the token on email error - let them try again
      // user.resetPasswordToken = undefined;
      // user.resetPasswordExpires = undefined;
      // await user.save();

      res.status(500).json({ 
        success: false,
        message: "Failed to send reset email. Please try again later.",
        ...(process.env.NODE_ENV === 'development' && { error: emailError.message })
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// -------------------- RESET PASSWORD --------------------
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token
    
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ 
      message: "Profile retrieved successfully.",
      user: user.toObject()
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      phone,
      age,
      bio,
      address,
      city,
      state,
      country,
      zipCode,
      profilePicture,
      teachingExperience,
      coursesKnown,
      confidenceLevel,
      qualifications,
      interests,
      department
    } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    // Update allowed fields
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (age !== undefined) user.age = age;
    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (zipCode !== undefined) user.zipCode = zipCode;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    // Role-specific fields
    if (user.role === 'teacher') {
      if (teachingExperience !== undefined) user.teachingExperience = teachingExperience;
      if (coursesKnown !== undefined && Array.isArray(coursesKnown)) user.coursesKnown = coursesKnown;
      if (confidenceLevel !== undefined) user.confidenceLevel = confidenceLevel;
      if (qualifications !== undefined) user.qualifications = qualifications;
    }
    
    if (user.role === 'student') {
      if (interests !== undefined && Array.isArray(interests)) user.interests = interests;
    }
    
    if (user.role === 'admin') {
      if (department !== undefined) user.department = department;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

    res.status(200).json({ 
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser.toObject()
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No file uploaded." 
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      // Delete the uploaded file if user not found
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    // Delete old profile picture if it exists and is a local file
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const oldFilePath = path.join(__dirname, '..', user.profilePicture);
      
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error('Error deleting old profile picture:', err);
        }
      }
    }

    // Save the file path relative to the backend root
    const filePath = `/uploads/profile-pictures/${req.file.filename}`;
    user.profilePicture = filePath;
    await user.save();

    const updatedUser = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

    res.status(200).json({ 
      success: true,
      message: "Profile picture uploaded successfully.",
      user: updatedUser.toObject(),
      profilePicture: filePath
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    
    // Delete the uploaded file if there was an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting uploaded file:', err);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Submit detailed teacher application (Public route)
export const submitTeacherApplication = async (req, res) => {
  try {
    const { fullName, age, email, phone, teachingExperience, coursesKnown, confidenceLevel } = req.body;

    console.log('Received application data:', { fullName, age, email, phone, teachingExperience, coursesKnown, confidenceLevel });

    // Validation with detailed error messages
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Full name is required." 
      });
    }
    if (!age || age === '' || isNaN(age) || parseInt(age) <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Valid age is required." 
      });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Email is required." 
      });
    }
    if (!phone || phone.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Phone number is required." 
      });
    }
    if (!teachingExperience || teachingExperience.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Teaching experience is required." 
      });
    }
    if (!Array.isArray(coursesKnown) || coursesKnown.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide at least one course." 
      });
    }
    if (!confidenceLevel || confidenceLevel.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Confidence level is required." 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered." 
      });
    }

    // Check if email already has a pending application
    const existingApplication = await TeacherApplication.findOne({ email, status: 'pending' });
    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: "You already have a pending application." 
      });
    }

    // Create teacher application
    const teacherApplication = new TeacherApplication({
      fullName: fullName.trim(),
      age: parseInt(age),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      teachingExperience: teachingExperience.trim(),
      coursesKnown: coursesKnown.map(c => c.trim()).filter(c => c.length > 0),
      confidenceLevel: confidenceLevel.trim(),
      status: "pending"
    });

    await teacherApplication.save();
    console.log('Teacher application saved successfully:', teacherApplication._id);

    res.status(201).json({ 
      success: true,
      message: "Application submitted successfully! Admin will contact you shortly."
    });
  } catch (error) {
    console.error("=== SUBMIT TEACHER APPLICATION ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error code:", error.code);
    console.error("Full error object:", error);
    console.error("=========================================");
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Email already has an application." 
      });
    }
    
    // More detailed error message
    const errorMessage = error.message || "Server error. Please try again later.";
    res.status(500).json({ 
      success: false,
      message: errorMessage
    });
  }
};

// Get all pending teacher applications (Admin only)
export const getPendingTeacherApplications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const pendingApplications = await TeacherApplication.find({ status: "pending" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Pending teacher applications retrieved successfully.",
      applications: pendingApplications
    });
  } catch (error) {
    console.error("Get pending applications error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Approve a teacher application (Admin only)
export const approveTeacherApplication = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin role required." 
      });
    }

    const { applicationId } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password || password.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "Password is required. Please set a password for the teacher." 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long." 
      });
    }

    const application = await TeacherApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: "Application not found." 
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ 
        success: false,
        message: "Application has already been processed." 
      });
    }

    // Hash the password provided by admin
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the actual user account
    const newUser = new User({
      fullName: application.fullName,
      email: application.email,
      password: hashedPassword,
      role: "teacher",
      isApproved: true,
    });

    await newUser.save();

    // Update application status and link to user
    application.status = "approved";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.userId;
    application.userId = newUser._id;
    await application.save();

    // Send approval email to teacher with password
    try {
      if (process.env.COURIER_AUTH_TOKEN) {
        try {
          const courier = getCourierClient();
          
          const emailData = {
            name: application.fullName,
            email: application.email,
            password: password,
            loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
          };
          
          console.log(`📧 Sending email with data:`, JSON.stringify(emailData, null, 2));
          
          const result = await courier.send({
            message: {
              to: {
                email: application.email,
              },
              template: process.env.COURIER_TEACHER_APPROVED_TEMPLATE_ID,
              data: emailData,
            },
          });
          
          console.log(`✅ Approval email sent to ${application.email}`);
          console.log(`📧 Courier response:`, JSON.stringify(result, null, 2));
        } catch (courierError) {
          console.error("❌ Courier API error:", courierError.message || courierError);
          console.error("Full error details:", JSON.stringify(courierError, null, 2));
        }
      } else {
        console.log("⚠️ Courier not configured. Email not sent.");
      }
    } catch (emailError) {
      console.error("❌ Failed to send approval email:", emailError.message || emailError);
      // Don't fail the approval if email fails, but log it
    }

    res.status(200).json({
      success: true,
      message: "Teacher application approved successfully! Password has been set and email sent to teacher.",
      teacher: {
        id: newUser._id,
        name: application.fullName,
        email: application.email
      }
    });
  } catch (error) {
    console.error("Approve teacher application error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Reject a teacher application (Admin only)
export const rejectTeacherApplication = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { applicationId } = req.params;
    const { rejectionReason } = req.body;

    const application = await TeacherApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ message: "Application has already been processed." });
    }

    // Update application status
    application.status = "rejected";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.userId;
    application.rejectionReason = rejectionReason || "No reason provided";
    await application.save();

    // Send rejection email to teacher
    try {
      if (process.env.COURIER_AUTH_TOKEN) {
        const courier = getCourierClient();
        await courier.send({
          message: {
            to: {
              email: application.email,
            },
            template: process.env.COURIER_TEACHER_REJECTED_TEMPLATE_ID || "teacher-rejected-template",
            data: {
              name: application.fullName,
              rejectionReason: application.rejectionReason,
              contactEmail: process.env.ADMIN_EMAIL || "admin@example.com",
            },
          },
        });
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Don't fail the rejection if email fails
    }

    res.status(200).json({
      message: "Teacher application rejected.",
      teacher: {
        name: application.fullName,
        email: application.email,
        rejectionReason: application.rejectionReason
      }
    });
  } catch (error) {
    console.error("Reject teacher application error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get rejected teacher applications (Admin only)
export const getRejectedTeacherApplications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const rejectedApplications = await TeacherApplication.find({ status: "rejected" })
      .sort({ reviewedAt: -1 });

    res.status(200).json({
      message: "Rejected teacher applications retrieved successfully.",
      applications: rejectedApplications
    });
  } catch (error) {
    console.error("Get rejected applications error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get all teachers (Admin only)
export const getAllTeachers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const teachers = await User.find({ role: "teacher" })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Teachers retrieved successfully.",
      teachers
    });
  } catch (error) {
    console.error("Get all teachers error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Create a teacher directly (Admin only)
export const createTeacher = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create teacher account
    const newTeacher = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "teacher",
      isApproved: true, // Admin-created teachers are automatically approved
    });

    await newTeacher.save();

    // Send welcome email to teacher with password
    try {
      if (process.env.COURIER_AUTH_TOKEN) {
        try {
          const courier = getCourierClient();
          
          const emailData = {
            name: fullName,
            email: email,
            password: password,
            loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
          };
          
          console.log(`📧 Sending email with data:`, JSON.stringify(emailData, null, 2));
          
          const result = await courier.send({
            message: {
              to: {
                email: email,
              },
              template: process.env.COURIER_TEACHER_APPROVED_TEMPLATE_ID,
              data: emailData,
            },
          });
          
          console.log(`✅ Welcome email sent to ${email}`);
          console.log(`📧 Courier response:`, JSON.stringify(result, null, 2));
        } catch (courierError) {
          console.error("❌ Courier API error:", courierError.message || courierError);
          console.error("Full error:", courierError);
        }
      } else {
        console.log("⚠️ Courier not configured. COURIER_AUTH_TOKEN not found in environment variables.");
      }
    } catch (emailError) {
      console.error("❌ Failed to send welcome email:", emailError.message || emailError);
      // Don't fail the teacher creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Teacher created successfully! Password has been set and email sent to teacher.",
      teacher: {
        id: newTeacher._id,
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        role: newTeacher.role,
        isApproved: newTeacher.isApproved
      }
    });
  } catch (error) {
    console.error("Create teacher error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update a teacher (Admin only)
export const updateTeacher = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { teacherId } = req.params;
    const { fullName, email, password, isApproved } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    if (teacher.role !== "teacher") {
      return res.status(400).json({ message: "User is not a teacher." });
    }

    // Update fields
    if (fullName) teacher.fullName = fullName;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: teacherId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered." });
      }
      teacher.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      teacher.password = hashedPassword;
    }
    if (typeof isApproved === "boolean") {
      teacher.isApproved = isApproved;
    }

    await teacher.save();

    res.status(200).json({
      message: "Teacher updated successfully.",
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        role: teacher.role,
        isApproved: teacher.isApproved
      }
    });
  } catch (error) {
    console.error("Update teacher error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete a teacher (Admin only)
export const deleteTeacher = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    if (teacher.role !== "teacher") {
      return res.status(400).json({ message: "User is not a teacher." });
    }

    await User.findByIdAndDelete(teacherId);

    res.status(200).json({
      message: "Teacher deleted successfully.",
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email
      }
    });
  } catch (error) {
    console.error("Delete teacher error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get dashboard statistics (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Get counts
    const totalStudents = await User.countDocuments({ role: "student" });
    // Count all teachers (isApproved defaults to true, so count all teachers)
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalCourses = await Course.countDocuments({ status: "active" });
    const pendingApplications = await TeacherApplication.countDocuments({ status: "pending" });
    
    // Calculate total revenue from completed course payments
    const completedPayments = await Payment.find({ status: 'completed' });
    const courseRevenue = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Calculate total revenue from completed merchandise orders
    const completedOrders = await Order.find({ status: 'completed' });
    const merchandiseRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Combined total revenue
    const totalRevenue = courseRevenue + merchandiseRevenue;

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        pendingApplications,
        totalRevenue,
        courseRevenue,
        merchandiseRevenue
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Get all students (Admin only)
export const getAllStudents = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const students = await User.find({ role: "student" })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    // Get all courses to count enrollments
    const allCourses = await Course.find()
      .select('students');

    console.log(`📚 Found ${allCourses.length} total courses for student enrollment counting`);

    // Get course enrollment counts for each student
    const studentsWithCourseCounts = students.map((student) => {
      let courseCount = 0;
      
      // Count courses where this student is enrolled
      allCourses.forEach(course => {
        if (course.students && Array.isArray(course.students)) {
          // Check if student is in this course (handle both old and new format)
          const isEnrolled = course.students.some(s => {
            if (typeof s === 'object' && s.studentId) {
              // New format: object with studentId
              return s.studentId.toString() === student._id.toString();
            }
            // Legacy format: direct ObjectId
            return s.toString() === student._id.toString();
          });
          
          if (isEnrolled) {
            courseCount++;
          }
        }
      });

      console.log(`👤 Student ${student.fullName}: ${courseCount} enrolled courses`);

      return {
        ...student.toObject(),
        enrolledCoursesCount: courseCount
      };
    });

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully.",
      students: studentsWithCourseCounts
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Update a student (Admin only)
export const updateStudent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin role required." 
      });
    }

    const { studentId } = req.params;
    const { fullName, email, phone, password } = req.body;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found." 
      });
    }

    if (student.role !== "student") {
      return res.status(400).json({ 
        success: false,
        message: "User is not a student." 
      });
    }

    // Update fields
    if (fullName !== undefined) student.fullName = fullName;
    if (email !== undefined) student.email = email;
    if (phone !== undefined) student.phone = phone;
    
    // Update password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }

    await student.save();

    // Return updated student without password
    const updatedStudent = await User.findById(studentId)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student: updatedStudent
    });
  } catch (error) {
    console.error("Update student error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Email already exists." 
      });
    }
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Delete a student (Admin only)
export const deleteStudent = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin role required." 
      });
    }

    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found." 
      });
    }

    if (student.role !== "student") {
      return res.status(400).json({ 
        success: false,
        message: "User is not a student." 
      });
    }

    // Remove student from all courses they're enrolled in
    const Course = (await import('../models/Course.js')).default;
    
    // Find all courses and filter in memory to handle both formats
    const allCourses = await Course.find({});
    
    // Filter courses where student is enrolled (handle both new and legacy formats)
    const coursesWithStudent = allCourses.filter(course => {
      if (!course.students || !Array.isArray(course.students)) {
        return false;
      }
      
      return course.students.some(student => {
        // New format: { studentId, studentName, enrolledAt }
        if (typeof student === 'object' && student.studentId) {
          return student.studentId.toString() === studentId.toString();
        }
        // Legacy format: direct ObjectId
        return student.toString() === studentId.toString();
      });
    });

    console.log(`🗑️  Removing student ${studentId} from ${coursesWithStudent.length} courses`);

    // Remove student from each course
    for (const course of coursesWithStudent) {
      const originalLength = course.students.length;
      course.students = course.students.filter(s => {
        if (typeof s === 'object' && s.studentId) {
          return s.studentId.toString() !== studentId.toString();
        }
        return s.toString() !== studentId.toString();
      });
      
      if (course.students.length < originalLength) {
        await course.save();
        console.log(`✅ Removed student from course: ${course.title}`);
      }
    }

    // Delete the student
    await User.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email
      }
    });
  } catch (error) {
    console.error("❌ Delete student error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      studentId: req.params.studentId
    });
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error. Please try again later.",
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Get all courses (Admin only)
export const getAllCourses = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const courses = await Course.find()
      .populate('teacher', 'fullName email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully.",
      courses
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Delete a course (Admin only)
export const deleteCourseAdmin = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin role required." 
      });
    }

    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found." 
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully."
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Get teacher revenue data (Admin only)
export const getTeacherRevenue = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin role required." 
      });
    }

    // Get all teachers
    const teachers = await User.find({ role: "teacher" })
      .select('fullName email profilePicture')
      .sort({ fullName: 1 });

    // Get all completed payments
    const completedPayments = await Payment.find({ status: 'completed' })
      .populate({
        path: 'course',
        select: 'title teacher price',
        populate: {
          path: 'teacher',
          select: 'fullName email'
        }
      })
      .populate('student', 'fullName email');

    // Logs are now saved to file automatically via console override

    // Get all courses for teachers to count students from enrollments
    const allCourses = await Course.find()
      .populate('teacher', 'fullName email')
      .select('title teacher price students');

    // Calculate revenue per teacher
    const teacherRevenue = await Promise.all(teachers.map(async (teacher) => {
      // Get all courses for this teacher
      const teacherCourses = completedPayments.filter(
        payment => {
          const courseTeacher = payment.course?.teacher;
          // Handle both populated teacher object and teacher ID
          const teacherId = courseTeacher?._id?.toString() || courseTeacher?.toString();
          return teacherId === teacher._id.toString();
        }
      );

      // Get courses for this teacher from all courses
      const teacherCourseList = allCourses.filter(course => {
        const courseTeacher = course.teacher;
        const teacherId = courseTeacher?._id?.toString() || courseTeacher?.toString();
        return teacherId === teacher._id.toString();
      });

      // Calculate total revenue from payments
      const totalRevenue = teacherCourses.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      // Count total students from course enrollments (not just payments)
      let totalStudentsFromCourses = 0;
      teacherCourseList.forEach(course => {
        if (course.students && Array.isArray(course.students)) {
          // Handle both old format (ObjectId) and new format (object with studentId)
          const studentCount = course.students.length;
          totalStudentsFromCourses += studentCount;
        }
      });

      // Logs are now saved to file automatically

      // Group by course - use payments for revenue, but also include courses with students
      const courseRevenue = {};
      
      // First, add courses from payments (for revenue tracking)
      teacherCourses.forEach(payment => {
        const courseId = payment.course?._id?.toString();
        if (courseId) {
          if (!courseRevenue[courseId]) {
            courseRevenue[courseId] = {
              courseId: courseId,
              courseTitle: payment.course?.title || 'Unknown Course',
              coursePrice: payment.course?.price || 0,
              studentCount: 0,
              revenue: 0,
              students: []
            };
          }
          courseRevenue[courseId].studentCount += 1;
          courseRevenue[courseId].revenue += payment.amount || 0;
          if (payment.student) {
            courseRevenue[courseId].students.push({
              id: payment.student._id,
              name: payment.student.fullName,
              email: payment.student.email,
              amount: payment.amount,
              paidAt: payment.completedAt
            });
          }
        }
      });

      // Then, add courses with students but no payments (for student count)
      // Also populate students array from course enrollments for courses that already have payment records
      for (const course of teacherCourseList) {
        const courseId = course._id.toString();
        
        if (course.students && course.students.length > 0) {
          // Get student details from course enrollments
          const enrolledStudents = [];
          
          for (const studentEnrollment of course.students) {
            let studentId, studentName;
            
            // Handle both old format (ObjectId) and new format (object with studentId)
            if (typeof studentEnrollment === 'object' && studentEnrollment.studentId) {
              studentId = studentEnrollment.studentId;
              studentName = studentEnrollment.studentName || 'Unknown Student';
            } else {
              studentId = studentEnrollment;
              studentName = 'Unknown Student';
            }
            
            // Try to get student details from User model
            try {
              const studentUser = await User.findById(studentId).select('fullName email');
              if (studentUser) {
                enrolledStudents.push({
                  id: studentUser._id,
                  name: studentUser.fullName,
                  email: studentUser.email,
                  amount: 0, // No payment record
                  paidAt: null
                });
              } else {
                // Fallback to enrollment data
                enrolledStudents.push({
                  id: studentId,
                  name: studentName,
                  email: 'N/A',
                  amount: 0,
                  paidAt: null
                });
              }
            } catch (err) {
              console.error(`Error fetching student ${studentId}:`, err);
              // Fallback to enrollment data
              enrolledStudents.push({
                id: studentId,
                name: studentName,
                email: 'N/A',
                amount: 0,
                paidAt: null
              });
            }
          }
          
          if (!courseRevenue[courseId]) {
            // Course has students but no payment records
            courseRevenue[courseId] = {
              courseId: courseId,
              courseTitle: course.title || 'Unknown Course',
              coursePrice: course.price || 0,
              studentCount: enrolledStudents.length,
              revenue: 0, // No payment records
              students: enrolledStudents
            };
          } else {
            // Course already has payment records, but update student list with all enrolled students
            // Merge students from payments with students from enrollments (avoid duplicates)
            const existingStudentIds = new Set(courseRevenue[courseId].students.map(s => s.id.toString()));
            
            enrolledStudents.forEach(enrolledStudent => {
              const enrolledId = enrolledStudent.id.toString();
              if (!existingStudentIds.has(enrolledId)) {
                // Student is enrolled but has no payment record
                courseRevenue[courseId].students.push(enrolledStudent);
              }
            });
            
            // Update student count to reflect all enrolled students
            courseRevenue[courseId].studentCount = courseRevenue[courseId].students.length;
          }
        }
      }

      // Count courses with students (not just courses with payments)
      const coursesWithStudents = teacherCourseList.filter(course => 
        course.students && course.students.length > 0
      ).length;

      return {
        teacherId: teacher._id,
        teacherName: teacher.fullName,
        teacherEmail: teacher.email,
        profilePicture: teacher.profilePicture,
        totalRevenue: totalRevenue,
        totalStudents: totalStudentsFromCourses || teacherCourses.length, // Use course enrollments if available
        courseCount: coursesWithStudents || Object.keys(courseRevenue).length, // Use courses with students
        courses: Object.values(courseRevenue)
      };
    }));

    res.status(200).json({
      success: true,
      message: "Teacher revenue data retrieved successfully.",
      teachers: teacherRevenue
    });
  } catch (error) {
    console.error("Get teacher revenue error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Get teacher's own revenue data (Teacher only)
export const getMyTeacherRevenue = async (req, res) => {
  try {
    // Check if user is teacher
    if (req.user.role !== "teacher") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Teacher role required." 
      });
    }

    const teacherId = req.user.userId;

    // Get teacher details
    const teacher = await User.findById(teacherId)
      .select('fullName email profilePicture');

    if (!teacher) {
      return res.status(404).json({ 
        success: false,
        message: "Teacher not found." 
      });
    }

    // Get all completed payments for this teacher's courses
    const completedPayments = await Payment.find({ status: 'completed' })
      .populate({
        path: 'course',
        select: 'title teacher price',
        populate: {
          path: 'teacher',
          select: 'fullName email'
        }
      })
      .populate('student', 'fullName email');

    // Filter payments for this teacher's courses
    const teacherCourses = completedPayments.filter(
      payment => {
        const courseTeacher = payment.course?.teacher;
        const teacherIdStr = courseTeacher?._id?.toString() || courseTeacher?.toString();
        return teacherIdStr === teacherId.toString();
      }
    );

    // Get all courses for this teacher
    const teacherCourseList = await Course.find({ teacher: teacherId })
      .select('title teacher price students');

    // Calculate total revenue from payments
    const totalRevenue = teacherCourses.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Count total students from course enrollments
    let totalStudentsFromCourses = 0;
    teacherCourseList.forEach(course => {
      if (course.students && Array.isArray(course.students)) {
        const studentCount = course.students.length;
        totalStudentsFromCourses += studentCount;
      }
    });

    // Group by course
    const courseRevenue = {};
    
    // First, add courses from payments (for revenue tracking)
    teacherCourses.forEach(payment => {
      const courseId = payment.course?._id?.toString();
      if (courseId) {
        if (!courseRevenue[courseId]) {
          courseRevenue[courseId] = {
            courseId: courseId,
            courseTitle: payment.course?.title || 'Unknown Course',
            coursePrice: payment.course?.price || 0,
            studentCount: 0,
            revenue: 0,
            students: []
          };
        }
        courseRevenue[courseId].studentCount += 1;
        courseRevenue[courseId].revenue += payment.amount || 0;
        if (payment.student) {
          courseRevenue[courseId].students.push({
            id: payment.student._id,
            name: payment.student.fullName,
            email: payment.student.email,
            amount: payment.amount,
            paidAt: payment.completedAt
          });
        }
      }
    });

    // Then, add courses with students but no payments
    for (const course of teacherCourseList) {
      const courseId = course._id.toString();
      
      if (course.students && course.students.length > 0) {
        const enrolledStudents = [];
        
        for (const studentEnrollment of course.students) {
          let studentId, studentName;
          
          if (typeof studentEnrollment === 'object' && studentEnrollment.studentId) {
            studentId = studentEnrollment.studentId;
            studentName = studentEnrollment.studentName || 'Unknown Student';
          } else {
            studentId = studentEnrollment;
            studentName = 'Unknown Student';
          }
          
          try {
            const studentUser = await User.findById(studentId).select('fullName email');
            if (studentUser) {
              enrolledStudents.push({
                id: studentUser._id,
                name: studentUser.fullName,
                email: studentUser.email,
                amount: 0,
                paidAt: null
              });
            } else {
              enrolledStudents.push({
                id: studentId,
                name: studentName,
                email: 'N/A',
                amount: 0,
                paidAt: null
              });
            }
          } catch (err) {
            console.error(`Error fetching student ${studentId}:`, err);
            enrolledStudents.push({
              id: studentId,
              name: studentName,
              email: 'N/A',
              amount: 0,
              paidAt: null
            });
          }
        }
        
        if (!courseRevenue[courseId]) {
          courseRevenue[courseId] = {
            courseId: courseId,
            courseTitle: course.title || 'Unknown Course',
            coursePrice: course.price || 0,
            studentCount: enrolledStudents.length,
            revenue: 0,
            students: enrolledStudents
          };
        } else {
          const existingStudentIds = new Set(courseRevenue[courseId].students.map(s => s.id.toString()));
          
          enrolledStudents.forEach(enrolledStudent => {
            const enrolledId = enrolledStudent.id.toString();
            if (!existingStudentIds.has(enrolledId)) {
              courseRevenue[courseId].students.push(enrolledStudent);
            }
          });
          
          courseRevenue[courseId].studentCount = courseRevenue[courseId].students.length;
        }
      }
    }

    // Count courses with students
    const coursesWithStudents = teacherCourseList.filter(course => 
      course.students && course.students.length > 0
    ).length;

    const teacherRevenueData = {
      teacherId: teacher._id,
      teacherName: teacher.fullName,
      teacherEmail: teacher.email,
      profilePicture: teacher.profilePicture,
      totalRevenue: totalRevenue,
      totalStudents: totalStudentsFromCourses || teacherCourses.length,
      courseCount: coursesWithStudents || Object.keys(courseRevenue).length,
      courses: Object.values(courseRevenue)
    };

    res.status(200).json({
      success: true,
      message: "Teacher revenue data retrieved successfully.",
      teacher: teacherRevenueData
    });
  } catch (error) {
    console.error("Get my teacher revenue error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};

// Get all payments (courses + merchandise) for admin
export const getAllPayments = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Admin role required." 
      });
    }

    // Get all completed course payments
    const coursePayments = await Payment.find({ status: 'completed' })
      .populate({
        path: 'course',
        select: 'title teacher price',
        populate: {
          path: 'teacher',
          select: 'fullName email'
        }
      })
      .populate('student', 'fullName email')
      .sort({ completedAt: -1 });

    // Get all completed merchandise orders
    const merchandiseOrders = await Order.find({ status: 'completed' })
      .populate('student', 'fullName email')
      .populate('items.merchandise', 'name price image')
      .sort({ completedAt: -1 });

    // Format course payments
    const formattedCoursePayments = coursePayments.map(payment => ({
      id: payment._id,
      type: 'course',
      student: payment.student ? {
        id: payment.student._id,
        name: payment.student.fullName,
        email: payment.student.email
      } : null,
      course: payment.course ? {
        id: payment.course._id,
        title: payment.course.title,
        teacher: payment.course.teacher ? {
          id: payment.course.teacher._id,
          name: payment.course.teacher.fullName,
          email: payment.course.teacher.email
        } : null,
        price: payment.course.price
      } : null,
      amount: payment.amount,
      status: payment.status,
      completedAt: payment.completedAt,
      createdAt: payment.createdAt
    }));

    // Format merchandise orders
    const formattedMerchandiseOrders = merchandiseOrders.map(order => ({
      id: order._id,
      type: 'merchandise',
      student: order.student ? {
        id: order.student._id,
        name: order.student.fullName,
        email: order.student.email
      } : null,
      items: order.items.map(item => ({
        merchandise: item.merchandise ? {
          id: item.merchandise._id,
          name: item.merchandise.name,
          price: item.merchandise.price,
          image: item.merchandise.image
        } : { name: item.name, price: item.price },
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      completedAt: order.completedAt,
      createdAt: order.createdAt
    }));

    // Calculate totals
    const totalCourseRevenue = coursePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalMerchandiseRevenue = merchandiseOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalRevenue = totalCourseRevenue + totalMerchandiseRevenue;

    res.status(200).json({
      success: true,
      message: "All payments retrieved successfully.",
      payments: {
        courses: formattedCoursePayments,
        merchandise: formattedMerchandiseOrders,
        totals: {
          courseRevenue: totalCourseRevenue,
          merchandiseRevenue: totalMerchandiseRevenue,
          totalRevenue: totalRevenue
        }
      }
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
};