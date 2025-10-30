import React, { useState,useEffect } from "react";
import {
    FaSearch,
    FaUsers,
    FaStar,
    FaChartBar,
    FaFilter,
    FaMedal,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CoursesListPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    // inside your course card JSX:



    const courses = [
        {
            id: 1,
            title: "Complete Web Development Masterclass",
            instructor: "Sarah Johnson",
            instructorImage:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
            thumbnail:
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
            category: "Development",
            level: "Beginner",
            rating: 4.8,
            reviewCount: 12847,
            students: 45231,
            duration: "42h 30m",
            lessons: 286,
            price: 89.99,
            originalPrice: 199.99,
            bestseller: true,
            description:
                "Master web development from scratch with HTML, CSS, JavaScript, React, Node.js, and MongoDB.",
        },
        {
            id: 2,
            title: "Advanced React & TypeScript Development",
            instructor: "Michael Chen",
            instructorImage:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
            thumbnail:
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
            category: "Development",
            level: "Advanced",
            rating: 4.9,
            reviewCount: 8932,
            students: 23456,
            duration: "28h 15m",
            lessons: 187,
            price: 109.99,
            originalPrice: 229.99,
            bestseller: true,
            description:
                "Take your React skills to the next level with TypeScript, performance optimization, and testing strategies.",
        },
        {
            id: 3,
            title: "Machine Learning & AI with Python",
            instructor: "Dr. James Kumar",
            instructorImage:
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
            thumbnail:
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop",
            category: "Data Science",
            level: "Intermediate",
            rating: 4.9,
            reviewCount: 9876,
            students: 34567,
            duration: "52h 20m",
            lessons: 312,
            price: 119.99,
            originalPrice: 249.99,
            bestseller: true,
            description:
                "Comprehensive guide to machine learning, deep learning, and AI using Python.",
        },
    ];

    const categories = ["all", "Development", "Data Science"];
    const levels = ["all", "Beginner", "Intermediate", "Advanced"];

    const filteredCourses = courses.filter((course) => {
        const matchesCategory =
            selectedCategory === "all" || course.category === selectedCategory;
        const matchesLevel =
            selectedLevel === "all" || course.level === selectedLevel;
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesLevel && matchesSearch;
    });

     useEffect(() => {
        window.scrollTo(0, 0); // Scrolls to top of the page
      }, []);
    return (
        <div className="container-fluid px-3">
            {/* Hero Section */}
            <div className="text-center bg-primary text-white rounded-3 py-5 mb-4" style={{ background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}>
                <h2 className="fw-bold display-6 mb-2">Discover Your Next Skill</h2>
                <p className="text-light fs-5 mb-3">
                    Choose from thousands of online courses with expert instructors.
                </p>
                <div className="input-group mx-auto" style={{ maxWidth: "400px" }}>
                    <span className="input-group-text bg-white">
                        <FaSearch className="text-secondary" />
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex flex-wrap align-items-center mb-4 gap-2">
                <div className="d-flex align-items-center me-2">
                    <FaFilter className="text-secondary me-2" />
                    <span className="fw-semibold text-secondary">Filters:</span>
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-select w-auto"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat === "all" ? "All Categories" : cat}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="form-select w-auto"
                >
                    {levels.map((level) => (
                        <option key={level} value={level}>
                            {level === "all" ? "All Levels" : level}
                        </option>
                    ))}
                </select>
            </div>

            {/* Courses Grid */}
            <div className="row g-3">
                {filteredCourses.map((course) => (
                    <div className="col-12 col-md-6 col-lg-4" key={course.id}>
                        <div className="card shadow-sm border-0 h-100">
                            <img
                                src={course.thumbnail}
                                className="card-img-top"
                                alt={course.title}
                            />
                            <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="badge bg-primary">{course.category}</span>
                                    <span className="badge bg-light text-dark border">
                                        {course.level}
                                    </span>
                                </div>

                                <h5 className="card-title fw-bold">{course.title}</h5>
                                <p className="text-muted small flex-grow-1">
                                    {course.description.length > 80
                                        ? course.description.slice(0, 80) + "..."
                                        : course.description}
                                </p>

                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        src={course.instructorImage}
                                        alt={course.instructor}
                                        className="rounded-circle me-2"
                                        width="32"
                                        height="32"
                                    />
                                    <span className="text-secondary small">{course.instructor}</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-warning fw-bold">
                                        <FaStar className="me-1" />
                                        {course.rating} ({course.reviewCount.toLocaleString()})
                                    </span>
                                    <span className="text-muted small">
                                        <FaUsers className="me-1" />
                                        {course.students.toLocaleString()}
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                    <div>
                                        <span className="fw-bold fs-5 text-dark">${course.price}</span>
                                        <span className="text-muted text-decoration-line-through ms-2">
                                            ${course.originalPrice}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleCourseClick(course.id)}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCourses.length === 0 && (
                <div className="text-center py-5">
                    <FaSearch size={40} className="text-muted mb-3" />
                    <h5 className="fw-bold text-dark">No courses found</h5>
                    <p className="text-secondary">Try changing your filters or search</p>
                </div>
            )}

            {/* Footer */}
            <div className="text-center bg-primary text-white rounded-3 py-4 mt-5" style={{ background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}>
                <FaMedal size={40} className="mb-3" />
                <h3 className="fw-bold mb-2">Become an Instructor</h3>
                <p className="text-light mb-3 fs-5">
                    Share your knowledge and earn by teaching students worldwide.
                </p>
                <button className="btn btn-light fw-semibold px-4 py-2">
                    Start Teaching Today
                </button>
            </div>
        </div>

    );
};

export default CoursesListPage;
