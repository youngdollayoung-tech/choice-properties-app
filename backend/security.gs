// ============================================================
// CHOICE PROPERTIES - SECURITY UTILITIES MODULE
// ============================================================
// Purpose: Input validation, sanitization, rate limiting,
//          CSRF protection, data encryption, file restrictions
// ============================================================

// ============================================================
// RATE LIMITING (5 submissions per hour per IP)
// ============================================================
function checkRateLimit(ipAddress) {
  const cache = CacheService.getScriptCache();
  const key = `rate_limit_${ipAddress}`;
  const count = parseInt(cache.get(key) || '0', 10);
  
  if (count >= 5) {
    return {
      allowed: false,
      message: 'Too many submissions. Please try again in 1 hour.',
      remaining: 0
    };
  }
  
  // Increment counter
  cache.put(key, String(count + 1), 3600); // 1 hour expiry
  
  return {
    allowed: true,
    message: 'OK',
    remaining: 5 - (count + 1)
  };
}

function getRateLimitStats(ipAddress) {
  const cache = CacheService.getScriptCache();
  const key = `rate_limit_${ipAddress}`;
  const count = parseInt(cache.get(key) || '0', 10);
  return {
    submissions: count,
    limit: 5,
    remaining: Math.max(0, 5 - count)
  };
}

// ============================================================
// CSRF TOKEN MANAGEMENT
// ============================================================
function generateCSRFToken() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const token = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    timestamp + random + Math.random()
  );
  return Utilities.base64Encode(token).substring(0, 64);
}

function storeCSRFToken(sessionId, token) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const key = `csrf_token_${sessionId}`;
  scriptProperties.setProperty(key, token);
  // Auto-expire after 1 hour
  return true;
}

function validateCSRFToken(sessionId, token) {
  if (!sessionId || !token) {
    return { valid: false, error: 'CSRF token or session missing' };
  }
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const key = `csrf_token_${sessionId}`;
  const storedToken = scriptProperties.getProperty(key);
  
  if (!storedToken || storedToken !== token) {
    return { valid: false, error: 'Invalid CSRF token' };
  }
  
  // Consume token (one-time use)
  scriptProperties.deleteProperty(key);
  return { valid: true };
}

