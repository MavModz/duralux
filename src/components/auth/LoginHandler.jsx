'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CryptoJS from 'crypto-js'
import { homePost } from '@/utils/api'
import { setCookie } from '@/utils/cookies'
import { errorAlert } from '@/utils/alerts'
import { normalizeRole } from '@/utils/roles'

export default function LoginHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false)

  useEffect(() => {
    const handleLogin = async () => {
      const id = searchParams?.get('id')
      const routeData = searchParams?.get('routeData')
      let role = 'Admin'
      let shouldRedirect = false
      let accessDenied = false
      let loginSuccess = false

      // Debug: Log environment variable (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('CRYPTO_KEY_SECRET exists:', !!process.env.NEXT_PUBLIC_CRYPTO_KEY_SECRET)
        console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL)
      }

      try {
        if (id) {
          // Decrypt the hashed id using the secret key
          const secretKey = process.env.NEXT_PUBLIC_CRYPTO_KEY_SECRET || 'your-secret-key-here'
          
          if (secretKey === 'your-secret-key-here') {
            console.warn('⚠️ WARNING: Using default secret key. Please set NEXT_PUBLIC_CRYPTO_KEY_SECRET in .env.local')
          }
          
          // Fix URL encoding issue: + becomes space in URL params, so replace spaces back to +
          // Then properly decode the rest
          const fixedId = id.replace(/ /g, '+')
          const encryptedId = decodeURIComponent(fixedId)
          console.log('Encrypted ID:', encryptedId)
          
          const decryptedBytes = CryptoJS.AES.decrypt(encryptedId, secretKey)
          const decryptedId = decryptedBytes.toString(CryptoJS.enc.Utf8)
          
          console.log('Decrypted ID:', decryptedId)
          
          if (decryptedId) {
            const payload = { id: decryptedId }
            const response = await homePost('/login-user', payload)
            
            console.log('Login response:', response)
            
            // Check if access is denied
            if (response?.data?.status === false && response?.data?.msg === 'Access Denied') {
              console.log('Access denied by server')
              accessDenied = true
              
              // Show error toast
              errorAlert('You do not have access to the system.')
            } else if (response?.status && response?.data?.status && response?.data?.token) {
              // Normalize role to ensure it's one of: SuperAdmin, Admin, SubAdmin
              const userRole = response.data.user.role || 'Admin'
              const normalizedRole = normalizeRole(userRole)
              role = normalizedRole
              
              console.log('Login successful. Role:', normalizedRole, 'RouteData:', routeData)
              
              // Store tokens
              localStorage.setItem('token', response.data.token)
              localStorage.setItem('nrich_token', response.data.nrich_token || '')
              localStorage.setItem('userRole', normalizedRole)
              localStorage.setItem('userData', JSON.stringify(response.data.user))
              
              // Set cookies for backward compatibility
              setCookie('token', response.data.token, 180)
              if (response?.data?.nrich_token) {
                setCookie('nrich_token', response.data.nrich_token, 180)
              }
              
              // Dispatch login event to trigger user online tracking
              window.dispatchEvent(new Event('user-logged-in'))
              
              loginSuccess = true
              shouldRedirect = true
            } else {
              console.error('Login failed - invalid response:', response)
              errorAlert('Login failed. Please try again.')
            }
          } else {
            console.error('Decryption failed: empty result')
            errorAlert('Invalid encrypted ID. Please check your URL.')
          }
        } else {
          // No id in query - page.js will handle redirect for home route
          console.log('No ID parameter found in URL')
        }
      } catch (e) {
        console.error('Login error:', e)
        errorAlert('An error occurred during login. Please try again.')
      }
      
      // Handle access denied - show modal
      if (accessDenied) {
        try {
          // Fetch user data to get onDomain
          // You can implement this API call if needed
          // const userData = await homeGet('/api/users/admin')
          
          // Show the warning modal
          setShowAccessDeniedModal(true)
          return
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Show modal anyway with default config
          setShowAccessDeniedModal(true)
          return
        }
      }
      
      // Only redirect if login was successful
      if (shouldRedirect && loginSuccess) {
        // Determine target route based on routeData first, then fallback to role-based default
        const routeKey = typeof routeData === 'string' ? routeData.toLowerCase().trim() : ''
        let target = `/${role.toLowerCase()}/leaddashboard` // Default fallback
        
        console.log('Determining redirect target. RouteKey:', routeKey, 'Role:', role)
        
        // Check routeData first
        if (routeKey === 'whatsapp') {
          target = `/${role.toLowerCase()}/notification/whatsapp`
        } else if (routeKey === 'email') {
          target = `/${role.toLowerCase()}/notification/emails/campaigndashboard`
        } else if (routeKey === 'workflow') {
          target = `/${role.toLowerCase()}/workflow`
        } else if (routeKey === 'crm') {
          target = `/${role.toLowerCase()}/leaddashboard`
        } else if (routeKey === 'googlesheet') {
          target = `/${role.toLowerCase()}/leadIntegration/googlesheet`
        } else if (routeKey === 'googleadd') {
          target = `/${role.toLowerCase()}/leadIntegration/googleadd`
        } else if (routeKey === 'meta') {
          target = `/${role.toLowerCase()}/leadIntegration/meta`
        } else if (routeKey === 'wordpress') {
          target = `/${role.toLowerCase()}/leadIntegration/wordpress`
        }
        
        console.log('Redirecting to:', target)
        router.push(target)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    handleLogin()
  }, [searchParams, router])

  return (
    <>
      {/* Access Denied Modal */}
      {showAccessDeniedModal && (
        <div className="access-denied-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div 
            className="modal-overlay" 
            onClick={() => setShowAccessDeniedModal(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)'
            }}
          />
          <div className="modal-content" style={{
            position: 'relative',
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            zIndex: 10000
          }}>
            <h2>Access Denied</h2>
            <p>You do not have access to the system.</p>
            <button 
              onClick={() => setShowAccessDeniedModal(false)} 
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

