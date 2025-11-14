import express from 'express';
import {
  getTeacherAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getAssignmentStats
} from '../controllers/assignmentController.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadAssignmentFile } from '../middleware/pdfUploadMiddleware.js';

const router = express.Router();

// Middleware to verify teacher role
const verifyTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Teacher role required." 
    });
  }
  next();
};

// Assignment routes
router.get('/', verifyToken, verifyTeacher, getTeacherAssignments);
router.get('/:assignmentId', verifyToken, verifyTeacher, getAssignmentById);
router.post('/', verifyToken, verifyTeacher, uploadAssignmentFile, createAssignment);
router.put('/:assignmentId', verifyToken, verifyTeacher, uploadAssignmentFile, updateAssignment);
router.delete('/:assignmentId', verifyToken, verifyTeacher, deleteAssignment);

// Submission routes
router.get('/:assignmentId/submissions', verifyToken, verifyTeacher, getAssignmentSubmissions);
router.put('/:assignmentId/submissions/:submissionId/grade', verifyToken, verifyTeacher, gradeSubmission);

// Statistics routes
router.get('/:assignmentId/stats', verifyToken, verifyTeacher, getAssignmentStats);

export default router;
