import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get all assignments for a teacher
export const getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const assignments = await Assignment.find({ teacher: teacherId })
      .populate('course', 'title description')
      .populate('teacher', 'fullName email')
      .populate('submissions.student', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get a single assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id;

    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      teacher: teacherId 
    })
      .populate('course', 'title description')
      .populate('teacher', 'fullName email')
      .populate('submissions.student', 'fullName email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to access it.'
      });
    }

    res.status(200).json({
      success: true,
      assignment: assignment
    });
  } catch (error) {
    console.error('Get assignment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, maxPoints, instructions, allowLateSubmissions, latePenalty } = req.body;
    const teacherId = req.user.id;

    // Validation
    if (!title || !description || !courseId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, course, and due date are required.'
      });
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create assignments.'
      });
    }

    // Check if course exists and belongs to the teacher
    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to create assignments for it.'
      });
    }

    // Validate due date
    const dueDateObj = new Date(dueDate);
    if (dueDateObj <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be in the future.'
      });
    }

    const assignment = new Assignment({
      title,
      description,
      course: courseId,
      teacher: teacherId,
      dueDate: dueDateObj,
      maxPoints: maxPoints || 100,
      instructions: instructions || '',
      allowLateSubmissions: allowLateSubmissions || false,
      latePenalty: latePenalty || 0,
      submissions: [],
      status: 'active'
    });

    await assignment.save();

    // Populate the created assignment
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title description')
      .populate('teacher', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update an assignment
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, description, dueDate, maxPoints, instructions, allowLateSubmissions, latePenalty, status } = req.body;
    const teacherId = req.user.id;

    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      teacher: teacherId 
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to modify it.'
      });
    }

    // Update fields
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (dueDateObj <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Due date must be in the future.'
        });
      }
      assignment.dueDate = dueDateObj;
    }
    if (maxPoints) assignment.maxPoints = maxPoints;
    if (instructions !== undefined) assignment.instructions = instructions;
    if (allowLateSubmissions !== undefined) assignment.allowLateSubmissions = allowLateSubmissions;
    if (latePenalty !== undefined) assignment.latePenalty = latePenalty;
    if (status) assignment.status = status;

    await assignment.save();

    // Populate the updated assignment
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title description')
      .populate('teacher', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully.',
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id;

    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      teacher: teacherId 
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to delete it.'
      });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully.'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get submissions for an assignment
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id;

    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      teacher: teacherId 
    })
      .populate('submissions.student', 'fullName email')
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to access it.'
      });
    }

    res.status(200).json({
      success: true,
      assignment: assignment,
      submissions: assignment.submissions
    });
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Grade a submission
export const gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;
    const teacherId = req.user.id;

    // Validation
    if (grade === undefined || grade < 0 || grade > 100) {
      return res.status(400).json({
        success: false,
        message: 'Grade must be between 0 and 100.'
      });
    }

    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      teacher: teacherId 
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to grade it.'
      });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedAt = new Date();
    submission.gradedBy = teacherId;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully.',
      submission: submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get assignment statistics
export const getAssignmentStats = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id;

    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      teacher: teacherId 
    })
      .populate('submissions.student', 'fullName email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you do not have permission to access it.'
      });
    }

    const stats = {
      totalSubmissions: assignment.submissions.length,
      gradedSubmissions: assignment.submissions.filter(sub => sub.grade !== undefined).length,
      pendingSubmissions: assignment.submissions.filter(sub => sub.grade === undefined).length,
      averageGrade: 0,
      highestGrade: 0,
      lowestGrade: 100
    };

    if (stats.gradedSubmissions > 0) {
      const grades = assignment.submissions
        .filter(sub => sub.grade !== undefined)
        .map(sub => sub.grade);
      
      stats.averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      stats.highestGrade = Math.max(...grades);
      stats.lowestGrade = Math.min(...grades);
    }

    res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
