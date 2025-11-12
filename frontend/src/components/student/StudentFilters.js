import React from 'react';
import { FaFilter } from 'react-icons/fa';

const StudentFilters = ({ 
  selectedCategory, 
  selectedLevel, 
  selectedPrice,
  selectedEnrollment,
  categories, 
  levels, 
  onCategoryChange, 
  onLevelChange,
  onPriceChange,
  onEnrollmentChange
}) => {
  const priceOptions = [
    { value: "all", label: "All Prices" },
    { value: "free", label: "Free" },
    { value: "under50", label: "Under $50" },
    { value: "50-100", label: "$50 - $100" },
    { value: "100-200", label: "$100 - $200" },
    { value: "200+", label: "$200+" }
  ];

  const enrollmentOptions = [
    { value: "all", label: "All Courses" },
    { value: "enrolled", label: "Enrolled" },
    { value: "not-enrolled", label: "Not Enrolled" }
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center gap-2 text-gray-700">
        <FaFilter className="text-indigo-600 text-lg" />
        <span className="font-semibold text-gray-800">Filters:</span>
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl text-gray-700 font-medium cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat === "all" ? "All Categories" : cat}
          </option>
        ))}
      </select>

      <select
        value={selectedLevel}
        onChange={(e) => onLevelChange(e.target.value)}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl text-gray-700 font-medium cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {levels.map((level) => (
          <option key={level} value={level}>
            {level === "all" ? "All Levels" : level}
          </option>
        ))}
      </select>

      <select
        value={selectedPrice}
        onChange={(e) => onPriceChange(e.target.value)}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl text-gray-700 font-medium cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {priceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={selectedEnrollment}
        onChange={(e) => onEnrollmentChange(e.target.value)}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl text-gray-700 font-medium cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {enrollmentOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StudentFilters;

