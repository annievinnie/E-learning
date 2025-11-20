import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import StudentCourseCard from './StudentCourseCard';

const StudentCoursesList = ({ courses, loading, onCourseClick }) => {
  const [visibleCount, setVisibleCount] = useState(8); // Show 2 rows initially (4 columns x 2 rows = 8)
  const [cardsPerRow, setCardsPerRow] = useState(4);

  // Calculate cards per row based on screen size
  useEffect(() => {
    const calculateCardsPerRow = () => {
      const width = window.innerWidth;
      if (width >= 1280) return 4; // xl: 4 columns
      if (width >= 1024) return 3; // lg: 3 columns
      if (width >= 768) return 2;  // md: 2 columns
      return 1; // sm: 1 column
    };

    const updateCardsPerRow = () => {
      setCardsPerRow(calculateCardsPerRow());
      // Reset visible count to 2 rows when screen size changes
      setVisibleCount(calculateCardsPerRow() * 2);
    };

    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  const handleViewMore = () => {
    setVisibleCount(prev => prev + cardsPerRow); // Add one more row
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-6 text-xl text-gray-600 font-medium">Loading courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 mb-6">
          <FaSearch className="text-4xl text-indigo-600" />
        </div>
        <h5 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h5>
        <p className="text-gray-600 text-lg">Try changing your filters or search</p>
      </div>
    );
  }

  const visibleCourses = courses.slice(0, visibleCount);
  const hasMore = visibleCount < courses.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleCourses.map((course) => (
          <StudentCourseCard
            key={course.id || course._id}
            course={course}
            onCourseClick={onCourseClick}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleViewMore}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            View More
          </button>
        </div>
      )}
    </>
  );
};

export default StudentCoursesList;

