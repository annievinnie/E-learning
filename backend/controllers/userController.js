import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import getCourierClient from "../config/courier.js";

export const signupUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
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
        role: user.role
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
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Admin-only function to add a teacher
export const addTeacher = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new teacher user
    const newTeacher = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "teacher",
    });

    await newTeacher.save();

    res.status(201).json({ 
      message: "Teacher added successfully!",
      teacher: {
        id: newTeacher._id,
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        role: newTeacher.role,
        createdAt: newTeacher.createdAt
      }
    });
  } catch (error) {
    console.error("Add teacher error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get all teachers (admin only)
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Teachers retrieved successfully.",
      teachers: teachers.map(teacher => ({
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        role: teacher.role,
        createdAt: teacher.createdAt
      }))
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update a teacher (admin only)
export const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({ message: "Full name and email are required." });
    }

    // Find the teacher
    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Check if email is being changed and if it already exists
    if (email !== teacher.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: teacherId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered." });
      }
    }

    // Update teacher data
    teacher.fullName = fullName;
    teacher.email = email;

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      teacher.password = hashedPassword;
    }

    await teacher.save();

    res.status(200).json({ 
      message: "Teacher updated successfully!",
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        role: teacher.role,
        createdAt: teacher.createdAt
      }
    });
  } catch (error) {
    console.error("Update teacher error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete a teacher (admin only)
export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    await User.findByIdAndDelete(teacherId);

    res.status(200).json({ message: "Teacher deleted successfully." });
  } catch (error) {
    console.error("Delete teacher error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
