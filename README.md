# Choice Properties - Rental Application Platform

A comprehensive, embeddable rental application system for property managers and landlords. Built for multi-state, multi-property operations with professional bilingual (EN/ES) communication.

## 🌟 Overview

Choice Properties is a SaaS platform that enables landlords and property managers to collect rental applications online. The system features:

- **Embeddable Widgets**: Landlords can add application forms to their websites with one line of code
- **Multi-Property Support**: Manage unlimited properties across different states
- **Bilingual Communication**: Full English/Spanish support for applicants and emails
- **Professional Workflow**: Complete application-to-lease lifecycle management
- **Secure & Compliant**: CSRF protection, data sanitization, GDPR-compliant consent tracking

## 🚀 Key Features

### For Landlords/Property Managers
- **One-Click Embedding**: Generate iframe code for any property listing
- **Property Management**: Add properties with state-specific details
- **Application Tracking**: Real-time dashboard of all applications
- **Automated Communications**: Professional emails in applicant's preferred language

### For Applicants
- **Mobile-First Design**: Responsive form that works on any device
- **Language Choice**: Complete EN/ES experience
- **Progress Tracking**: Visual progress bar and auto-save
- **Secure Submission**: Encrypted data transmission with file upload support

### For Administrators
- **Central Dashboard**: Manage all properties and applications
- **Bulk Operations**: Process multiple applications efficiently
- **Audit Trail**: Complete logging of all actions and communications
- **Multi-User Support**: Role-based access (admin, landlord, agent)

## 🛠️ Technical Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript (Mobile-first responsive)
- **Backend**: Google Apps Script (GAS) - Serverless, scalable
- **Database**: Google Sheets (Dynamic column mapping, multi-sheet architecture)
- **Email**: MailApp API with HTML templates
- **Security**: CSRF tokens, rate limiting, input sanitization
- **Deployment**: Cloudflare Pages (frontend) + GAS Web App (backend)

## 📋 Prerequisites

- Google Account (for GAS deployment)
- Cloudflare Account (for frontend hosting)
- Basic HTML knowledge (for embedding)

## 🚀 Quick Start

### 1. Deploy Backend (Google Apps Script)

1. Create a new Google Apps Script project
2. Copy `backend/code.gs` content
3. Deploy as Web App (Execute as: Me, Access: Anyone)
4. Note the deployment URL

### 2. Deploy Frontend (Cloudflare Pages)

1. Upload `index.html`, `css/`, `js/` to Cloudflare Pages
2. Update `BACKEND_URL` in `js/script.js` with your GAS URL
3. Deploy and note the frontend URL

### 3. Configure Properties

1. Open `widget-generator.html` in your browser
2. Add property details (address, rent, state, etc.)
3. Generate embed code for landlords

## 📖 Usage Guide

### For Landlords: Embedding the Form

1. **Generate Code**: Use the widget generator to create property-specific embed code
2. **Add to Website**: Paste the iframe code on your property listing page:
   ```html
   <iframe src="https://your-gas-url/exec?path=embed&propertyId=PROP001"
           width="100%" height="800" frameborder="0"></iframe>
   ```
3. **Customize**: The form automatically adapts to your property details

### For Applicants: Using the Form

1. **Access**: Visit the embedded form on landlord's website
2. **Language**: Choose English or Español
3. **Complete Steps**: 6-step process (Property, Residency, Employment, etc.)
4. **Submit**: Secure submission with confirmation email

### For Admins: Managing Applications

1. **Dashboard**: Access via GAS script URL with `?path=admin`
2. **Review**: Applications tagged by property and status
3. **Communicate**: Send status updates in applicant's language
4. **Process**: Move applications through approval workflow

## 📁 Project Structure

```
choice-properties-app/
├── index.html                 # Main application form
├── widget-generator.html      # Admin tool for embed codes
├── test-embed.html           # Testing page for embeds
├── PROJECT_RULES.md          # System constraints and architecture
├── backend/
│   └── code.gs               # Google Apps Script backend
├── css/
│   ├── style.css             # Main styles
│   └── phase2-enhancements.css # Additional styling
└── js/
    ├── script.js             # Main application logic
    ├── form-helpers.js       # Form utilities
    ├── security.js           # Security features
    └── offline-handler.js    # Offline support
```

## 🔧 Configuration

### Email Templates
All email templates are bilingual and located in `backend/code.gs`:
- `applicantConfirmation()` - Welcome and next steps
- `adminNotification()` - New application alert
- `paymentConfirmation()` - Payment receipt
- `statusUpdate()` - Approval/denial notifications
- `leaseSent()` - Lease delivery
- `leaseSignedTenant()` - Move-in instructions
- `leaseSignedAdmin()` - Lease execution alerts

### State-Specific Rules
Configure state laws in `backend/code.gs`:
- Deposit limits
- Notice periods
- Required disclosures
- Local regulations

### Security Settings
- Rate limiting: 5 submissions/hour per IP
- File upload: 10MB max, secure validation
- CSRF protection: Automatic token generation

## 🔒 Security & Compliance

- **Data Protection**: All PII encrypted in transit and at rest
- **GDPR Compliance**: Explicit consent tracking for data processing
- **Rate Limiting**: Prevents abuse and spam
- **Input Validation**: Comprehensive sanitization of all user inputs
- **Audit Logging**: Complete action history for compliance

## 🌍 Multi-Language Support

- **Interface**: Full EN/ES translation with persistent preference
- **Emails**: All communications in applicant's chosen language
- **Dates**: Locale-aware formatting (MM/DD/YYYY vs DD/MM/YYYY)
- **Validation**: Error messages in selected language

## 📊 Business Model

- **Revenue Streams**:
  - Per-property monthly subscription ($10-50/mo)
  - Per-application fee ($5-25)
  - Premium features (custom branding, advanced analytics)

- **Scalability**: Handles unlimited properties and applications
- **Support**: Email/phone support included

## 🐛 Troubleshooting

### Common Issues

**Form not loading in embed:**
- Check iframe `src` URL is correct
- Ensure GAS script is deployed and accessible
- Verify property ID exists in Properties sheet

**Emails not sending:**
- Check GAS script permissions
- Verify admin email settings in Settings sheet
- Review email logs in EmailLogs sheet

**Language not switching:**
- Clear browser cache
- Check localStorage for `choicePropertiesLanguage`

### Debug Mode

Add `?debug=true` to form URL for console logging.

## 🤝 Contributing

This project follows strict architectural constraints:
- No external dependencies (pure HTML/JS/GAS)
- Mobile-first responsive design
- Serverless backend only
- No Node.js or traditional servers

## 📄 License

Proprietary - Choice Properties LLC

## 📞 Support

- **Email**: choicepropertygroup@hotmail.com
- **Phone**: 707-706-3137 (TEXT ONLY)
- **Address**: 2265 Livernois, Suite 500, Troy, MI 48083

---

*Built for professional property management with enterprise-grade security and user experience.*