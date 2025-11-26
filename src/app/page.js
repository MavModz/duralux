'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { normalizeRole } from '@/utils/roles'

/**
 * Component that handles the redirect logic using searchParams
 * Must be wrapped in Suspense boundary
 */
function HomeRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get routeData from query params
    const routeData = searchParams?.get('routeData')
    
    // Check if user is already logged in
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    const userRole = storedRole ? normalizeRole(storedRole) : 'Admin'
    
    // Determine target route based on routeData first, then fallback to role-based default
    const routeKey = typeof routeData === 'string' ? routeData.toLowerCase().trim() : ''
    let target = `/${userRole.toLowerCase()}/leaddashboard` // Default fallback
    
    // Check routeData first
    if (routeKey === 'whatsapp') {
      target = `/${userRole.toLowerCase()}/notification/whatsapp`
    } else if (routeKey === 'email') {
      target = `/${userRole.toLowerCase()}/notification/emails/campaigndashboard`
    } else if (routeKey === 'workflow') {
      target = `/${userRole.toLowerCase()}/workflow`
    } else if (routeKey === 'crm') {
      target = `/${userRole.toLowerCase()}/leaddashboard`
    } else if (routeKey === 'googlesheet') {
      target = `/${userRole.toLowerCase()}/leadIntegration/googlesheet`
    } else if (routeKey === 'googleadd') {
      target = `/${userRole.toLowerCase()}/leadIntegration/googleadd`
    } else if (routeKey === 'meta') {
      target = `/${userRole.toLowerCase()}/leadIntegration/meta`
    } else if (routeKey === 'wordpress') {
      target = `/${userRole.toLowerCase()}/leadIntegration/wordpress`
    }
    
    // Redirect immediately
    router.replace(target)
  }, [router, searchParams])

  // Return minimal loading state (or nothing) while redirect happens
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      width: '100vw'
    }}>
      <div>Loading...</div>
    </div>
  )
}

/**
 * Minimal home page that immediately redirects to the appropriate dashboard
 * Prevents 404 error while allowing client-side redirect logic to work
 */
export default function Home() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100vw'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <HomeRedirect />
    </Suspense>
  )
}

