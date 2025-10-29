import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TeacherApplication from "../models/TeacherApplication.js";
import getCourierClient from "../config/courier.js";

export const signupUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Check if email already exists in TeacherApplication collection
    const existingApplication = await TeacherApplication.findOne({ email });
    if (existingApplication) {
      return res.status(400).json({ message: "Email already has a pending application." });
    }

    // If role is teacher, create an application instead of direct registration
    if (role === "teacher") {
      const hashedPassword = await bcrypt.hash(password, 10);

      const teacherApplication = new TeacherApplication({
        fullName,
        email,
        password: hashedPassword,
        status: "pending"
      });

      await teacherApplication.save();

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
      role,
      isApproved: true, // Students and admins are approved by default
    });

    await newUser.save();
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
      // For security, don't reveal if email exists or not
      return res.status(200).json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Send email using Courier
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      // Check if Courier is configured
      if (!process.env.COURIER_AUTH_TOKEN) {
        console.log(`Password reset link for ${user.email}: ${resetUrl}`);
        res.status(200).json({ 
          message: "Password reset link generated. Check server logs for the link (Courier not configured)." 
        });
        return;
      }

      const courier = getCourierClient();
      await courier.send({
        message: {
          to: {
            email: user.email,
          },
          template: process.env.COURIER_RESET_PASSWORD_TEMPLATE_ID,
          data: {
            userName: user.fullName,
            resetUrl: resetUrl,
          },
        },
      });

      res.status(200).json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Clear the reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
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
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
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
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const { applicationId } = req.params;

    const application = await TeacherApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ message: "Application has already been processed." });
    }

    // Create the actual user account
    const newUser = new User({
      fullName: application.fullName,
      email: application.email,
      password: application.password, // Already hashed
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

    // Send approval email to teacher
    try {
      if (process.env.COURIER_AUTH_TOKEN) {
        const courier = getCourierClient();
        await courier.send({
          message: {
            to: {
              email: application.email,
            },
            template: process.env.COURIER_TEACHER_APPROVED_TEMPLATE_ID || "teacher-approved-template",
            data: {
              teacherName: application.fullName,
              loginUrl: `${process.env.FRONTEND_URL}/login`,
            },
          },
        });
      }
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Don't fail the approval if email fails
    }

    res.status(200).json({
      message: "Teacher application approved successfully! Teacher can now login.",
      teacher: {
        id: newUser._id,
        name: application.fullName,
        email: application.email
      }
    });
  } catch (error) {
    console.error("Approve teacher application error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
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
              teacherName: application.fullName,
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