'use client'
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { ROLES } from '@/utils/roles';

/**
 * UnauthorizedModal Component
 * Displays a SweetAlert modal when user tries to access unauthorized routes
 */
export default function UnauthorizedModal() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkRouteAccess = () => {
      // Get user role from localStorage
      const storedRole = localStorage.getItem('userRole');
      if (!storedRole) {
        return; // Not logged in, let auth handle it
      }

      const currentRole = storedRole;

      // SuperAdmin can access all routes
      if (currentRole === ROLES.SUPERADMIN) {
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
        return;
      }

      // Check if user has access
      // Admin cannot access SubAdmin routes
      // SubAdmin cannot access Admin routes
      if (
        (currentRole === ROLES.ADMIN && pathRequiredRole === ROLES.SUBADMIN) ||
        (currentRole === ROLES.SUBADMIN && pathRequiredRole === ROLES.ADMIN)
      ) {
        const roleDisplayName = pathRequiredRole === ROLES.ADMIN ? 'Admin' : 'SubAdmin';
        const userRoleDisplayName = currentRole === ROLES.ADMIN ? 'Admin' : currentRole === ROLES.SUBADMIN ? 'SubAdmin' : 'User';

        Swal.fire({
          title: 'Unauthorized Access',
          html: `
            <div style="text-align: left; padding: 1rem 0;">
              <p style="margin-bottom: 1rem; font-size: 1rem;">
                <strong>You don't have permission to access this area.</strong>
              </p>
              <p style="margin-bottom: 0; color: #6c757d; font-size: 0.875rem;">
                Your current role is <strong>${userRoleDisplayName}</strong>, but this page requires <strong>${roleDisplayName}</strong> access. 
                Please contact your administrator if you believe this is an error.
              </p>
            </div>
          `,
          icon: 'warning',
          iconColor: '#ffc107',
          confirmButtonText: 'Go to Dashboard',
          confirmButtonColor: '#0d6efd',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            confirmButton: "btn btn-primary",
            popup: "swal2-popup-custom"
          },
          buttonsStyling: false,
          didClose: () => {
            // Redirect to user's default dashboard based on their role
            const role = localStorage.getItem('userRole');
            if (role) {
              const roleLower = role.toLowerCase();
              // Use replace instead of push to prevent back navigation
              router.replace(`/${roleLower}/leaddashboard`);
            } else {
              router.replace('/');
            }
          }
        });
      }
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkRouteAccess, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, router]);

  return null;
}

