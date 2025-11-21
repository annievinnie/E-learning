import express from 'express';
import {
  getTeacherQuestions,
  getCourseQuestions,
  askQuestion,
  replyToQuestion,
  deleteQuestion,
  deleteAnswer,
  markQuestionResolved
} from '../controllers/qnaController.js';
import { verifyToken, verifyTeacher } from '../middleware/auth.js';

const router = express.Router();

// Get all questions for teacher's courses (teacher panel)
router.get('/teacher/questions', verifyToken, verifyTeacher, getTeacherQuestions);

// Get all questions for a course
router.get('/courses/:courseId/questions', verifyToken, getCourseQuestions);

// Ask a question
router.post('/courses/:courseId/questions', verifyToken, askQuestion);

// Reply to a question
router.post('/questions/:questionId/replies', verifyToken, replyToQuestion);

// Delete a question
router.delete('/questions/:questionId', verifyToken, deleteQuestion);

// Delete an answer
router.delete('/questions/:questionId/answers/:answerId', verifyToken, deleteAnswer);

// Mark question as resolved/unresolved
router.put('/questions/:questionId/resolved', verifyToken, markQuestionResolved);

export default router;

