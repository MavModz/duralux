'use client'
import { useUserOnline } from '@/hooks/useUserOnline';
import { useEffect, useState } from 'react';

/**
 * UserOnlineTracker Component
 * Tracks user online status and monitors for device changes
 * This component should be included in the root layout
 */
export default function UserOnlineTracker() {
  const [userId, setUserId] = useState(null);

  const getUserId = () => {
    // First try to get from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        // Try multiple possible field names for user ID
        const uid = userData?.uid || userData?.user?.uid || userData?._id || userData?.id || userData?.user?._id || userData?.user?.id;
        if (uid) {
          return uid;
        }
      } catch (e) {
        console.error('[UserOnlineTracker] Error parsing userData:', e);
      }
    }
    return null;
  };

  useEffect(() => {
    // Get user ID on mount
    const uid = getUserId();
    if (uid) {
      setUserId(uid);
    } else {
      // Check if user is logged in (has token)
      const token = localStorage.getItem('token');
      if (token) {
        // The useUserOnline hook will fetch the user ID from API if not provided
        setUserId('pending'); // Set a placeholder to trigger the hook
      }
    }

    // Listen for storage changes (when userData is set after login)
    // Note: storage event only fires in other tabs, not the current tab
    const handleStorage = (event) => {
      if (event.key === 'userData' || event.key === 'token') {
        const uid = getUserId();
        if (uid) {
          setUserId(uid);
        } else if (event.key === 'token' && event.newValue) {
          // Token was set, trigger hook to fetch user ID
          setUserId('pending');
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    
    // Also listen for custom login event (for same-tab login)
    const handleLogin = () => {
      const uid = getUserId();
      if (uid) {
        setUserId(uid);
      } else {
        setUserId('pending');
      }
    };

    window.addEventListener('user-logged-in', handleLogin);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('user-logged-in', handleLogin);
    };
  }, []); // Empty dependency array - only run on mount

  // Use the hook to track user online status
  useUserOnline(userId === 'pending' ? null : userId);

  return null; // This component doesn't render anything
}

