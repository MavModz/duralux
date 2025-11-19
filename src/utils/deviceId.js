/**
 * Get or generate a unique device ID
 * The device ID is stored in localStorage and persists across sessions
 * @returns {string|null} Device ID or null if running on server
 */
export function getDeviceId() {
  if (typeof window === 'undefined') return null;
  
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    // Generate a unique device ID using crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      // Fallback for browsers that don't support crypto.randomUUID
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

