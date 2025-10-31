import React, { useState,useEffect } from "react";
import {
  Play,
  Star,
  Users,
  Clock,
  BookOpen,
  Shield,
  CheckCircle,
  Download,
  Lock,
  FileText,
  HelpCircle,
  ChevronDown,
  Award,
} from "lucide-react";

const CourseDetailPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedModules, setExpandedModules] = useState([0]);

     useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to top of the page
  }, []);

  const toggleModule = (id) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Example course data (replace with real API later)
  const course = {
    title: "Complete Web Development Masterclass 2024",
    subtitle:
      "Build Real-World Projects with React, Node.js, and Modern Web Technologies",
    rating: 4.9,
    reviews: 12453,
    students: 89342,
    duration: "42h 30m",
    instructor: {
      name: "Sarah Johnson",
      title: "Senior Full Stack Developer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    },
    price: 89.99,
    originalPrice: 199.99,
    discount: 55,
    includes: [
      { icon: Play, text: "42.5 hours on-demand video" },
      { icon: FileText, text: "248 lectures • 32 articles" },
      { icon: Download, text: "75 downloadable resources" },
      { icon: Shield, text: "Full lifetime access" },
      { icon: CheckCircle, text: "Certificate of completion" },
    ],
  };

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section className="py-5 text-white" style={{ background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold">{course.title}</h1>
              <p className="lead">{course.subtitle}</p>

              <div className="d-flex flex-wrap gap-3 my-3">
                <span className="d-flex align-items-center">
                  <Star className="text-warning me-1" /> {course.rating} ({course.reviews.toLocaleString()} reviews)
                </span>
                <span className="d-flex align-items-center">
                  <Users className="me-1" /> {course.students.toLocaleString()} students
                </span>
                <span className="d-flex align-items-center">
                  <Clock className="me-1" /> {course.duration}
                </span>
              </div>

              <div className="d-flex align-items-center bg-white bg-opacity-25 rounded p-3 mt-4">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="rounded-circle me-3 border border-white"
                  width="64"
                  height="64"
                />
                <div>
                  <h5 className="mb-0">{course.instructor.name}</h5>
                  <small>{course.instructor.title}</small>
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
                    <h3 className="fw-bold mb-0">${course.price}</h3>
                    <span className="text-decoration-line-through text-muted ms-2">
                      ${course.originalPrice}
                    </span>
                    <span className="badge bg-success ms-2">{course.discount}% OFF</span>
                  </div>

                  <button className="btn btn-primary w-100 mb-2">Enroll Now</button>
                  <button className="btn btn-outline-secondary w-100 mb-3">
                    Try Free Preview
                  </button>

                  <h6 className="fw-semibold">This course includes:</h6>
                  <ul className="list-unstyled mt-2">
                    {course.includes.map((item, idx) => {
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
          {["overview", "curriculum", "instructor", "reviews"].map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link text-capitalize ${
                  activeTab === tab ? "active fw-semibold" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        <div>
          {activeTab === "overview" && (
            <div>
              <h3>What you’ll learn</h3>
              <ul className="list-group list-group-flush my-3">
                <li className="list-group-item">Build responsive websites with HTML, CSS, JS</li>
                <li className="list-group-item">Master React, Node.js, and MongoDB</li>
                <li className="list-group-item">Deploy full-stack apps professionally</li>
              </ul>
              <h4 className="mt-5">Requirements</h4>
              <p>No prior programming experience required.</p>
            </div>
          )}

          {activeTab === "instructor" && (
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex align-items-center mb-3">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="rounded-circle me-3"
                  width="64"
                  height="64"
                />
                <div>
                  <h5 className="mb-0">{course.instructor.name}</h5>
                  <p className="text-muted mb-0">{course.instructor.title}</p>
                </div>
              </div>
              <p>
                Hi! I'm Sarah, a full-stack developer with over 10 years of
                experience. I’ve worked with companies like Google and Amazon,
                and I love teaching web development.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h4>Student Reviews</h4>
              <p className="text-muted">⭐ 4.9 out of 5 — based on 12,453 reviews</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <section
        className="text-white text-center py-5"
        style={{ background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}
      >
        <Award size={48} className="mb-3" />
        <h3 className="fw-bold">Become an Instructor</h3>
        <p className="mb-4">
          Share your knowledge and earn by teaching students worldwide.
        </p>
        <button className="btn btn-light px-4 py-2 fw-semibold">
          Start Teaching Today
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">© 2025 LearnHub — All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CourseDetailPage;
