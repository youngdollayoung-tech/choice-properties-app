/**
 * Choice Properties - Frontend Security Utilities
 * Handles: CSRF tokens, consent tracking, data validation, secure submission
 */

const SecurityManager = (() => {
  const config = {
    STORAGE_PREFIX: 'cp_security_',
    TOKEN_EXPIRY: 1800000, // 30 minutes
    SESSION_KEY: 'cp_session_id'
  };

  /**
   * Generate a random session ID for CSRF protection
   */
  function generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return btoa(`${timestamp}-${random}`).substring(0, 64);
  }

  /**
   * Get or create session ID
   */
  function getSessionId() {
    let sessionId = sessionStorage.getItem(config.SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(config.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Generate CSRF token (simulated on client-side)
   */
  function generateCSRFToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const token = btoa(`${timestamp}-${random}`).substring(0, 64);
    
    const sessionId = getSessionId();
    const key = `${config.STORAGE_PREFIX}csrf_${sessionId}`;
    sessionStorage.setItem(key, JSON.stringify({
      token: token,
      createdAt: timestamp,
      expiresAt: timestamp + config.TOKEN_EXPIRY
    }));
    
    return token;
  }

  /**
   * Get current CSRF token
   */
  function getCSRFToken() {
    const sessionId = getSessionId();
    const key = `${config.STORAGE_PREFIX}csrf_${sessionId}`;
    const stored = sessionStorage.getItem(key);
    
    if (!stored) return generateCSRFToken();
    
    try {
      const data = JSON.parse(stored);
      if (data.expiresAt < Date.now()) {
        sessionStorage.removeItem(key);
        return generateCSRFToken();
      }
      return data.token;
    } catch (e) {
      return generateCSRFToken();
    }
  }

  /**
   * Add CSRF token and session ID to form data
   */
  function addSecurityHeaders(formData) {
    formData.set('_sessionId', getSessionId());
    formData.set('_csrfToken', getCSRFToken());
    return formData;
  }

  /**
   * Track data processing consent (GDPR/CCPA)
   */
  function trackConsent(consentType, consentGiven) {
    const timestamp = Date.now();
    const key = `${config.STORAGE_PREFIX}consent_${consentType}`;
    
    localStorage.setItem(key, JSON.stringify({
      type: consentType,
      given: consentGiven,
      timestamp: timestamp,
      userAgent: navigator.userAgent
    }));
    
    return true;
  }

  /**
   * Check if consent was previously given
   */
  function hasConsent(consentType) {
    const key = `${config.STORAGE_PREFIX}consent_${consentType}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return false;
    
    try {
      const data = JSON.parse(stored);
      return data.given === true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get all consent records
   */
  function getConsentRecords() {
    const records = {};
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(config.STORAGE_PREFIX + 'consent_')) {
        try {
          const consentType = key.replace(config.STORAGE_PREFIX + 'consent_', '');
          records[consentType] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          // Skip invalid entries
        }
      }
    });
    
    return records;
  }

  /**
   * Clear old CSRF tokens (cleanup)
   */
  function cleanupExpiredTokens() {
    const now = Date.now();
    const keys = Object.keys(sessionStorage);
    
    keys.forEach(key => {
      if (key.startsWith(config.STORAGE_PREFIX + 'csrf_')) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key));
          if (data.expiresAt < now) {
            sessionStorage.removeItem(key);
          }
        } catch (e) {
          sessionStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Rate limit check (client-side warning)
   */
  function setClientRateLimit(ipHint) {
    const key = `${config.STORAGE_PREFIX}rate_limit_${ipHint}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(count + 1));
    return count + 1;
  }

  /**
   * Validate email format
   */
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email).toLowerCase());
  }

  /**
   * Validate phone format (basic)
   */
  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  /**
   * Validate SSN (last 4 digits only)
   */
  function validateSSN(ssn) {
    const digits = ssn.replace(/\D/g, '');
    return digits.length === 4 && digits !== '0000';
  }

  /**
   * Sanitize text input
   */
  function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Log security event (client-side)
   */
  function logSecurityEvent(eventType, details) {
    const timestamp = new Date().toISOString();
    const event = {
      type: eventType,
      timestamp: timestamp,
      details: details,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Store in session (limited to this tab)
    const key = `${config.STORAGE_PREFIX}event_${timestamp}`;
    sessionStorage.setItem(key, JSON.stringify(event));
    
    console.warn(`[Security] ${eventType}:`, details);
  }

  /**
   * Get security event logs
   */
  function getSecurityLogs() {
    const logs = [];
    const keys = Object.keys(sessionStorage);
    
    keys.forEach(key => {
      if (key.startsWith(config.STORAGE_PREFIX + 'event_')) {
        try {
          logs.push(JSON.parse(sessionStorage.getItem(key)));
        } catch (e) {
          // Skip invalid entries
        }
      }
    });
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Clear all security data on logout
   */
  function clearSecurityData() {
    const keysToRemove = [];
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(config.STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }

  // Public API
  return {
    getSessionId,
    generateCSRFToken,
    getCSRFToken,
    addSecurityHeaders,
    trackConsent,
    hasConsent,
    getConsentRecords,
    cleanupExpiredTokens,
    setClientRateLimit,
    validateEmail,
    validatePhone,
    validateSSN,
    sanitizeText,
    logSecurityEvent,
    getSecurityLogs,
    clearSecurityData
  };
})();

/**
 * Initialize security features on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Generate initial CSRF token
  SecurityManager.generateCSRFToken();
  
  // Cleanup expired tokens every 5 minutes
  setInterval(() => {
    SecurityManager.cleanupExpiredTokens();
  }, 300000);
});
