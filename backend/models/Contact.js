import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    userRole: { type: String, enum: ["student", "teacher", "guest"], default: "guest" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // If logged in user
    isRead: { type: Boolean, default: false },
    responded: { type: Boolean, default: false },
    response: { type: String }, // Admin's response
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;

