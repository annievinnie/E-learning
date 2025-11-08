import Course from '../models/Course.js';
import User from '../models/User.js';

// Get all available courses for students (with filtering and search)
export const getAllCourses = async (req, res) => {
  try {
    const { search, level, category, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { status: 'active' }; // Only show active courses
    
    // Filter by level
    if (level && level !== 'all') {
      query.level = level.toLowerCase();
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get courses with pagination
    const courses = await Course.find(query)
      .populate('teacher', 'fullName email profilePicture')
      .select('-modules.videos') // Don't send video URLs in list view for performance
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Course.countDocuments(query);
    
    // Format courses for frontend
    const formattedCourses = courses.map(course => {
      // Format instructor image URL
      let instructorImage = '';
      if (course.teacher?.profilePicture) {
        instructorImage = course.teacher.profilePicture.startsWith('http') 
          ? course.teacher.profilePicture 
          : `http://localhost:5000${course.teacher.profilePicture}`;
      }
      
      return {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.teacher?.fullName || 'Unknown',
        instructorImage: instructorImage,
        thumbnail: course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : '',
      category: course.category || 'Other',
      level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      rating: 4.5, // Can be added as reviews/ratings later
      reviewCount: 0,
      students: course.students?.length || 0,
      duration: course.duration,
      lessons: course.modules?.reduce((acc, mod) => acc + (mod.videos?.length || 0), 0) || 0,
      price: course.price || 0,
      originalPrice: course.price ? course.price * 1.5 : 0,
      bestseller: course.students?.length > 100,
      createdAt: course.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      courses: formattedCourses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get course details by ID (for students)
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    const course = await Course.findById(courseId)
      .populate('teacher', 'fullName email profilePicture')
      .populate('students', 'fullName email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Check if course is active
    if (course.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This course is not available.'
      });
    }
    
    // Check if student is enrolled (handle both old format ObjectId and new format with studentId)
    const isEnrolled = course.students.some(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() === userId.toString();
      }
      // Handle legacy format (direct ObjectId)
      return student.toString() === userId.toString();
    });
    
    // Format course data similar to getAllCourses for consistency
    // Format instructor image URL
    let instructorImage = '';
    if (course.teacher?.profilePicture) {
      instructorImage = course.teacher.profilePicture.startsWith('http') 
        ? course.teacher.profilePicture 
        : `http://localhost:5000${course.teacher.profilePicture}`;
    }
    
    const formattedCourse = {
      id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.teacher?.fullName || 'Unknown',
      instructorImage: instructorImage,
      instructorEmail: course.teacher?.email || '',
      thumbnail: course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : '',
      category: course.category || 'Other',
      level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      rating: 4.5, // Can be added as reviews/ratings later
      reviewCount: 0,
      reviews: 0,
      students: course.students?.length || 0,
      duration: course.duration,
      lessons: course.modules?.reduce((acc, mod) => acc + (mod.videos?.length || 0), 0) || 0,
      price: course.price || 0,
      originalPrice: course.price ? course.price * 1.5 : 0,
      bestseller: course.students?.length > 100,
      createdAt: course.createdAt,
      modules: course.modules || [],
      isEnrolled
    };
    
    res.status(200).json({
      success: true,
      course: formattedCourse
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    // Find course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Check if course is active
    if (course.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This course is not available for enrollment.'
      });
    }
    
    // Get user details for enrollment check
    const studentUser = await User.findById(userId);
    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if already enrolled (handle both old format ObjectId and new format with studentId)
    const isEnrolled = course.students.some(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() === userId.toString();
      }
      // Handle legacy format (direct ObjectId)
      return student.toString() === userId.toString();
    });
    
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.'
      });
    }
    
    // Check if course requires payment
    if (course.price && course.price > 0) {
      // Import Payment model here to avoid circular dependencies
      const Payment = (await import('../models/Payment.js')).default;
      
      // Check if payment exists and is completed
      const payment = await Payment.findOne({
        student: userId,
        course: courseId,
        status: 'completed'
      });
      
      if (!payment) {
        return res.status(402).json({
          success: false,
          requiresPayment: true,
          message: 'This course requires payment. Please proceed to checkout.'
        });
      }
    }
    
    // Add student to course with ID and name (user already fetched above)
    course.students.push({
      studentId: userId,
      studentName: studentUser.fullName || 'Student'
    });
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course.'
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get enrolled courses for a student
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    // Find courses where student is enrolled (handle both old and new format)
    const courses = await Course.find({
      $or: [
        { 'students.studentId': userId }, // New format
        { students: userId } // Legacy format
      ]
    })
      .populate('teacher', 'fullName email profilePicture')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Unenroll from a course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Remove student from course (handle both old format ObjectId and new format with studentId)
    course.students = course.students.filter(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() !== userId.toString();
      }
      // Handle legacy format (direct ObjectId)
      return student.toString() !== userId.toString();
    });
    
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course.'
    });
  } catch (error) {
    console.error('Unenroll from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

