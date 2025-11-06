import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    isApproved: { type: Boolean, default: true }, // For teachers, this will be false initially
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Profile fields
    phone: { type: String },
    age: { type: Number },
    bio: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    profilePicture: { type: String }, // URL or path to profile picture
    // Teacher-specific fields
    teachingExperience: { type: String },
    coursesKnown: [{ type: String }],
    confidenceLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    qualifications: { type: String },
    // Student-specific fields
    enrollmentDate: { type: Date },
    interests: [{ type: String }],
    // Admin-specific fields
    department: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;