# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-language support
- More card themes and animations
- Social sharing features
- Mobile app (React Native)
- Calendar integration
- Group cards with multiple contributors
- Video greeting cards
- Gift registry integration

## [1.2.0] - 2026-06-12

### Added
- **Media Library Page**: Complete redesign with full-page dedicated view
  - Beautiful gradient design with professional UI
  - Large, user-friendly upload zones
  - Responsive grid layout (2-5 columns based on screen size)
  - Seamless navigation flow from Card Editor
  - State preservation during navigation
  - Auto-return with selected media after selection
  - Search and filter capabilities
  - Audio preview with play/pause controls
  - Edit (rename) and delete functions
  - Usage statistics tracking
- Route `/media-library` with authentication protection
- Navigation integration in CardEditor with Library buttons
- SessionStorage-based media selection transfer

### Changed
- Media Library now uses full-page design instead of modal popup
- CardEditor navigates to dedicated page when Library button is clicked
- Improved mobile experience with full-screen layout
- Better visual feedback and hover effects

### Removed
- Old modal-based MediaLibrary component (replaced with page-based design)

## [1.1.0] - 2026-06-12

### Added
- **Media Library Feature**: Complete CRUD system for managing photos and voice notes
  - Upload and store photos (up to 5MB) and audio files (up to 10MB)
  - Grid view with thumbnails and audio preview
  - Search and filter by filename and media type
  - Rename media files with inline editing
  - Delete media with automatic Cloudinary cleanup
  - Usage tracking shows how many times each media item has been used
  - One-click media selection from library to reuse in cards
  - Seamless integration with Card Editor (Library buttons in photo and audio sections)
- Database schema for media library with user isolation
- API endpoints for full CRUD operations on media
- Media library modal component with responsive design
- Cloudinary service enhancement with delete functionality
- Migration script for media library table creation
- Comprehensive documentation (MEDIA_LIBRARY.md)

### Enhanced
- CardEditor now includes "Library" buttons for easy access to saved media
- Cloudinary service extended with media deletion support
- Server startup includes automatic media library table creation

## [1.0.0] - 2026-06-12

### Added
- 3D interactive birthday card creation
- Puzzle lock system for card unlocking
- Countdown timer for scheduled card reveals
- Audio message recording and playback
- Photo and video upload via Cloudinary
- AI assistant powered by Google Gemini
- Floating Bubu & Dudu character animations
- User authentication with JWT
- Email verification with OTP
- Contact management for birthdays
- Automated birthday reminder emails
- Admin dashboard for user management
- Review and rating system
- Responsive design for mobile and desktop
- Rate limiting on authentication endpoints
- Security headers with Helmet.js
- Background job processing with BullMQ
- Database schema with Drizzle ORM
- PostgreSQL database integration
- Redis queue for email delivery

### Security
- Password hashing with bcrypt
- JWT token authentication
- Email verification required
- Rate limiting on sensitive endpoints
- Secure file upload handling
- SQL injection protection
- XSS prevention with React

### Developer Experience
- TypeScript for type safety
- Hot module replacement in development
- Comprehensive environment variable setup
- Database migration scripts
- Admin user creation script
- User management CLI tools
- Code organization with clear structure

### Documentation
- Comprehensive README with setup instructions
- Contributing guidelines
- Security policy
- API endpoint documentation
- Environment variable documentation
- Deployment guide

## [0.1.0] - Initial Development

### Added
- Initial project setup
- Basic React frontend with Vite
- Express backend server
- Basic authentication flow
- Card creation prototype

---

## Release Notes

### Version 1.0.0

This is the first stable release of Birthday Bubu Wishes! 🎉

**Highlights:**
- Complete 3D card creation experience
- AI-powered content generation
- Secure user authentication
- Email notifications
- Admin management tools
- Production-ready deployment configuration

**Requirements:**
- Node.js 18+
- PostgreSQL database
- Redis server
- Cloudinary account
- Google Gemini API key
- SMTP email service

**Breaking Changes:**
None (initial release)

**Known Issues:**
- CSRF tokens not implemented yet
- 2FA not available
- Social sharing limited

**Migration Guide:**
Not applicable for initial release.

---

For detailed changes, see the [commit history](https://github.com/Dipendra2003/bubu-wishes/commits/main).
