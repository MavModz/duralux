'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROLES } from '@/utils/roles';
import { getCookie } from '@/utils/cookies';

/**
 * RouteGuard Component
 * Prevents unauthorized users from accessing routes and blocks page rendering
 */
export default function RouteGuard({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAccess = () => {
      // Skip check for home route (it handles its own redirect)
      if (pathname === '/') {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check for token in both localStorage and cookies
      const tokenInLocalStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const tokenInCookie = getCookie('token');
      const hasToken = !!(tokenInLocalStorage || tokenInCookie);

      // Get user role from localStorage
      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
      
      // Check if accessing protected routes (admin or subadmin routes)
      const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/subadmin');
      
      // If accessing protected routes without token, redirect to base URL
      if (isProtectedRoute && !hasToken) {
        const baseUrl = process.env.NEXT_PUBLIC_NRICH_BASE_URL || 'https://nrichlearning.com/';
        window.location.replace(baseUrl);
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }
      
      // If not logged in and not on protected route, allow (auth will handle it)
      if (!storedRole) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      const currentRole = storedRole;

      // SuperAdmin can access all routes
      if (currentRole === ROLES.SUPERADMIN) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if current path requires a specific role
      let pathRequiredRole = null;
      if (pathname.startsWith('/admin')) {
        pathRequiredRole = ROLES.ADMIN;
      } else if (pathname.startsWith('/subadmin')) {
        pathRequiredRole = ROLES.SUBADMIN;
      }

      // If no role requirement, allow access
      if (!pathRequiredRole) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user has access
      // Admin cannot access SubAdmin routes
      // SubAdmin cannot access Admin routes
      if (
        (currentRole === ROLES.ADMIN && pathRequiredRole === ROLES.SUBADMIN) ||
        (currentRole === ROLES.SUBADMIN && pathRequiredRole === ROLES.ADMIN)
      ) {
        setIsAuthorized(false);
        setIsChecking(false);
        
        // Immediately redirect to user's dashboard
        const roleLower = currentRole.toLowerCase();
        router.replace(`/${roleLower}/leaddashboard`);
      } else {
        setIsAuthorized(true);
        setIsChecking(false);
      }
    };

    // Check access immediately
    checkAccess();
  }, [pathname, router]);

  // Show loading state while checking (prevents flash of content)
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f8f9fa'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Block rendering if unauthorized (redirect is happening)
  if (!isAuthorized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f8f9fa',
        padding: '2rem'
      }}>
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Redirecting...</span>
          </div>
          <h5 className="text-muted">Unauthorized Access</h5>
          <p className="text-muted mb-0">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Allow rendering if authorized
  return <>{children}</>;
}

