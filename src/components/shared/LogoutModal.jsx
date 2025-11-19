'use client'
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiLogOut, FiShield } from 'react-icons/fi';
import { logout } from '@/utils/logout';

/**
 * LogoutModal Component
 * Displays a modal when user is logged out due to another device login
 */
export default function LogoutModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check on mount if logout was triggered
    const checkRefresh = () => {
      const refreshed = localStorage.getItem("refreshed");
      if (refreshed) {
        localStorage.removeItem("refreshed");
        setShow(true);
      }
    };

    checkRefresh();

    // Listen for cross-tab logout events
    const handleStorage = (event) => {
      if (event.key === "refreshed") {
        setShow(true);
      }
    };

    // Listen for logout event from useUserOnline hook
    const handleLogout = () => {
      setShow(true);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("user-logged-out", handleLogout);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("user-logged-out", handleLogout);
    };
  }, []);

  const handleClose = () => {
    setShow(false);
    logout();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show"
        style={{
          zIndex: 1040
        }}
      />
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1050,
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
        data-bs-backdrop="static" 
        data-bs-keyboard="false" 
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="modal-dialog modal-dialog-centered"
          style={{
            margin: '1.75rem auto',
            maxWidth: '500px'
          }}
        >
          <div className="modal-content" style={{
            borderRadius: '0.5rem',
            border: 'none',
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
          }}>
            {/* Modal Header */}
            <div className="modal-header border-bottom-0 pb-0" style={{
              padding: '2rem 2rem 1rem'
            }}>
              <div className="d-flex align-items-center w-100">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle me-3"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)'
                  }}
                >
                  <FiShield 
                    className="text-danger" 
                    style={{ fontSize: '24px' }}
                  />
                </div>
                <div className="flex-grow-1">
                  <h5 className="modal-title mb-0 fw-bold" style={{ fontSize: '1.25rem' }}>
                    Session Terminated
                  </h5>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.875rem' }}>
                    Security Alert
                  </small>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body pt-3" style={{
              padding: '0 2rem 1.5rem'
            }}>
              <div className="d-flex align-items-start mb-3">
                <FiAlertCircle 
                  className="text-warning me-2 flex-shrink-0" 
                  style={{ 
                    fontSize: '20px',
                    marginTop: '2px'
                  }}
                />
                <div>
                  <p className="mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <strong>Your account has been accessed from another device.</strong>
                  </p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                    For security reasons, you have been automatically logged out from this device. 
                    If this wasn't you, please secure your account immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top-0 pt-0" style={{
              padding: '0 2rem 2rem',
              justifyContent: 'flex-end'
            }}>
              <button 
                type="button" 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleClose}
                style={{
                  minWidth: '120px',
                  padding: '0.625rem 1.5rem',
                  fontWeight: '500'
                }}
              >
                <FiLogOut style={{ fontSize: '18px' }} />
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

