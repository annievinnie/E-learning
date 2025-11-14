import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to handle automatic logout after inactivity
 * @param {number} inactivityTime - Time in milliseconds before logout (default: 15 minutes)
 */
const useInactivityLogout = (inactivityTime = 15 * 60 * 1000) => {
  const timeoutRef = useRef(null);
  const inactivityTimeRef = useRef(inactivityTime);
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  // Update the ref when inactivityTime changes
  useEffect(() => {
    inactivityTimeRef.current = inactivityTime;
  }, [inactivityTime]);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Set new timer
    timeoutRef.current = setTimeout(() => {
      // Logout user
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      
      // Navigate to login page using window.location
      window.location.href = '/login';
      
      // Optional: Show a message to the user
      alert('You have been logged out due to inactivity. Please log in again.');
    }, inactivityTimeRef.current);
  }, []);

  useEffect(() => {
    // Only set up inactivity tracking if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Set initial timer
    resetTimer();

    // Add event listeners for user activity
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, true);
    });

    // Cleanup function
    return () => {
      // Clear timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Remove event listeners
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, [resetTimer]);

  // Reset timer when token changes (user logs in/out)
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        resetTimer();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [resetTimer]);
};

export default useInactivityLogout;

