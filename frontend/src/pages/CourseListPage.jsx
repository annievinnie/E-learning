import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import StudentHeroSection from "../components/student/StudentHeroSection";
import StudentFilters from "../components/student/StudentFilters";
import StudentCoursesList from "../components/student/StudentCoursesList";
import StudentBecomeInstructor from "../components/student/StudentBecomeInstructor";

const CoursesListPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [selectedEnrollment, setSelectedEnrollment] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await API.get('/student/courses');
            if (response.data.success) {
                const courses = (response.data.courses || []).map(course => {
                    // Ensure instructor is a string, not an object (handle legacy format)
                    if (course.instructor && typeof course.instructor === 'object') {
                        course.instructor = course.instructor.name || course.instructor.fullName || 'Instructor';
                        if (!course.instructorImage) {
                            course.instructorImage = course.instructor.avatar || course.instructor.profilePicture || '';
                        }
                    }
                    return course;
                });
                setCourses(courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            // Keep empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const handleResetFilters = () => {
        setSelectedCategory("all");
        setSelectedLevel("all");
        setSelectedPrice("all");
        setSelectedEnrollment("all");
        setSearchQuery("");
    };

    // Get unique categories from courses dynamically
    const allCategories = ["all", ...new Set(courses.map(course => course.category || 'Other').filter(Boolean))];
    const levels = ["all", "Beginner", "Intermediate", "Advanced"];

    const filteredCourses = courses.filter((course) => {
        // Category matching - case insensitive
        const courseCategory = (course.category || 'Other').trim();
        const matchesCategory = selectedCategory === "all" || 
            courseCategory.toLowerCase() === selectedCategory.toLowerCase();
        
        // Level matching - case insensitive comparison
        const courseLevel = (course.level || 'Beginner').toString().trim();
        const matchesLevel = selectedLevel === "all" || 
            courseLevel.toLowerCase() === selectedLevel.toLowerCase();
        
        // Price matching
        const coursePrice = course.price || 0;
        let matchesPrice = true;
        if (selectedPrice !== "all") {
            switch (selectedPrice) {
                case "free":
                    matchesPrice = coursePrice === 0;
                    break;
                case "under50":
                    matchesPrice = coursePrice > 0 && coursePrice < 50;
                    break;
                case "50-100":
                    matchesPrice = coursePrice >= 50 && coursePrice <= 100;
                    break;
                case "100-200":
                    matchesPrice = coursePrice > 100 && coursePrice <= 200;
                    break;
                case "200+":
                    matchesPrice = coursePrice > 200;
                    break;
                default:
                    matchesPrice = true;
            }
        }
        
        // Enrollment status matching
        const isEnrolled = course.isEnrolled === true || course.isEnrolled === 'true';
        let matchesEnrollment = true;
        if (selectedEnrollment !== "all") {
            if (selectedEnrollment === "enrolled") {
                matchesEnrollment = isEnrolled;
            } else if (selectedEnrollment === "not-enrolled") {
                matchesEnrollment = !isEnrolled;
            }
        }
        
        // Search matching
        const matchesSearch = !searchQuery.trim() ||
            (course.title && course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesCategory && matchesLevel && matchesPrice && matchesEnrollment && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
            <div className="container mx-auto px-4 py-8">
                <StudentHeroSection 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <StudentFilters
                    selectedCategory={selectedCategory}
                    selectedLevel={selectedLevel}
                    selectedPrice={selectedPrice}
                    selectedEnrollment={selectedEnrollment}
                    categories={allCategories}
                    levels={levels}
                    onCategoryChange={setSelectedCategory}
                    onLevelChange={setSelectedLevel}
                    onPriceChange={setSelectedPrice}
                    onEnrollmentChange={setSelectedEnrollment}
                    onResetFilters={handleResetFilters}
                />

                <StudentCoursesList
                    courses={filteredCourses}
                    loading={loading}
                    onCourseClick={handleCourseClick}
                />

                <StudentBecomeInstructor />
            </div>
        </div>
    );
};

export default CoursesListPage;