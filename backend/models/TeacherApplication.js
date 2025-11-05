import mongoose from "mongoose";

const teacherApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for detailed applications
    age: { type: Number },
    phone: { type: String },
    teachingExperience: { type: String }, // Years of experience or description
    coursesKnown: { type: [String] }, // Array of courses/subjects
    confidenceLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    rejectionReason: { type: String },
    // Store the user ID after approval and registration completion
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

const TeacherApplication = mongoose.model("TeacherApplication", teacherApplicationSchema);

export default TeacherApplication;
