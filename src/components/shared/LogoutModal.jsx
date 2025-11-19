'use client'
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { logout } from '@/utils/logout';

/**
 * LogoutModal Component
 * Displays a SweetAlert modal when user is logged out due to another device login
 */
export default function LogoutModal() {
  useEffect(() => {
    const showLogoutModal = () => {
      Swal.fire({
        title: 'Session Terminated',
        html: `
          <div style="text-align: left; padding: 1rem 0;">
            <p style="margin-bottom: 1rem; font-size: 1rem;">
              <strong>Your account has been accessed from another device.</strong>
            </p>
            <p style="margin-bottom: 0; color: #6c757d; font-size: 0.875rem;">
              For security reasons, you have been automatically logged out from this device. 
              If this wasn't you, please secure your account immediately.
            </p>
          </div>
        `,
        icon: 'warning',
        iconColor: '#dc3545',
        confirmButtonText: 'Continue',
        confirmButtonColor: '#0d6efd',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          confirmButton: "btn btn-primary",
          popup: "swal2-popup-custom"
        },
        buttonsStyling: false,
        didClose: () => {
          logout();
        }
      });
    };

    // Check on mount if logout was triggered
    const checkRefresh = () => {
      const refreshed = localStorage.getItem("refreshed");
      if (refreshed) {
        localStorage.removeItem("refreshed");
        showLogoutModal();
      }
    };

    checkRefresh();

    // Listen for cross-tab logout events
    const handleStorage = (event) => {
      if (event.key === "refreshed") {
        showLogoutModal();
      }
    };

    // Listen for logout event from useUserOnline hook
    const handleLogout = () => {
      showLogoutModal();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("user-logged-out", handleLogout);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("user-logged-out", handleLogout);
    };
  }, []);

  return null;
}

