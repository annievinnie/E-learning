import Question from '../models/Question.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get all questions for teacher's courses
export const getTeacherQuestions = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    // Get all courses taught by this teacher
    const courses = await Course.find({ teacher: userId }).select('_id title');
    const courseIds = courses.map(course => course._id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        questions: [],
        courses: []
      });
    }

    // Get all questions for these courses
    const questions = await Question.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .populate('author', 'fullName email profilePicture role')
      .populate('answers.author', 'fullName email profilePicture role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      questions: questions,
      courses: courses
    });
  } catch (error) {
    console.error('Get teacher questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get all questions for a course
export const getCourseQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if user is enrolled or is the teacher
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const isTeacher = course.teacher.toString() === userId.toString();
    const isEnrolled = course.students?.some(student => {
      const studentId = student.studentId?.toString() || student.toString();
      return studentId === userId.toString();
    });

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to view questions.'
      });
    }

    // Get all questions for the course
    const questions = await Question.find({ course: courseId })
      .populate('author', 'fullName email profilePicture role')
      .populate('answers.author', 'fullName email profilePicture role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      questions: questions
    });
  } catch (error) {
    console.error('Get course questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Ask a question (students and teachers)
export const askQuestion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { content, title } = req.body;
    const userId = req.user?.userId || req.user?.id;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question details are required.'
      });
    }

    // Auto-generate title from content (first 60 characters)
    const autoTitle = content.trim().length > 60 
      ? content.trim().substring(0, 60) + '...' 
      : content.trim();
    const questionTitle = title && title.trim() ? title.trim() : autoTitle;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if user is enrolled or is the teacher
    const isTeacher = course.teacher.toString() === userId.toString();
    const isEnrolled = course.students?.some(student => {
      const studentId = student.studentId?.toString() || student.toString();
      return studentId === userId.toString();
    });

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to ask questions.'
      });
    }

    // Create question
    const question = new Question({
      course: courseId,
      author: userId,
      authorName: user.fullName,
      authorRole: user.role,
      title: questionTitle,
      content: content.trim(),
      answers: []
    });

    await question.save();

    // Populate and return
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'fullName email profilePicture role')
      .populate('answers.author', 'fullName email profilePicture role');

    res.status(201).json({
      success: true,
      message: 'Question posted successfully.',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Reply to a question
export const replyToQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId || req.user?.id;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Answer content is required.'
      });
    }

    // Get question
    const question = await Question.findById(questionId).populate('course');
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if user is enrolled or is the teacher
    const course = question.course;
    const isTeacher = course.teacher.toString() === userId.toString();
    const isEnrolled = course.students?.some(student => {
      const studentId = student.studentId?.toString() || student.toString();
      return studentId === userId.toString();
    });

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to reply to questions.'
      });
    }

    // Add answer
    question.answers.push({
      author: userId,
      authorName: user.fullName,
      authorRole: user.role,
      content: content.trim()
    });

    await question.save();

    // Populate and return
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'fullName email profilePicture role')
      .populate('answers.author', 'fullName email profilePicture role');

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully.',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Reply to question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete a question (only by author)
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    // Check if user is the author
    if (question.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own questions.'
      });
    }

    await Question.findByIdAndDelete(questionId);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete an answer (only by author)
export const deleteAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found.'
      });
    }

    // Check if user is the author
    if (answer.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own answers.'
      });
    }

    question.answers.pull(answerId);
    await question.save();

    // Populate and return
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'fullName email profilePicture role')
      .populate('answers.author', 'fullName email profilePicture role');

    res.status(200).json({
      success: true,
      message: 'Answer deleted successfully.',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Mark question as resolved (by question author or teacher)
export const markQuestionResolved = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.userId || req.user?.id;
    const { isResolved } = req.body;

    const question = await Question.findById(questionId).populate('course');
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    // Check if user is the author or the teacher
    const isAuthor = question.author.toString() === userId.toString();
    const isTeacher = question.course.teacher.toString() === userId.toString();

    if (!isAuthor && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author or course teacher can mark questions as resolved.'
      });
    }

    question.isResolved = isResolved !== undefined ? isResolved : !question.isResolved;
    await question.save();

    // Populate and return
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'fullName email profilePicture role')
      .populate('answers.author', 'fullName email profilePicture role');

    res.status(200).json({
      success: true,
      message: `Question ${question.isResolved ? 'marked as resolved' : 'marked as unresolved'}.`,
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Mark question resolved error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

