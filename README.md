# 🎉 Birthday Bubu Wishes - 3D Interactive Birthday Card App

<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  
  **Create magical, personalized 3D birthday cards with AI assistance**
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
</div>

---

## 📖 About

Birthday Bubu Wishes is a modern full-stack web application that allows users to create stunning 3D interactive birthday cards with personalized messages, photos, audio, and engaging animations featuring the adorable Bubu & Dudu characters. The app includes AI-powered assistance via Google Gemini for generating creative card content.

### ✨ Key Features

- 🎨 **3D Interactive Cards** - Beautiful animated cards with depth and interactivity
- 🔒 **Puzzle Lock System** - Recipients solve a puzzle to unlock their special card
- 📅 **Countdown Timer** - Set unlock dates for time-locked surprises
- 🎵 **Audio Messages** - Add personalized voice recordings or music
- 📸 **Media Upload** - Include photos and videos (Cloudinary integration)
- 🤖 **AI Assistant** - Gemini AI helps generate creative card content
- 🎈 **Floating Animations** - Delightful Bubu & Dudu character animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 👥 **Contact Management** - Save birthdays and manage contacts
- 🔐 **Secure Authentication** - JWT-based auth with email verification
- 📊 **Admin Dashboard** - User management and analytics
- ⭐ **Reviews System** - Users can leave feedback and reviews
- 📧 **Email Notifications** - Automated birthday reminders

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database (Neon)
- **Drizzle ORM** - Database toolkit
- **JWT** - Authentication
- **BullMQ** - Job queue for emails
- **Redis** - Queue backend

### External Services
- **Google Gemini AI** - AI-powered content generation
- **Cloudinary** - Media storage and CDN
- **Nodemailer** - Email delivery
- **Helmet** - Security middleware

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (recommend [Neon](https://neon.tech/))
- Redis server (for email queue)
- Cloudinary account
- Google Gemini API key
- SMTP email service (Gmail, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dipendra2003/bubu-wishes.git
   cd bubu-wishes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   APP_URL=http://localhost:3000
   JWT_SECRET=your_secure_jwt_secret
   DATABASE_URL=your_neon_postgres_url
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@yourdomain.com
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   REDIS_URL=redis://localhost:6379
   CRON_SECRET=your_cron_secret
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Create an admin user**
   ```bash
   npm run create:admin
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run clean` | Clean build artifacts |
| `npm run lint` | Type check with TypeScript |
| `npm run migrate` | Run database migrations |
| `npm run create:admin` | Create admin user |
| `npm run manage:users` | User management CLI |
| `npm run cleanup:users` | Clean up unused users |
| `npm run check:reviews` | Check reviews status |
| `npm run feature:review` | Feature review utility |

---

## 🗂️ Project Structure

```
bubu-&-dudu-3d-birthday-card/
├── src/
│   ├── components/
│   │   ├── pages/          # Page components
│   │   ├── layout/         # Layout components (Navbar, etc.)
│   │   └── ui/             # Reusable UI components
│   ├── server/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, rate limiting
│   │   ├── controllers/    # Request handlers
│   │   ├── queues/         # BullMQ job queues
│   │   └── workers/        # Background workers
│   ├── db/
│   │   ├── index.ts        # Database connection
│   │   └── schema.ts       # Drizzle schema
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── app/                    # Additional utilities
├── .env.example            # Environment template
├── server.ts               # Express server
├── vite.config.ts          # Vite configuration
├── drizzle.config.ts       # Drizzle ORM config
└── package.json            # Dependencies
```

---

## 🔐 Authentication Flow

1. User signs up with email and password
2. Email verification code is sent via SMTP
3. User enters OTP to verify account
4. JWT token is issued for authenticated sessions
5. Protected routes require valid JWT token

---

## 🎨 Features in Detail

### 3D Card Creation
- Choose from multiple themes and color schemes
- Add personalized text messages
- Upload photos, GIFs, or videos
- Record audio messages
- Set unlock conditions (puzzle or countdown)

### AI Assistant
- Powered by Google Gemini AI
- Generates creative greeting messages
- Suggests card themes and ideas
- Context-aware responses

### Contact Management
- Save friend and family birthdays
- Automatic birthday reminders
- Email notifications via scheduled jobs

### Admin Features
- User management dashboard
- Analytics and metrics
- Feature reviews
- System health monitoring

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend verification code
- `GET /api/auth/me` - Get current user

### Cards
- `GET /api/cards` - List user cards
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get card by ID
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Add contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews/featured` - Get featured reviews

### AI
- `POST /api/ai/chat` - Chat with AI assistant

---

## 🔧 Configuration

### Database Schema
The app uses PostgreSQL with Drizzle ORM. Main tables:
- `users` - User accounts
- `cards` - Birthday cards
- `contacts` - Saved birthdays
- `reviews` - User reviews

### Email Queue
BullMQ with Redis handles asynchronous email delivery:
- Email verification
- Birthday reminders
- System notifications

### Media Upload
Cloudinary handles all media uploads with:
- Unsigned upload preset for client-side uploads
- Secure API for server-side operations
- Automatic optimization and CDN delivery

---

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Recommended Platforms
- **Backend**: Railway, Render, Fly.io, or Google Cloud Run
- **Database**: Neon, Supabase, or Railway PostgreSQL
- **Redis**: Upstash, Redis Cloud, or Railway Redis
- **Frontend**: Vercel, Netlify (static export not recommended due to server integration)

### Environment Considerations
- Use secure JWT_SECRET in production
- Enable SSL/TLS for database connections
- Configure CORS appropriately
- Set up proper SMTP credentials
- Use production-ready Redis instance

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Bubu & Dudu** characters for the adorable theme
- **Google Gemini AI** for AI capabilities
- **Cloudinary** for media management
- **Neon** for PostgreSQL hosting
- **Open source community** for amazing tools and libraries

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [FAQ](#) page
2. Open an [issue](https://github.com/Dipendra2003/bubu-wishes/issues)
3. Contact via the [contact page](#)

---

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] More card themes and animations
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Group cards with multiple contributors
- [ ] Video greeting cards
- [ ] Gift registry integration

---

## 👨‍💻 Developer

**Dipendra** [@Dipendra2003](https://github.com/Dipendra2003)

---

<div align="center">
  Made with ❤️ by Dipendra
  
  **Give this project a ⭐ if you like it!**
  
  [![GitHub followers](https://img.shields.io/github/followers/Dipendra2003?style=social)](https://github.com/Dipendra2003)
  [![GitHub stars](https://img.shields.io/github/stars/Dipendra2003/bubu-wishes?style=social)](https://github.com/Dipendra2003/bubu-wishes)
</div>
