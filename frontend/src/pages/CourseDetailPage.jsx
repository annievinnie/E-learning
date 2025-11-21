import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Star,
  Users,
  Clock,
  Shield,
  Download,
  CheckCircle,
  FileText,
} from "lucide-react";
import API from "../api";
import Footer from "../components/Footer";
import StudentBecomeInstructor from "../components/student/StudentBecomeInstructor";
import CourseOverview from "../components/student/CourseOverview";
import CourseCurriculum from "../components/student/CourseCurriculum";
import CourseAssignments from "../components/student/CourseAssignments";
import CourseQnA from "../components/student/CourseQnA";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [downloadableFilesCount, setDownloadableFilesCount] = useState(0);

  const fetchCourseDetails = useCallback(async () => {
    try {
      const response = await API.get(`/student/courses/${id}`);
      if (response.data.success) {
        const courseData = response.data.course;
        // Ensure instructor is a string, not an object (handle legacy format)
        if (courseData.instructor && typeof courseData.instructor === 'object') {
          courseData.instructor = courseData.instructor.name || courseData.instructor.fullName || 'Instructor';
          if (!courseData.instructorImage) {
            courseData.instructorImage = courseData.instructor.avatar || courseData.instructor.profilePicture || '';
          }
        }
        setCourse(courseData);
        // Check enrollment status - ensure it's properly set
        const enrolled = courseData.isEnrolled === true || courseData.isEnrolled === 'true';
        setIsEnrolled(enrolled);
        console.log('Course enrollment status:', enrolled, 'for course:', courseData.title);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      // Fallback to example data if API fails
      setCourse({
        id: id,
        title: "Complete Web Development Masterclass 2024",
        subtitle: "Build Real-World Projects with React, Node.js, and Modern Web Technologies",
        description: "Master web development from scratch with HTML, CSS, JavaScript, React, Node.js, and MongoDB.",
        rating: 4.9,
        reviews: 12453,
        students: 89342,
        duration: "42h 30m",
        instructor: "Sarah Johnson",
        instructorEmail: "sarah@example.com",
        instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        price: 89.99,
        originalPrice: 199.99,
        discount: 55,
        thumbnail: "",
        isEnrolled: false,
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAssignmentsCount = useCallback(async () => {
    try {
      const response = await API.get(`/student/courses/${id}/assignments`);
      if (response.data.success) {
        const assignments = response.data.assignments || [];
        // Count total downloadable files from all assignments
        const totalFiles = assignments.reduce((count, assignment) => {
          return count + (assignment.attachments?.length || 0);
        }, 0);
        setDownloadableFilesCount(totalFiles);
      }
    } catch (error) {
      console.error('Error fetching assignments count:', error);
      setDownloadableFilesCount(0);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCourseDetails();
  }, [id, fetchCourseDetails]);

  // Fetch assignments to count downloadable files
  useEffect(() => {
    if (id) {
      fetchAssignmentsCount();
    }
  }, [id, fetchAssignmentsCount]);


  // Refresh enrollment status when component becomes visible (e.g., returning from payment)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh course details when window regains focus (user returns from Stripe)
      if (document.visibilityState === 'visible') {
        fetchCourseDetails();
      }
    };

    // Check if we're returning from payment success page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('enrolled') === 'true') {
      fetchCourseDetails();
    }

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, fetchCourseDetails]);

  const handleEnrollClick = async () => {
    if (enrolling || isEnrolled) return;

    setEnrolling(true);

    try {
      // Free course - enroll immediately
      if (!course.price || course.price === 0) {
        const response = await API.post(`/student/courses/${id}/enroll`);
        if (response.data.success) {
          setIsEnrolled(true);
          alert('Successfully enrolled in course!');
          // Refresh course data to update enrollment status
          fetchCourseDetails();
        } else {
          alert(response.data?.message || 'Failed to enroll. Please try again.');
        }
      } else {
        // Paid course - redirect to Stripe checkout
        const response = await API.post(`/payment/checkout/${id}`);
        
        console.log('Payment checkout response:', response.data);
        
        if (response.data.success && response.data.url) {
          const checkoutUrl = response.data.url;
          
          // Validate URL before redirecting
          try {
            new URL(checkoutUrl);
            // Redirect to Stripe checkout
            window.location.href = checkoutUrl;
          } catch (urlError) {
            console.error('Invalid checkout URL:', checkoutUrl);
            alert('Invalid payment URL received. Please contact support.');
            setEnrolling(false);
          }
        } else {
          const errorMsg = response.data?.message || 'Failed to create checkout session. Please try again.';
          console.error('Checkout failed:', errorMsg, response.data);
          alert(errorMsg);
          setEnrolling(false);
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
      
      // Get the actual error message from the backend
      let errorMessage = error.response?.data?.message || error.message || 'Failed to enroll. Please try again.';
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (errorMessage.includes('already enrolled')) {
          setIsEnrolled(true);
          alert('You are already enrolled in this course!');
          fetchCourseDetails();
          return;
        } else {
          alert(errorMessage);
        }
      } else if (error.response?.status === 500) {
        // Check if it's a payment configuration error
        if (errorMessage.includes('configuration') || errorMessage.includes('Payment service')) {
          alert('Payment service is not configured. Please contact the administrator.');
        } else {
          alert(errorMessage);
        }
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        alert('Network error: Could not connect to the server. Please check your connection and try again.');
      } else {
        alert(errorMessage);
      }
      setEnrolling(false);
    }
  };


  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <h2>Course Not Found</h2>
          <p className="text-muted">The course you're looking for doesn't exist.</p>
          <button className="btn btn-primary" onClick={() => navigate('/StudentDashboard')}>
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const discount = course.originalPrice && course.price
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : course.discount || 0;

  // Calculate real data
  const modulesCount = course.modules?.length || 0;
  const videosCount = course.modules?.reduce((total, module) => total + (module.video ? 1 : 0), 0) || 0;

  const courseIncludes = [
    { icon: Play, text: `${course.duration || '42.5'} hours on-demand video` },
    { icon: FileText, text: `${modulesCount} module${modulesCount !== 1 ? 's' : ''} • ${videosCount} video${videosCount !== 1 ? 's' : ''}` },
    { icon: Download, text: `${downloadableFilesCount} downloadable resource${downloadableFilesCount !== 1 ? 's' : ''}` },
    { icon: Shield, text: "Full lifetime access" },
    { icon: CheckCircle, text: "Certificate of completion" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 flex flex-col">
      {/* Hero Section */}
      <section className="py-5 text-white" style={{ background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold">{course.title}</h1>
              <p className="lead">{course.subtitle || course.description || ''}</p>
              <div className="d-flex flex-wrap gap-3 my-3">
                {course.rating && (
                  <span className="d-flex align-items-center">
                    <Star className="text-warning me-1" /> {course.rating} {course.reviews ? `(${course.reviews.toLocaleString()} reviews)` : ''}
                  </span>
                )}
                <span className="d-flex align-items-center">
                  <Users className="me-1" /> {course.students?.toLocaleString() || course.students || 0} students
                </span>
                {course.duration && (
                  <span className="d-flex align-items-center">
                    <Clock className="me-1" /> {course.duration}
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center bg-white bg-opacity-25 rounded p-3 mt-4">
                {course.instructorImage ? (
                  <img
                    src={course.instructorImage}
                    alt={course.instructor || "Instructor"}
                    className="rounded-circle me-3 border border-white"
                    width="64"
                    height="64"
                    style={{ objectFit: 'cover', backgroundColor: '#ffffff' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.instructor-fallback');
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div>
                  <h5 className="mb-0">{course.instructor || "Instructor"}</h5>
                  <small>{course.instructorEmail || "Course Instructor"}</small>
                </div>
              </div>
            </div>

            {/* Course Purchase Card */}
            <div className="col-lg-4">
              <div className="card shadow border-0">
                <div
                  className="ratio ratio-16x9 bg-dark text-center d-flex align-items-center justify-content-center"
                  style={{ cursor: "pointer" }}
                >
                  <Play className="text-white" size={48} />
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <h3 className="fw-bold mb-0">${course.price || 0}</h3>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <>
                        <span className="text-decoration-line-through text-muted ms-2">
                          ${course.originalPrice}
                        </span>
                        <span className="badge bg-success ms-2">{discount}% OFF</span>
                      </>
                    )}
                  </div>
                  {isEnrolled ? (
                    <button className="btn btn-success w-100 mb-2" disabled>
                      ✓ Enrolled
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary w-100 mb-2"
                      onClick={handleEnrollClick}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Processing...' : 'Enroll Now'}
                    </button>
                  )}
                  <h6 className="fw-semibold">This course includes:</h6>
                  <ul className="list-unstyled mt-2">
                    {courseIncludes.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <li key={idx} className="d-flex align-items-center mb-2">
                          <Icon size={18} className="text-success me-2" />
                          <span>{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <div className="container py-5">
        <ul className="nav nav-tabs mb-4">
          {["overview", "curriculum", "assignment", "qna"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link text-capitalize ${
                  activeTab === tab ? "active fw-semibold" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "qna" ? "Q & A" : tab}
              </button>
            </li>
          ))}
        </ul>

        <div>
          {activeTab === "overview" && <CourseOverview course={course} />}
          {activeTab === "curriculum" && <CourseCurriculum course={course} isEnrolled={isEnrolled} />}
          {activeTab === "assignment" && <CourseAssignments courseId={id} isEnrolled={isEnrolled} />}
          {activeTab === "qna" && <CourseQnA course={course} courseId={id} isEnrolled={isEnrolled} />}
        </div>
      </div>

      {/* Become Instructor CTA */}
      <div className="container py-5">
        <StudentBecomeInstructor />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CourseDetailPage;
