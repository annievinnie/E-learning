import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../api';

const VideoPlayer = ({ video, onClose, isEnrolled, allVideos, currentVideoIndex, onNext, onPrevious, courseId, moduleId }) => {
  const videoRef = useRef(null);
  const moduleCompletedRef = useRef(false);
  const timeUpdateThrottleRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Reset video when video prop changes
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    moduleCompletedRef.current = false; // Reset completion tracking for new video
    timeUpdateThrottleRef.current = false; // Reset throttle for new video
    videoElement.load();

    // Mark module as complete when video ends or reaches 90% completion
    const markModuleAsComplete = async () => {
      if (moduleCompletedRef.current) {
        return Promise.resolve(); // Already marked
      }
      
      moduleCompletedRef.current = true; // Set immediately to prevent duplicate calls
      
      try {
        await API.post(`/student/courses/${courseId}/modules/${moduleId}/complete`);
      } catch (error) {
        console.error('Error marking module as complete:', error);
        // Reset ref on error so it can be retried
        moduleCompletedRef.current = false;
        // Silently fail - don't interrupt video playback
      }
    };
    
    const handleTimeUpdate = () => {
      // Always update current time for progress bar
      setCurrentTime(videoElement.currentTime);
      
      // Check for completion only if not already completed
      if (timeUpdateThrottleRef.current || moduleCompletedRef.current) return;
      
      const current = videoElement.currentTime;
      const total = videoElement.duration;
      if (total > 0 && current / total >= 0.9 && isEnrolled && courseId && moduleId) {
        timeUpdateThrottleRef.current = true; // Set throttle flag immediately
        // Mark module as complete when 90% watched (only once)
        markModuleAsComplete();
      }
    };
    
    const updateDuration = () => {
      if (videoElement.duration && videoElement.duration > 0) {
        setDuration(videoElement.duration);
      }
    };
    
    const handleLoadedData = () => {
      updateDuration();
      setCurrentTime(videoElement.currentTime || 0);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleVideoEnd = () => {
      // Always update time on video end
      setCurrentTime(videoElement.duration);
      // Only mark as complete on video end if not already marked (90% check might have already done it)
      if (isEnrolled && courseId && moduleId && !moduleCompletedRef.current && !timeUpdateThrottleRef.current) {
        markModuleAsComplete();
      }
    };
    
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    };

    // Store references for cleanup
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('durationchange', updateDuration);
    videoElement.addEventListener('canplay', updateDuration);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleVideoEnd);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('durationchange', updateDuration);
      videoElement.removeEventListener('canplay', updateDuration);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleVideoEnd);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [video, isEnrolled, courseId, moduleId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!isFullscreen) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if (videoElement.webkitRequestFullscreen) {
        videoElement.webkitRequestFullscreen();
      } else if (videoElement.mozRequestFullScreen) {
        videoElement.mozRequestFullScreen();
      } else if (videoElement.msRequestFullscreen) {
        videoElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoUrl = () => {
    if (!video || !video.videoPath) return '';
    if (video.videoPath.startsWith('http')) return video.videoPath;
    return `http://localhost:5000${video.videoPath}`;
  };

  if (!isEnrolled) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
          <h3>This video is locked</h3>
          <p>Please enroll in this course to access the video content.</p>
          <button
            onClick={onClose}
            className="btn btn-primary mt-3"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl();
  if (!videoUrl) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
          <h3>Video not available</h3>
          <p>This video file could not be loaded.</p>
          <button
            onClick={onClose}
            className="btn btn-primary mt-3"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white'
        }}
      >
        <div>
          <h5 className="mb-0" style={{ color: 'white' }}>
            {video.title || 'Video'}
          </h5>
          {video.description && (
            <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
              {video.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '4px',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <X size={24} />
        </button>
      </div>

       {/* Video Container */}
       <div
         style={{
           flex: 1,
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           position: 'relative',
           width: '100%',
           height: '100%',
           overflow: 'hidden'
         }}
       >
         {/* Previous Button */}
         {onPrevious && currentVideoIndex > 0 && (
           <button
             onClick={(e) => {
               e.stopPropagation();
               onPrevious();
             }}
             style={{
               position: 'absolute',
               left: '2rem',
               top: '50%',
               transform: 'translateY(-50%)',
               background: 'rgba(0, 0, 0, 0.7)',
               border: 'none',
               color: 'white',
               cursor: 'pointer',
               padding: '1rem',
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 10,
               transition: 'all 0.3s ease'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
               e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
               e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
             }}
           >
             <ChevronLeft size={32} />
           </button>
         )}

         <video
           ref={videoRef}
           src={videoUrl}
           controls={false}
           style={{
             width: '100%',
             height: '100%',
             objectFit: 'contain',
             display: 'block'
           }}
           onClick={togglePlay}
         />

         {/* Next Button */}
         {onNext && allVideos && currentVideoIndex < allVideos.length - 1 && (
           <button
             onClick={(e) => {
               e.stopPropagation();
               onNext();
             }}
             style={{
               position: 'absolute',
               right: '2rem',
               top: '50%',
               transform: 'translateY(-50%)',
               background: 'rgba(0, 0, 0, 0.7)',
               border: 'none',
               color: 'white',
               cursor: 'pointer',
               padding: '1rem',
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 10,
               transition: 'all 0.3s ease'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
               e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
               e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
             }}
           >
             <ChevronRight size={32} />
           </button>
         )}

         {/* Custom Controls Overlay - Fixed at bottom */}
         <div
           style={{
             position: 'absolute',
             bottom: 0,
             left: 0,
             right: 0,
             backgroundColor: 'rgba(0, 0, 0, 0.8)',
             padding: '1rem 2rem',
             display: 'flex',
             flexDirection: 'column',
             gap: '0.5rem',
             zIndex: 10
           }}
         >
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime || 0}
            onChange={handleSeek}
            step="0.1"
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #333 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #333 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            onInput={handleSeek}
          />

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '100px',
                  height: '4px',
                  borderRadius: '2px',
                  background: '#333',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            <span style={{ color: 'white', fontSize: '0.9rem', minWidth: '80px' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              onClick={toggleFullscreen}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

