# Changelog

All notable changes to Choice Properties Rental Application Platform.

## [Unreleased] - 2026-04-XX

### Added
- **Embeddable Widget System**: Landlords can now embed application forms on any website
  - Properties database with state-specific configuration
  - Dynamic `/embed` endpoint serving property-tailored forms
  - Admin widget generator (`widget-generator.html`) for easy code creation
  - Iframe-based embedding with security isolation
- **Complete Bilingual Support**: Full EN/ES localization
  - All 7 email templates bilingual with language-aware dispatch
  - Interface translations with persistent language preference
  - Locale-aware date formatting in communications
  - Translation-key based validation messages
- **Multi-Property Architecture**: Support for unlimited properties
  - Properties sheet with dynamic property management
  - Property ID tracking in applications
  - State-specific form adaptations (foundation)
- **Enhanced Security**: Additional layers of protection
  - Property ID sanitization and validation
  - Embed-specific security measures
  - Maintained CSRF, rate limiting, and input sanitization

### Changed
- **Email System**: All dispatch functions now language-aware
- **Form Logic**: Property data pre-filling for embedded forms
- **Backend Structure**: Multi-sheet Google Sheets architecture
- **Documentation**: Complete rewrite with embeddable widget instructions

### Technical
- Added `PROPERTIES_SHEET` constant and initialization
- New `doGet()` function with `/embed` route
- `serveEmbedForm()` function for dynamic form generation
- `setupPropertyData()` method in frontend
- Property ID submission tracking
- Widget generator and test pages

## [1.0.0] - 2026-03-XX

### Added
- Initial rental application form with 6-step process
- Google Apps Script backend with Google Sheets integration
- Email notification system (7 templates)
- Mobile-first responsive design
- Security features (CSRF, rate limiting, sanitization)
- Offline support and auto-save
- File upload with validation
- Progress tracking and user feedback

### Technical
- Vanilla HTML5/CSS3/JavaScript frontend
- GAS backend with dynamic column mapping
- Multi-step form with validation
- Email templates with HTML/CSS
- Security logging and audit trails