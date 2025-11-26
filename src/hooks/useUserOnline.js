'use client'
import { useEffect, useRef } from 'react';
import { ref, set, onValue, onDisconnect } from 'firebase/database';
import { database } from '@/lib/firebase';
import { getDeviceId } from '@/utils/deviceId';
import { useDecodedToken } from './useDecodedToken';

/**
 * Hook to track user online status and detect device changes
 * Automatically logs out user if another device logs in with the same account
 * @param {string} userId - User ID (optional, will be fetched if not provided)
 */
export function useUserOnline(userId = null) {
  const listenerRef = useRef(null);
  const disconnectRef = useRef(null);
  const { userData: decodedUserData, isLoading: isDecodingToken, token } = useDecodedToken();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!database) {
      console.error('[useUserOnline] Firebase database not initialized');
      return;
    }

    // Wait for token to be decoded
    if (isDecodingToken) {
      return;
    }

    // Check if user has a token
    if (!token) {
      return;
    }

    let currentUserId = userId;
    let mounted = true;

    const initializeUserOnline = async () => {
      try {
        // If userId is not provided, get it from decoded token or localStorage fallback
        if (!currentUserId) {
          if (decodedUserData) {
            // Extract user ID from decoded token structure: user.uid
            currentUserId = decodedUserData?.user?.uid || decodedUserData?.user?._id || decodedUserData?.user?.id;
          }
          
          // Fallback to localStorage if not found in decoded token
          if (!currentUserId) {
            const userDataStr = localStorage.getItem('userData');
            if (userDataStr) {
              try {
                const userData = JSON.parse(userDataStr);
                // Try multiple possible field names for user ID
                currentUserId = userData?.uid || userData?.user?.uid || userData?.user_id || userData?._id || userData?.id || userData?.user?._id || userData?.user?.id;
              } catch (e) {
                console.error('[useUserOnline] Error parsing userData from localStorage:', e);
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

    // Initialize user online tracking
    initializeUserOnline();

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
  }, [userId, decodedUserData, isDecodingToken, token]);
}

