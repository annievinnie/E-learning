import React from 'react';
import { FaSearch } from 'react-icons/fa';

const StudentHeroSection = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative overflow-hidden text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl py-12 mb-8 shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative z-10">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 drop-shadow-lg">
          Discover Your Next Skill
        </h2>
        <p className="text-xl md:text-2xl text-purple-100 mb-6 font-light">
          Choose from thousands of online courses with expert instructors.
        </p>
        <div className="max-w-md mx-auto">
          <div className="relative flex items-center bg-white rounded-full shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105">
            <span className="pl-4 pr-2 text-gray-400">
              <FaSearch className="text-xl" />
            </span>
            <input
              type="text"
              className="flex-1 py-4 px-2 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-lg"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHeroSection;