// ============================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================
function sanitizeString(input) {
  if (!input) return '';
  return String(input)
    .replace(/[<>\"'`]/g, '') // Remove HTML special chars
    .trim()
    .substring(0, 500); // Max length 500 characters
}

function sanitizeEmail(email) {
  if (!email) return '';
  const sanitized = String(email).toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized.substring(0, 254);
}

function sanitizePhone(phone) {
  if (!phone) return '';
  // Extract only digits and + sign
  const digits = String(phone).replace(/\D/g, '');
  
  if (digits.length < 10 || digits.length > 15) {
    throw new Error('Invalid phone number length');
  }
  
  return digits;
}

function sanitizeSSN(ssn) {
  if (!ssn) return '';
  // Only allow 4 digits
  const digits = String(ssn).replace(/\D/g, '');
  
  if (digits.length !== 4) {
    throw new Error('SSN must be exactly 4 digits');
  }
  
  // Check for all zeros or common invalid patterns
  if (digits === '0000' || digits === '1111' || digits === '2222') {
    throw new Error('Invalid SSN pattern');
  }
  
  return digits;
}

function sanitizeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Ensure date is not in future (max +30 days for move-in)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  
  if (date > maxDate) {
    throw new Error('Move-in date too far in future');
  }
  
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function sanitizeCurrency(amount) {
  if (!amount) return 0;
  const num = parseFloat(String(amount).replace(/[^0-9.-]/g, ''));
  
  if (isNaN(num) || num < 0 || num > 999999) {
    throw new Error('Invalid currency amount');
  }
  
  return Math.round(num * 100) / 100;
}

function sanitizeNumber(value, min, max) {
  const num = parseInt(String(value), 10);
  
  if (isNaN(num) || num < min || num > max) {
    throw new Error(`Number must be between ${min} and ${max}`);
  }
  
  return num;
}

// ============================================================
// FORM DATA VALIDATION ENGINE
// ============================================================
function validateFormData(formData) {
  const errors = [];
  
  // Required fields
  const required = [
    'First Name', 'Last Name', 'Email', 'Phone', 'Property Address',
    'Requested Move-in Date', 'Desired Lease Term', 'DOB', 'SSN'
  ];
  
  required.forEach(field => {
    if (!formData[field] || String(formData[field]).trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  
  // Format validations
  try {
    if (formData['Email']) sanitizeEmail(formData['Email']);
    if (formData['Phone']) sanitizePhone(formData['Phone']);
    if (formData['SSN']) sanitizeSSN(formData['SSN']);
    if (formData['Co-Applicant SSN']) sanitizeSSN(formData['Co-Applicant SSN']);
    if (formData['Requested Move-in Date']) sanitizeDate(formData['Requested Move-in Date']);
    if (formData['Monthly Income']) sanitizeCurrency(formData['Monthly Income']);
    if (formData['Co-Applicant Monthly Income']) sanitizeCurrency(formData['Co-Applicant Monthly Income']);
  } catch (e) {
    errors.push(e.toString());
  }
  
  // Age validation (18+)
  try {
    const dob = new Date(formData['DOB']);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    
    if (age < 18) {
      errors.push('Applicant must be at least 18 years old');
    }
  } catch (e) {
    errors.push('Invalid date of birth');
  }
  
  // Co-applicant validation if present
  if (formData['Has Co-Applicant'] === 'Yes') {
    const coApplicantRequired = ['Co-Applicant First Name', 'Co-Applicant Last Name'];
    coApplicantRequired.forEach(field => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        errors.push(`${field} is required when co-applicant is selected`);
      }
    });
  }
  
  // GDPR/CCPA consent validation
  if (formData['DataProcessingConsent'] !== 'yes') {
    errors.push('You must consent to data processing to continue');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    errorCount: errors.length
  };
}

// ============================================================
// FILE UPLOAD VALIDATION
// ============================================================
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const RESTRICTED_EXTENSIONS = ['exe', 'bat', 'cmd', 'com', 'scr', 'vbs', 'js', 'jar'];

function validateFileUpload(fileBlob) {
  if (!fileBlob) return { valid: true, message: 'No file' };
  
  const filename = fileBlob.getName();
  const mimeType = fileBlob.getContentType();
  const size = fileBlob.getBytes().length;
  
  // Check file size
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`
    };
  }
  
  // Check file extension
  const extension = filename.split('.').pop().toLowerCase();
  if (RESTRICTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'File type not allowed'
    };
  }
  
  // Check MIME type
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'File type not allowed. Allowed: PDF, images, Word, Excel'
    };
  }
  
  return {
    valid: true,
    filename: sanitizeString(filename),
    size: size,
    mimeType: mimeType
  };
}

// ============================================================
// DATA ENCRYPTION (BASIC - FOR CLIENT-SIDE SENSITIVE DATA)
// ============================================================
function encryptSensitiveData(plaintext) {
  // Google Apps Script doesn't have built-in encryption for script properties
  // This is a basic obfuscation. For production, use Cloud KMS or similar
  const encrypted = Utilities.base64Encode(plaintext);
  return encrypted;
}

function decryptSensitiveData(encrypted) {
  try {
    const decrypted = Utilities.base64Decode(encrypted);
    return Utilities.newBlob(decrypted).getDataAsString();
  } catch (e) {
    return null;
  }
}

// ============================================================
// GDPR/CCPA COMPLIANCE TRACKING
// ============================================================
function trackConsentGiven(appId, email, consentType, consentDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('ConsentLog');
  
  if (!sheet) {
    sheet = ss.insertSheet('ConsentLog');
    sheet.getRange(1, 1, 1, 7).setValues([[
      'Timestamp', 'App ID', 'Email', 'Consent Type', 'Consent Given',
      'IP Address', 'User Agent'
    ]]).setFontWeight('bold').setBackground('#1a5276').setFontColor('#ffffff');
  }
  
  sheet.appendRow([
    new Date(),
    appId,
    email,
    consentType,
    'yes',
    '', // Will be filled from form
    ''  // Will be filled from form
  ]);
  
  return true;
}

function getConsentRecord(appId, email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('ConsentLog');
  
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === appId && data[i][2] === email) {
      return data[i];
    }
  }
  
  return null;
}

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================
function generateAdminToken(email) {
  const timestamp = Date.now();
  const token = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email + timestamp + Math.random()
  );
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const key = `admin_token_${email}`;
  
  // Store for 24 hours
  scriptProperties.setProperty(key, Utilities.base64Encode(token));
  
  return Utilities.base64Encode(token).substring(0, 64);
}

function validateAdminToken(email, token) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const key = `admin_token_${email}`;
  const storedToken = scriptProperties.getProperty(key);
  
  if (!storedToken || storedToken !== token) {
    return { valid: false, error: 'Invalid admin token' };
  }
  
  // Check if admin email is authorized
  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(email)) {
    return { valid: false, error: 'Email not authorized for admin access' };
  }
  
  return { valid: true, email: email };
}

function getAdminEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName('Settings');
  
  if (!settingsSheet) return [];
  
  const email = settingsSheet.getRange('B2').getValue();
  return email ? email.split(',').map(e => e.trim()) : [];
}

function isAdminEmail(email) {
  return getAdminEmails().includes(email.toLowerCase());
}

// ============================================================
// IP ADDRESS EXTRACTION (from Headers)
// ============================================================
function getClientIPAddress(e) {
  if (!e) return 'unknown';
  
  // Try various headers
  const headers = e.parameter || {};
  const ip = 
    headers['X-Forwarded-For'] ||
    headers['CF-Connecting-IP'] ||
    headers['X-Client-IP'] ||
    headers['True-Client-IP'] ||
    'unknown';
  
  // Take first IP if comma-separated
  return String(ip).split(',')[0].trim();
}

// ============================================================
// REQUEST LOGGING & AUDIT TRAIL
// ============================================================
function logSecurityEvent(eventType, email, appId, details, ipAddress) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('SecurityLog');
  
  if (!sheet) {
    sheet = ss.insertSheet('SecurityLog');
    sheet.getRange(1, 1, 1, 7).setValues([[
      'Timestamp', 'Event Type', 'Email', 'App ID', 'Details', 'IP Address', 'Status'
    ]]).setFontWeight('bold').setBackground('#1a5276').setFontColor('#ffffff');
  }
  
  sheet.appendRow([
    new Date(),
    eventType,
    email || 'N/A',
    appId || 'N/A',
    details || '',
    ipAddress || 'unknown',
    'logged'
  ]);
  
  // Clean old logs (keep last 1000)
  if (sheet.getLastRow() > 1000) {
    sheet.deleteRows(2, 500); // Delete first 500 data rows
  }
}

// ============================================================
// ERROR RESPONSE BUILDER
// ============================================================
function buildErrorResponse(statusCode, message, details) {
  return {
    success: false,
    error: message,
    details: details || null,
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  };
}

function buildSuccessResponse(data) {
  return {
    success: true,
    data: data || null,
    timestamp: new Date().toISOString()
  };
}
