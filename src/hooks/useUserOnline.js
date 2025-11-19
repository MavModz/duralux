'use client'
import { useEffect, useRef } from 'react';
import { ref, set, onValue, onDisconnect } from 'firebase/database';
import { database } from '@/lib/firebase';
import { getDeviceId } from '@/utils/deviceId';
import { homeGet } from '@/utils/api';

/**
 * Hook to track user online status and detect device changes
 * Automatically logs out user if another device logs in with the same account
 * @param {string} userId - User ID (optional, will be fetched if not provided)
 */
export function useUserOnline(userId = null) {
  const listenerRef = useRef(null);
  const disconnectRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!database) {
      console.error('[useUserOnline] Firebase database not initialized');
      return;
    }

    let currentUserId = userId;
    let mounted = true;

    const initializeUserOnline = async () => {
      try {
        // If userId is not provided, fetch it from the API or localStorage
        if (!currentUserId) {
          try {
            const response = await homeGet('/api/users/admin');
            if (response?.status && response?.data?.user?.uid) {
              currentUserId = response.data.user.uid;
            } else {
              // Try to get from localStorage as fallback
              const userDataStr = localStorage.getItem('userData');
              if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                // Try multiple possible field names
                currentUserId = userData?.uid || userData?.user?.uid || userData?._id || userData?.id || userData?.user?._id || userData?.user?.id;
              }
            }
          } catch (error) {
            console.error('[useUserOnline] Error fetching user data:', error);
            // Try to get from localStorage as fallback
            const userDataStr = localStorage.getItem('userData');
            if (userDataStr) {
              try {
                const userData = JSON.parse(userDataStr);
                // Try multiple possible field names
                currentUserId = userData?.uid || userData?.user?.uid || userData?._id || userData?.id || userData?.user?._id || userData?.user?.id;
              } catch (e) {
                console.error('[useUserOnline] Error parsing userData:', e);
              }
            }
          }
        }

        if (!currentUserId || !mounted) {
          return;
        }

        const currentDeviceId = getDeviceId();
        if (!currentDeviceId || !mounted) {
          return;
        }

        const userRef = ref(database, `/users/${currentUserId}/status`);
        const deviceRef = ref(database, `/users/${currentUserId}/device`);

        // Set user as online
        await set(userRef, true);

        // Set current device ID
        await set(deviceRef, currentDeviceId);

        // Handle disconnect - set user offline when connection is lost
        disconnectRef.current = onDisconnect(userRef);
        disconnectRef.current.set(false);

        // Listen for device changes
        listenerRef.current = onValue(deviceRef, (snapshot) => {
          if (!mounted) return;

          if (snapshot.exists()) {
            const firebaseDeviceId = snapshot.val();
            
            // Check if device ID changed (someone else logged in)
            if (firebaseDeviceId !== currentDeviceId) {
              // Special case: if device is set to 'devicereload', trigger reload instead
              if (firebaseDeviceId === 'devicereload') {
                // Regenerate token and reload
                const newDeviceId = getDeviceId();
                set(deviceRef, newDeviceId);
                window.location.reload();
                return;
              }

              // Someone else logged in!
              localStorage.setItem("refreshed", 'true');
              
              // Trigger logout event
              window.dispatchEvent(new Event('user-logged-out'));
            }
          }
        });
      } catch (error) {
        console.error('[useUserOnline] Error initializing user online:', error);
      }
    };

    // Only initialize if user is logged in (has token)
    const token = localStorage.getItem('token');
    if (token) {
      initializeUserOnline();
    }

    // Cleanup function
    return () => {
      mounted = false;
      if (listenerRef.current) {
        listenerRef.current(); // Unsubscribe from Firebase listener
        listenerRef.current = null;
      }
      if (disconnectRef.current) {
        disconnectRef.current.cancel(); // Cancel disconnect handler
        disconnectRef.current = null;
      }
    };
  }, [userId]);
}

