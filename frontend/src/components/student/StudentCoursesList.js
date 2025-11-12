import React from 'react';
import { FaSearch } from 'react-icons/fa';
import StudentCourseCard from './StudentCourseCard';

const StudentCoursesList = ({ courses, loading, onCourseClick }) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {courses.map((course) => (
        <StudentCourseCard
          key={course.id || course._id}
          course={course}
          onCourseClick={onCourseClick}
        />
      ))}
    </div>
  );
};

export default StudentCoursesList;

