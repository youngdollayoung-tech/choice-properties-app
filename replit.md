# Choice Properties - Rental Application Platform

## Overview
A comprehensive rental application and property management SaaS platform. Features embeddable widgets for landlords, multi-property support, and complete bilingual (EN/ES) communication system.

## Architecture
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+), Mobile-first responsive
- **Backend:** Google Apps Script (`backend/code.gs`) — serverless, scalable
- **Database:** Google Sheets with dynamic multi-sheet architecture
- **Email System:** MailApp API with HTML templates (7 bilingual templates)
- **Security:** CSRF protection, rate limiting, input sanitization, GDPR compliance
- **CDN Libraries:** Font Awesome, Google Fonts, QRCode.js, Geoapify API

## Key Features
- **Embeddable Widgets:** Landlords can add application forms to any website
- **Multi-Property Support:** Unlimited properties across multiple states
- **Bilingual System:** Full EN/ES support for interface and communications
- **Professional Workflow:** Complete application-to-lease lifecycle
- **Mobile-First Design:** Responsive across all devices
- **Secure & Compliant:** Enterprise-grade security and data protection

## Project Structure
- `index.html` - Main application form
- `widget-generator.html` - Admin tool for generating embed codes
- `test-embed.html` - Testing page for embedded forms
- `backend/code.gs` - Google Apps Script backend
- `css/` - Stylesheets (mobile-first responsive)
- `js/` - Client-side JavaScript (no frameworks)
- `PROJECT_RULES.md` - System constraints and architecture contract
- `README.md` - Complete documentation

## Deployment
1. **Backend:** Deploy `backend/code.gs` as Google Apps Script Web App
2. **Frontend:** Host `index.html`, `css/`, `js/` on Cloudflare Pages
3. **Configuration:** Update backend URL in `js/script.js`

## Usage
- **Landlords:** Use widget generator to create embed codes for their websites
- **Applicants:** Complete embedded forms with property-specific details
- **Admins:** Manage all applications through centralized dashboard

## Development Notes
- **No Build Tools:** Pure static files, no npm/webpack required
- **No Server Runtime:** GAS handles all backend logic serverlessly
- **Mobile-First:** All design decisions start from mobile (≤480px)
- **Cross-Platform:** Works on any modern browser
- **Accessible:** WCAG compliant with ARIA labels and keyboard navigation

## Business Model
- SaaS platform for property managers
- Revenue through per-property subscriptions and per-application fees
- Scalable to unlimited properties and users

## Contact
- Email: choicepropertygroup@hotmail.com
- Phone: 707-706-3137 (TEXT ONLY)

## Project Layout
```
.
├── index.html       # Main entry point
├── css/style.css    # Mobile-first stylesheet
├── js/script.js     # Application logic
├── backend/code.gs  # Google Apps Script backend (deploy to Google separately)
└── PROJECT_RULES.md # Architecture constraints
```

## Running in Replit
- Served via Python's built-in HTTP server on port 5000
- Workflow: "Start application" → `python3 -m http.server 5000 --bind 0.0.0.0`

## Deployment
- Configured as a **static** deployment (no build step needed)
- `publicDir` is the project root (`.`)

## Key Constraints (from PROJECT_RULES.md)
- No npm, yarn, pip, or build tools allowed
- No frameworks (React, Vue, Tailwind, etc.)
- All external libraries via CDN only
- Mobile-first CSS (min-width media queries)
