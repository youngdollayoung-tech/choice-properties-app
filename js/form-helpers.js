/**
 * Choice Properties - Form Preview & Helper Features
 * Purpose: Preview application before submission, contextual help, loading states
 */

const FormHelper = (() => {
  /**
   * Generate form preview from current data
   */
  function generatePreview() {
    const form = document.getElementById('rentalApplication');
    if (!form) return null;

    const formData = new FormData(form);
    const preview = {
      applicantInfo: {},
      residencyInfo: {},
      employmentInfo: {},
      referencesInfo: {},
      paymentsInfo: {},
      preferencesInfo: {}
    };

    // Extract and group data
    for (let [key, value] of formData) {
      if (key.startsWith('First Name') || key.startsWith('Last Name') || 
          key.startsWith('Email') || key.startsWith('Phone') || 
          key.startsWith('DOB') || key.startsWith('SSN') ||
          key.startsWith('Property')) {
        preview.applicantInfo[key] = value;
      } else if (key.startsWith('Current') || key.startsWith('Residency')) {
        preview.residencyInfo[key] = value;
      } else if (key.startsWith('Employment') || key.startsWith('Employer') || 
                 key.startsWith('Job') || key.startsWith('Monthly Income') ||
                 key.startsWith('Supervisor')) {
        preview.employmentInfo[key] = value;
      } else if (key.startsWith('Reference')) {
        preview.referencesInfo[key] = value;
      } else if (key.includes('Payment')) {
        preview.paymentsInfo[key] = value;
      } else if (key === 'Preferred Contact Method' || key === 'Preferred Time') {
        preview.preferencesInfo[key] = value;
      }
    }

    return preview;
  }

  /**
   * Show form preview modal
   */
  function showPreview() {
    const preview = generatePreview();
    if (!preview) return;

    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.id = 'formPreviewModal';

    let html = `
      <div class="preview-overlay"></div>
      <div class="preview-container">
        <div class="preview-header">
          <h2><i class="fas fa-eye"></i> Application Preview</h2>
          <button class="preview-close" onclick="document.getElementById('formPreviewModal').remove();">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="preview-content">
    `;

    // Applicant Info
    if (Object.keys(preview.applicantInfo).length > 0) {
      html += `<div class="preview-section">
        <h3><i class="fas fa-user"></i> Applicant Information</h3>
        <div class="preview-grid">`;
      for (let [key, value] of Object.entries(preview.applicantInfo)) {
        if (value && key !== 'SSN') { // Don't show SSN in preview
          html += `<div class="preview-item">
            <span class="preview-label">${key}:</span>
            <span class="preview-value">${value.substring(0, 50)}${value.length > 50 ? '...' : ''}</span>
          </div>`;
        }
      }
      html += `</div></div>`;
    }

    // Residency Info
    if (Object.keys(preview.residencyInfo).length > 0) {
      html += `<div class="preview-section">
        <h3><i class="fas fa-home"></i> Residency Information</h3>
        <div class="preview-grid">`;
      for (let [key, value] of Object.entries(preview.residencyInfo)) {
        if (value) {
          html += `<div class="preview-item">
            <span class="preview-label">${key}:</span>
            <span class="preview-value">${value.substring(0, 50)}${value.length > 50 ? '...' : ''}</span>
          </div>`;
        }
      }
      html += `</div></div>`;
    }

    // Employment Info
    if (Object.keys(preview.employmentInfo).length > 0) {
      html += `<div class="preview-section">
        <h3><i class="fas fa-briefcase"></i> Employment Information</h3>
        <div class="preview-grid">`;
      for (let [key, value] of Object.entries(preview.employmentInfo)) {
        if (value) {
          html += `<div class="preview-item">
            <span class="preview-label">${key}:</span>
            <span class="preview-value">${value.substring(0, 50)}${value.length > 50 ? '...' : ''}</span>
          </div>`;
        }
      }
      html += `</div></div>`;
    }

    // Payment Methods
    if (Object.keys(preview.paymentsInfo).length > 0) {
      html += `<div class="preview-section">
        <h3><i class="fas fa-credit-card"></i> Payment Methods</h3>
        <div class="preview-grid">`;
      for (let [key, value] of Object.entries(preview.paymentsInfo)) {
        if (value) {
          html += `<div class="preview-item">
            <span class="preview-label">${key}:</span>
            <span class="preview-value">${value.substring(0, 50)}${value.length > 50 ? '...' : ''}</span>
          </div>`;
        }
      }
      html += `</div></div>`;
    }

    html += `
        </div>
        <div class="preview-footer">
          <p class="preview-note"><i class="fas fa-info-circle"></i> Review your information above. Click "Edit" to make changes or "Submit" to continue.</p>
          <div class="preview-actions">
            <button class="btn-preview-edit" onclick="document.getElementById('formPreviewModal').remove();">
              <i class="fas fa-edit"></i> Edit Application
            </button>
            <button class="btn-preview-submit" onclick="document.getElementById('formPreviewModal').remove(); document.getElementById('rentalApplication').dispatchEvent(new Event('submit'));">
              <i class="fas fa-paper-plane"></i> Confirm & Submit
            </button>
          </div>
        </div>
      </div>
    `;

    modal.innerHTML = html;
    document.body.appendChild(modal);

    // Close on background click
    modal.querySelector('.preview-overlay').addEventListener('click', () => {
      modal.remove();
    });
  }

  /**
   * Add contextual help tooltips
   */
  function addTooltips() {
    const tooltips = {
      'propertyAddress': 'Enter the full address of the property you are applying for, including city, state, and zip code.',
      'requestedMoveIn': 'The date you plan to move into the property. Must be at least 7 days from today.',
      'desiredLeaseTerm': 'How long you want to rent the property. Common options are 6, 12, or 24 months.',
      'email': 'A valid email address where we can contact you. Please ensure this is correct.',
      'phone': 'Your primary phone number. We may text or call you at this number.',
      'ssn': 'We only need the last 4 digits of your Social Security Number for verification.',
      'dob': 'Your date of birth. Must be 18 years or older to apply.',
      'monthlyIncome': 'Your gross monthly income from your primary job. Include overtime and bonuses.',
      'monthlyRent': 'How much rent you can afford per month. This helps us match you with suitable properties.',
      'hasCoApplicant': 'Check this if you have a co-applicant or guarantor to include in the application.',
      'hasEvicted': 'Have you ever been evicted from a rental property?',
      'hasPets': 'Do you have any pets? Pets may require additional deposits.',
      'smoker': 'Non-smoking properties have stricter policies on smoking.',
      'primaryPayment': 'Your preferred method to pay rent. We support multiple payment options.'
    };

    Object.keys(tooltips).forEach((fieldId) => {
      const element = document.getElementById(fieldId);
      if (element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'form-tooltip';
        tooltip.innerHTML = `
          <button type="button" class="tooltip-trigger" title="Click for more info">
            <i class="fas fa-question-circle"></i>
          </button>
          <div class="tooltip-content">
            <p>${tooltips[fieldId]}</p>
          </div>
        `;

        const parent = element.parentElement;
        parent.appendChild(tooltip);

        tooltip.querySelector('.tooltip-trigger').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          tooltip.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
          if (!tooltip.contains(e.target) && !element.contains(e.target)) {
            tooltip.classList.remove('active');
          }
        });
      }
    });
  }

  /**
   * Create loading skeleton for form sections
   */
  function createLoadingSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'loading-skeleton';
    skeleton.innerHTML = `
      <div class="skeleton-item skeleton-title"></div>
      <div class="skeleton-group">
        <div class="skeleton-item skeleton-field"></div>
        <div class="skeleton-item skeleton-field"></div>
      </div>
      <div class="skeleton-group">
        <div class="skeleton-item skeleton-field"></div>
        <div class="skeleton-item skeleton-field"></div>
      </div>
    `;
    return skeleton;
  }

  /**
   * Show loading state
   */
  function showLoading(message = 'Loading...') {
    const loading = document.createElement('div');
    loading.className = 'page-loading';
    loading.id = 'pageLoading';
    loading.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-message">${message}</p>
      </div>
    `;
    document.body.appendChild(loading);
  }

  /**
   * Hide loading state
   */
  function hideLoading() {
    const loading = document.getElementById('pageLoading');
    if (loading) {
      loading.classList.add('fade-out');
      setTimeout(() => loading.remove(), 300);
    }
  }

  /**
   * Show form error with animation
   */
  function showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error-toast';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(errorDiv);

    // Highlight field
    field.classList.add('field-error');
    field.focus();

    setTimeout(() => {
      errorDiv.classList.add('fade-out');
      setTimeout(() => {
        errorDiv.remove();
        field.classList.remove('field-error');
      }, 300);
    }, 3000);
  }

  /**
   * Initialize all helper features
   */
  function initialize() {
    addTooltips();
    setupPreviewButton();
  }

  /**
   * Setup preview button in submit section
   */
  function setupPreviewButton() {
    const submitBtn = document.getElementById('mainSubmitBtn');
    if (submitBtn) {
      const previewBtn = document.createElement('button');
      previewBtn.type = 'button';
      previewBtn.className = 'btn-preview';
      previewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview Application';
      previewBtn.style.marginRight = '10px';

      previewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showPreview();
      });

      submitBtn.parentElement.insertBefore(previewBtn, submitBtn);
    }
  }

  // Public API
  return {
    generatePreview,
    showPreview,
    addTooltips,
    createLoadingSkeleton,
    showLoading,
    hideLoading,
    showValidationError,
    initialize
  };
})();

/**
 * Initialize form helpers on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  FormHelper.initialize();
});
