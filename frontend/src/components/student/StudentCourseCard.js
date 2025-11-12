import React from 'react';
import { FaStar, FaUsers } from 'react-icons/fa';

const StudentCourseCard = ({ course, onCourseClick }) => {
  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col"
    >
      {/* Course Image */}
      <div className="relative overflow-hidden h-36 bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0">
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
            <span className="text-white text-sm font-semibold">No Image</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold rounded-full shadow-md backdrop-blur-sm">
            {course.category || 'Development'}
          </span>
          <span className="px-2 py-0.5 bg-white/90 text-gray-700 text-[10px] font-semibold rounded-full shadow-md backdrop-blur-sm">
            {course.level || 'Beginner'}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4 flex flex-col flex-grow min-h-0">
        <h5 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-tight">
          {course.title}
        </h5>
        
        {/* Description */}
        <p className="text-gray-600 text-xs mb-3 line-clamp-2 min-h-[2.5rem]">
          {course.description || 'No description available'}
        </p>

        {/* Instructor */}
        <div className="flex items-center mb-3">
          {course.instructorImage ? (
            <img
              src={course.instructorImage}
              alt={course.instructor || "Instructor"}
              className="w-6 h-6 rounded-full object-cover mr-1.5 border-2 border-indigo-200 flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold mr-1.5 flex-shrink-0">
              {(course.instructor || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-gray-600 text-xs font-medium truncate">{course.instructor || 'Unknown'}</span>
        </div>

        {/* Rating and Students */}
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <FaStar className="text-amber-500 text-xs" />
            <span className="font-bold text-gray-800 text-xs">{course.rating || 4.5}</span>
            <span className="text-gray-500 text-[10px]">({course.reviewCount?.toLocaleString() || course.reviews?.toLocaleString() || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUsers className="text-gray-600 text-xs" />
            <span className="text-xs font-medium text-gray-600">{course.students?.toLocaleString() || course.students || 0}</span>
          </div>
        </div>

        {/* Price and Enroll Button */}
        <div className="flex justify-between items-center mt-auto pt-1">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-900">${course.price || 0}</span>
            {course.originalPrice && course.originalPrice > course.price && (
              <span className="text-gray-400 line-through text-[10px]">
                ${Math.round(course.originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={() => onCourseClick(course.id || course._id)}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 whitespace-nowrap"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseCard;

