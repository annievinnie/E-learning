import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import CoursesListPage from "./CourseListPage";
import Footer from "../components/Footer";
import ImageSlider from "../components/student/ImageSlider";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    API.get("/profile")
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // Static slider images - add your images to public/images/sliders/
  // The slider will automatically rotate through all images every 3 seconds
  const sliderImages = [
    '/images/sliders/slider1.jpg',
    '/images/sliders/slider2.jpg',
    '/images/sliders/slider3.jpg',
    '/images/sliders/slider4.jpg',
    // Add more images here if you want (e.g., '/images/sliders/slider5.jpg')
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 flex flex-col">
      {/* Main Section */}
      <main className="flex-grow-1">
        {/* Picture Slider Section */}
        <div className="w-full px-4 py-8">
          <div className="max-w-7xl mx-auto mb-8">
            <ImageSlider
              images={sliderImages}
              title=""
              autoPlayInterval={3000}
              height="600px"
            />
          </div>
        </div>

        <CoursesListPage />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;
