import React, { useState } from 'react';
import { Play, Lock } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const CourseCurriculum = ({ course, isEnrolled }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Get all videos from modules
  const allVideos = course.modules
    ? [...course.modules]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .filter(module => module.video)
        .map(module => module.video)
    : [];

  const handleModuleClick = (module, index) => {
    if (module.video) {
      // Find the index of this video in the sorted videos array
      const sortedModules = [...course.modules]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .filter(m => m.video);
      const videoIndex = sortedModules.findIndex(m => m._id === module._id || m.id === module.id);
      setCurrentVideoIndex(videoIndex >= 0 ? videoIndex : 0);
      setSelectedVideo({
        ...module.video,
        moduleId: module._id || module.id,
        courseId: course._id || course.id
      });
    }
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  const handleNext = () => {
    if (currentVideoIndex < allVideos.length - 1) {
      const nextIndex = currentVideoIndex + 1;
      setCurrentVideoIndex(nextIndex);
      // Find the module for the next video
      const sortedModules = [...course.modules]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .filter(m => m.video);
      const nextModule = sortedModules[nextIndex];
      if (nextModule) {
        setSelectedVideo({
          ...nextModule.video,
          moduleId: nextModule._id || nextModule.id,
          courseId: course._id || course.id
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      const prevIndex = currentVideoIndex - 1;
      setCurrentVideoIndex(prevIndex);
      // Find the module for the previous video
      const sortedModules = [...course.modules]
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .filter(m => m.video);
      const prevModule = sortedModules[prevIndex];
      if (prevModule) {
        setSelectedVideo({
          ...prevModule.video,
          moduleId: prevModule._id || prevModule.id,
          courseId: course._id || course.id
        });
      }
    }
  };

  return (
    <div>
      <h4>Course Curriculum</h4>
      <p className="text-muted mb-4">
        {course.modules?.length || 0} modules • {course.modules?.reduce((total, module) => total + (module.video ? 1 : 0), 0) || 0} videos
      </p>
      
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={closeVideoPlayer}
          isEnrolled={isEnrolled}
          allVideos={allVideos}
          currentVideoIndex={currentVideoIndex}
          onNext={handleNext}
          onPrevious={handlePrevious}
          courseId={course._id || course.id}
          moduleId={selectedVideo.moduleId}
        />
      )}
      
      {course.modules && course.modules.length > 0 ? (
        <div>
          {[...course.modules]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((module, index) => (
            <div
              key={module._id || module.id || index}
              className="mb-2 border rounded"
              style={{
                cursor: module.video ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                backgroundColor: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => handleModuleClick(module, index)}
              onMouseEnter={(e) => {
                if (module.video) {
                  const overlay = e.currentTarget.querySelector('.hover-overlay');
                  if (overlay) {
                    overlay.style.opacity = '1';
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (module.video) {
                  const overlay = e.currentTarget.querySelector('.hover-overlay');
                  if (overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                  }
                }
              }}
            >
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <strong style={{ fontSize: '1.1rem' }}>
                      {index + 1}. {module.title}
                    </strong>
                    <p className="mb-0 text-muted small mt-1">{module.description}</p>
                  </div>
                  {module.video?.duration && (
                    <span className="text-muted small ms-3">
                      {module.video.duration}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Hover Overlay with Play/Lock Icon */}
              {module.video && (
                <div
                  className="hover-overlay d-flex align-items-center justify-content-center"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    opacity: 0
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: isEnrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.3s ease',
                      transform: 'scale(0.8)'
                    }}
                  >
                    {isEnrolled ? (
                      <Play size={24} fill="#2196f3" color="#2196f3" />
                    ) : (
                      <Lock size={24} fill="#f44336" color="#f44336" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-4">
          <p className="text-muted mb-0">No curriculum available for this course yet.</p>
        </div>
      )}
    </div>
  );
};

export default CourseCurriculum;

