import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaClock, FaUsers, FaStar, FaBookOpen } from 'react-icons/fa';
import API from '../../api';
import Footer from '../Footer';

const StudentMyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await API.get('/student/enrolled');
      console.log('Enrolled courses response:', response.data);
      if (response.data.success) {
        const courses = response.data.courses || [];
        console.log(`Found ${courses.length} enrolled courses`);
        setCourses(courses);
      } else {
        console.error('Failed to fetch enrolled courses:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getEnrollmentDate = (course) => {
    if (!course.students || !Array.isArray(course.students)) return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Try to decode token to get user ID (simple approach)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id;
      
      const studentEnrollment = course.students.find(s => {
        if (typeof s === 'object' && s.studentId) {
          return s.studentId.toString() === userId.toString();
        }
        return s.toString() === userId.toString();
      });
      
      return studentEnrollment?.enrolledAt || null;
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">My Courses</h1>
          <p className="text-gray-600 text-lg">
            Continue learning from where you left off
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p className="mt-6 text-xl text-gray-600 font-medium">Loading your courses...</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const enrollmentDate = getEnrollmentDate(course);
              const instructorImage = course.teacher?.profilePicture 
                ? (course.teacher.profilePicture.startsWith('http') 
                    ? course.teacher.profilePicture 
                    : `http://localhost:5000${course.teacher.profilePicture}`)
                : '';

              return (
                <div
                  key={course._id || course.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col cursor-pointer"
                  onClick={() => handleCourseClick(course._id || course.id)}
                >
                  {/* Course Thumbnail */}
                  <div className="relative overflow-hidden h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBookOpen className="text-white text-6xl opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-xl mb-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <FaClock className="text-xs" />
                        <span>{course.duration || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                        Enrolled
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Instructor */}
                    <div className="flex items-center mb-4">
                      {instructorImage ? (
                        <img
                          src={instructorImage}
                          alt={course.teacher?.fullName || "Instructor"}
                          className="w-8 h-8 rounded-full object-cover mr-2 border-2 border-indigo-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                          {(course.teacher?.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-gray-600 text-sm font-medium">
                        {course.teacher?.fullName || 'Unknown Instructor'}
                      </span>
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaUsers className="text-xs" />
                        <span>{course.students?.length || 0} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-amber-500 text-xs" />
                        <span>4.5</span>
                      </div>
                    </div>

                    {/* Enrollment Date */}
                    {enrollmentDate && (
                      <div className="mb-4 text-xs text-gray-500">
                        Enrolled on {formatDate(enrollmentDate)}
                      </div>
                    )}

                    {/* Progress Bar (Placeholder) */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                        <span className="text-xs text-gray-500">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course._id || course.id);
                      }}
                      className="mt-auto w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2"
                    >
                      <FaPlay className="text-sm" />
                      Continue Learning
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 mb-6">
              <FaBookOpen className="text-5xl text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">No Courses Yet</h2>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Start exploring our course catalog to begin your learning journey!
            </p>
            <button
              onClick={() => navigate('/StudentDashboard')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentMyCourses;

