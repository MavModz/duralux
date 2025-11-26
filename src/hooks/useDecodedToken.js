'use client'
import { useState, useEffect, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getCookie } from '@/utils/cookies'

/**
 * Hook to decode JWT token from cookies or localStorage
 * Returns decoded user data, loading state, and error state
 * 
 * @returns {Object} { userData, isLoading, error, token }
 *   - userData: Decoded JWT payload (user information)
 *   - isLoading: Boolean indicating if token is being decoded
 *   - error: Error object if decoding fails, null otherwise
 *   - token: Raw token string
 * 
 * @example
 * const { userData, isLoading, error } = useDecodedToken()
 * const userId = userData?.user?.uid
 * const userRole = userData?.user?.role
 * const companyId = userData?.user?.company_id
 * const userName = userData?.user?.user?.name
 */
export function useDecodedToken() {
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const decodeToken = () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to get token from cookies first, then localStorage
        let tokenValue = getCookie('token')
        if (!tokenValue && typeof window !== 'undefined') {
          tokenValue = localStorage.getItem('token')
        }

        if (!tokenValue) {
          setUserData(null)
          setToken(null)
          setIsLoading(false)
          return
        }

        setToken(tokenValue)

        // Decode the JWT token
        try {
          const decoded = jwtDecode(tokenValue)
          setUserData(decoded)
          setError(null)
        } catch (decodeError) {
          console.error('[useDecodedToken] Error decoding token:', decodeError)
          setError(decodeError)
          setUserData(null)
        }
      } catch (err) {
        console.error('[useDecodedToken] Error in decodeToken:', err)
        setError(err)
        setUserData(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Decode immediately
    decodeToken()

    // Listen for storage changes (token updates)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === null) {
        decodeToken()
      }
    }

    // Listen for cookie changes (polling method since cookies don't trigger storage events)
    let cookieCheckInterval = null
    if (typeof window !== 'undefined') {
      let lastCookieValue = getCookie('token')
      
      cookieCheckInterval = setInterval(() => {
        const currentCookieValue = getCookie('token')
        if (currentCookieValue !== lastCookieValue) {
          lastCookieValue = currentCookieValue
          decodeToken()
        }
      }, 1000) // Check every second
    }

    window.addEventListener('storage', handleStorageChange)

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (cookieCheckInterval) {
        clearInterval(cookieCheckInterval)
      }
    }
  }, [])

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    userData,
    isLoading,
    error,
    token
  }), [userData, isLoading, error, token])
}

