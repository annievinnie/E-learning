import React from 'react';
import { FaMedal } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StudentBecomeInstructor = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-12 mb-8 relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl py-12 px-8 shadow-2xl transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 transform transition-transform duration-300 hover:rotate-12">
          <FaMedal className="text-3xl text-white" />
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold mb-3">Become an Instructor</h3>
        <p className="text-lg md:text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
          Share your knowledge and earn by teaching students worldwide.
        </p>
        <button 
          className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 hover:bg-gray-50"
          onClick={() => navigate('/teacher-application')}
        >
          Start Teaching Today
        </button>
      </div>
    </div>
  );
};

export default StudentBecomeInstructor;

