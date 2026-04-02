/**
 * Choice Properties - Offline Handler & Form Persistence
 * Purpose: Handle offline state, persist form data, enable resume functionality
 */

const OfflineManager = (() => {
  const config = {
    STORAGE_KEY: 'choicePropertiesFormData',
    SESSION_KEY: 'choicePropertiesResumeToken',
    EXPIRY_TIME: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  /**
   * Register service worker and offline handlers
   */
  function initializeOfflineSupport() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/js/service-worker.js')
        .then((registration) => {
          console.log('[Offline] Service Worker registered:', registration);
          setupServiceWorkerListeners(registration);
        })
        .catch((error) => {
          console.error('[Offline] Service Worker registration failed:', error);
        });
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check for pending submissions
    setInterval(checkForPendingSubmissions, 60000); // Every minute
  }

  /**
   * Setup listeners for service worker messages
   */
  function setupServiceWorkerListeners(registration) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SUBMISSION_SYNCED') {
        console.log('[Offline] Queued submission synced:', event.data.data);
        notifyUser('Application submitted successfully while offline!', 'success');
        clearFormData();
      }
    });
  }

  /**
   * Save form data to localStorage for offline persistence
   */
  function saveFormData(formElement) {
    try {
      const formData = new FormData(formElement);
      const data = {
        timestamp: Date.now(),
        expiresAt: Date.now() + config.EXPIRY_TIME,
        version: '1.0',
        fields: {}
      };

      // Convert FormData to object (skip files)
      for (let [key, value] of formData) {
        if (!key.startsWith('_')) { // Skip security tokens
          if (data.fields[key]) {
            if (!Array.isArray(data.fields[key])) {
              data.fields[key] = [data.fields[key]];
            }
            data.fields[key].push(value);
          } else {
            data.fields[key] = value;
          }
        }
      }

      localStorage.setItem(config.STORAGE_KEY, JSON.stringify(data));
      console.log('[Form] Auto-saved to localStorage');
      return true;
    } catch (error) {
      console.error('[Form] Failed to save form data:', error);
      return false;
    }
  }

  /**
   * Restore form data from localStorage
   */
  function restoreFormData(formElement) {
    try {
      const stored = localStorage.getItem(config.STORAGE_KEY);
      if (!stored) return false;

      const data = JSON.parse(stored);

      // Check if data has expired
      if (data.expiresAt < Date.now()) {
        clearFormData();
        return false;
      }

      // Restore fields
      Object.keys(data.fields).forEach((fieldName) => {
        const element = document.querySelector(`[name="${fieldName}"]`);
        if (element) {
          const value = data.fields[fieldName];
          if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = value === 'on' || value === true;
          } else {
            element.value = Array.isArray(value) ? value[0] : value;
          }
        }
      });

      console.log('[Form] Restored from localStorage');
      return true;
    } catch (error) {
      console.error('[Form] Failed to restore form data:', error);
      return false;
    }
  }

  /**
   * Clear saved form data
   */
  function clearFormData() {
    localStorage.removeItem(config.STORAGE_KEY);
    sessionStorage.removeItem(config.SESSION_KEY);
    console.log('[Form] Form data cleared');
  }

  /**
   * Generate resume token for email/SMS link
   */
  function generateResumeToken() {
    const token = btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2, 15)
    }));
    sessionStorage.setItem(config.SESSION_KEY, token);
    return token;
  }

  /**
   * Create resume link for email
   */
  function getResumeLink(email) {
    const token = generateResumeToken();
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?resume=${token}&email=${encodeURIComponent(email)}`;
  }

  /**
   * Check if we have a resume request
   */
  function checkResumeRequest() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resume');
    const email = params.get('email');

    if (token && email) {
      console.log('[Form] Resume request detected');
      // Navigate to form and show resume banner
      showResumeBanner(email, token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  /**
   * Show resume banner with saved data
   */
  function showResumeBanner(email, token) {
    const banner = document.createElement('div');
    banner.className = 'resume-banner';
    banner.innerHTML = `
      <div class="resume-content">
        <i class="fas fa-history"></i>
        <div class="resume-text">
          <h4>Welcome back!</h4>
          <p>We found your previously saved application. Continue where you left off?</p>
        </div>
        <div class="resume-actions">
          <button class="btn-resume-yes">Continue</button>
          <button class="btn-resume-no">Start Fresh</button>
        </div>
      </div>
    `;

    document.body.insertBefore(banner, document.body.firstChild);

    banner.querySelector('.btn-resume-yes').addEventListener('click', () => {
      const form = document.getElementById('rentalApplication');
      if (form) {
        restoreFormData(form);
        banner.remove();
        notifyUser('Your saved data has been restored!', 'success');
      }
    });

    banner.querySelector('.btn-resume-no').addEventListener('click', () => {
      clearFormData();
      banner.remove();
      window.location.reload();
    });
  }

  /**
   * Handle online event
   */
  function handleOnline() {
    console.log('[Offline] Application is online');
    const offline = document.getElementById('offlineIndicator');
    if (offline) offline.style.display = 'none';
    
    notifyUser('You are back online!', 'success');
    checkForPendingSubmissions();
  }

  /**
   * Handle offline event
   */
  function handleOffline() {
    console.log('[Offline] Application is offline');
    const offline = document.getElementById('offlineIndicator');
    if (offline) offline.style.display = 'block';
    
    notifyUser('You are offline. Your data will be saved locally.', 'warning');
  }

  /**
   * Check for pending submissions and retry
   */
  function checkForPendingSubmissions() {
    if (!navigator.onLine) return;

    const pending = sessionStorage.getItem('pending_submission');
    if (!pending) return;

    console.log('[Offline] Found pending submission, attempting to send...');
    // This will be handled by the service worker or form submission handler
  }

  /**
   * Show user notification
   */
  function notifyUser(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    document.body.appendChild(notification);

    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, 5000);
  }

  /**
   * Enable periodic save
   */
  function enablePeriodicSave(formElement, interval = 30000) {
    if (!formElement) return;

    setInterval(() => {
      saveFormData(formElement);
    }, interval);

    // Save on form change
    formElement.addEventListener('change', () => {
      saveFormData(formElement);
    }, true);

    // Save on input (with debounce)
    let saveTimeout;
    formElement.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveFormData(formElement);
      }, 2000);
    }, true);
  }

  // Public API
  return {
    init: initializeOfflineSupport,
    save: saveFormData,
    restore: restoreFormData,
    clear: clearFormData,
    generateResumeToken,
    getResumeLink,
    checkResumeRequest,
    enablePeriodicSave,
    notifyUser
  };
})();

/**
 * Initialize offline manager on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  OfflineManager.init();
  OfflineManager.checkResumeRequest();

  const form = document.getElementById('rentalApplication');
  if (form) {
    OfflineManager.enablePeriodicSave(form, 30000);
    OfflineManager.restore(form);
  }
});
