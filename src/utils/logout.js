/**
 * Logout utility function
 * Clears authentication data while preserving specific keys (la, lo, city)
 * @param {string} redirectUrl - URL to redirect to after logout (optional)
 */
export function logout(redirectUrl = null) {
  if (typeof window === 'undefined') return;
  
  const keepKeys = ["la", "lo", "city"];
  
  // Get userData before clearing (to determine redirect URL)
  let finalRedirectUrl = redirectUrl;
  if (!finalRedirectUrl) {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData?.onDomain != null && userData?.onDomain !== undefined) {
            finalRedirectUrl = userData.onDomain;
          } else if (userData?.user?.onDomain != null && userData?.user?.onDomain !== undefined) {
            finalRedirectUrl = userData.user.onDomain;
          }
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      }
    } catch (e) {
      console.error('Error getting userData:', e);
    }
  }
  
  // Default redirect URL
  if (!finalRedirectUrl) {
    finalRedirectUrl = process.env.NEXT_PUBLIC_NRICH_BASE_URL || 'https://nrichlearning.com/';
  }
  
  // Preserve specific localStorage keys
  const keepLocal = {};
  keepKeys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      keepLocal[key] = value;
    }
  });
  
  // Clear all localStorage
  localStorage.clear();
  
  // Restore preserved keys
  Object.entries(keepLocal).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  // Clear cookies (except preserved keys)
  const cookies = document.cookie.split(";");
  cookies.forEach((cookie) => {
    const [rawName] = cookie.split("=");
    const name = rawName.trim();
    if (!keepKeys.includes(name)) {
      document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
    }
  });
  
  // Redirect to homepage
  window.location.replace(finalRedirectUrl);
}

