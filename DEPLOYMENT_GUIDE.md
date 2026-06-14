# 🚀 Birthday Reminder System - Deployment Guide

## Quick Start

### 1. Prerequisites Check

```bash
# Check Node.js version (requires 18+)
node --version

# Check npm version
npm --version

# Check if Redis is accessible
redis-cli ping  # Should return "PONG"

# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"
```

### 2. Install Dependencies

```bash
cd /path/to/bubu-&-dudu-3d-birthday-card
npm install
```

### 3. Environment Configuration

Create or update `.env` file:

```env
# Database
DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require

# Redis (Required for scheduler)
REDIS_URL=redis://your-redis-host:6379
# Or for Redis Cloud: redis://default:password@host:port

# SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# Security
JWT_SECRET=your_secure_random_string_here
CRON_SECRET=another_secure_random_string

# Application
APP_URL=https://yourdomain.com
NODE_ENV=production

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 4. Database Migration

The schema will auto-create on server startup, but you can also run manually:

```bash
# Option 1: Auto-migration (recommended)
npm run dev  # Schema creates automatically

# Option 2: Manual migration
npm run db:push
```

Verify tables created:
```sql
\dt  -- List all tables
-- Should see: user_preferences, reminder_history, email_logs, card_share_tokens
```

### 5. Build for Production

```bash
npm run build
```

This creates:
- `dist/server.cjs` - Production server bundle
- `dist/` - Frontend static assets

### 6. Start Production Server

```bash
npm start
```

Expected console output:
```
Server running on http://localhost:3000
✅ Birthday reminder scheduler initialized (runs every hour)
📅 Next check will process all timezones and send reminders accordingly
🎂 Initial birthday check queued for immediate processing
✅ Birthday reminder worker started
✅ Email worker started
```

---

## Verification Steps

### Step 1: Check Scheduler Status

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/scheduler-status
```

Expected response:
```json
{
  "enabled": true,
  "repeatableJobs": 1,
  "waiting": 0,
  "active": 0,
  "completed": 0,
  "failed": 0,
  "schedule": [
    {
      "key": "birthday-reminder-hourly-check",
      "pattern": "0 * * * *",
      "next": 1718294400000
    }
  ]
}
```

### Step 2: Test Email Sending

```bash
# Trigger manual birthday check
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/send-birthday-reminders
```

### Step 3: Verify Database Tables

```sql
-- Check tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_preferences', 'reminder_history', 'email_logs', 'card_share_tokens');

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'cards', 'reminder_history');
```

### Step 4: Create Test User and Contact

Via UI or database:
```sql
-- Get your user ID
SELECT id, name, email FROM users WHERE email = 'your@email.com';

-- Add test contact with birthday tomorrow
INSERT INTO contacts (user_id, name, birthday, email)
VALUES (
  'YOUR_USER_ID',
  'Test Friend',
  CURRENT_DATE + INTERVAL '1 day',
  'friend@example.com'
);
```

### Step 5: Test Reminder Flow

```bash
# Trigger check
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/send-birthday-reminders

# Check results
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/scheduler-status
```

Check email inbox for reminder email!

---

## Production Hosting Options

### Option 1: Railway (Recommended)

**Pros:** Easy deployment, managed Redis + PostgreSQL, auto-scaling  
**Cost:** ~$5-20/month

**Steps:**
1. Create Railway account
2. Create new project
3. Add PostgreSQL service
4. Add Redis service
5. Deploy from GitHub
6. Set environment variables
7. Done!

### Option 2: Render

**Pros:** Free tier available, managed database  
**Cost:** Free - $25/month

**Steps:**
1. Create Render account
2. Create Web Service from GitHub
3. Add PostgreSQL (managed)
4. Add Redis (via Upstash or managed)
5. Set environment variables
6. Deploy

### Option 3: AWS / GCP / Azure

**Pros:** Full control, enterprise-grade  
**Cost:** $50-500/month

**Services Needed:**
- EC2/Compute Engine/App Service (Node.js server)
- RDS/Cloud SQL (PostgreSQL)
- ElastiCache/Memorystore (Redis)
- SES/SendGrid (Email)
- CloudWatch/Logging (Monitoring)

### Option 4: Docker + Self-Hosted

**Docker Compose Setup:**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/bubu
      REDIS_URL: redis://redis:6379
      # ... other env vars
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: your_password
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Deploy:
```bash
docker-compose up -d
```

---

## Email Provider Setup

### SendGrid (Recommended)

**Why:** 100 emails/day free, 99% delivery rate, great API

**Setup:**
1. Create SendGrid account
2. Verify sender domain
3. Create API key
4. Update .env:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

### AWS SES

**Why:** $0.10 per 1000 emails, reliable

**Setup:**
1. Verify domain in SES
2. Get SMTP credentials
3. Update .env:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### Gmail (Development Only)

**Limitations:** 500 emails/day, may get blocked

**Setup:**
1. Enable 2FA on Google account
2. Generate App Password
3. Update .env:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_16_char_app_password
```

---

## Redis Setup

### Upstash (Recommended for Serverless)

**Why:** Serverless, pay-per-request, free tier

**Setup:**
1. Create Upstash account
2. Create Redis database
3. Copy connection string
4. Update .env:
```env
REDIS_URL=rediss://default:password@host.upstash.io:port
```

### Redis Cloud

**Why:** Managed, reliable, auto-scaling

**Setup:**
1. Create Redis Cloud account
2. Create database
3. Get connection URL
4. Update .env

### Self-Hosted Redis

```bash
# Install Redis
sudo apt install redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Test connection
redis-cli ping
```

.env:
```env
REDIS_URL=redis://localhost:6379
```

---

## Monitoring Setup

### Health Check Endpoint

Add to your monitoring service:
```
URL: https://yourdomain.com/api/cron/scheduler-status
Method: GET
Headers: Authorization: Bearer YOUR_CRON_SECRET
Expected: HTTP 200, enabled: true
Check Interval: 5 minutes
```

### Log Monitoring

**What to Monitor:**
- "✅ Birthday reminder scheduler initialized" - Scheduler started
- "🎂 Processing birthday reminders" - Job running
- "✅ Birthday check complete" - Job success
- "❌ Birthday reminder job failed" - Job failure
- "Failed to send reminder" - Email failure

**Tools:**
- Railway Logs (built-in)
- CloudWatch Logs (AWS)
- Logtail / Papertrail (external)

### Email Monitoring

**SQL Query for Daily Stats:**
```sql
SELECT 
  email_type,
  status,
  COUNT(*) as count,
  DATE(created_at) as date
FROM email_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY email_type, status, DATE(created_at)
ORDER BY date DESC;
```

### Alerts

Set up alerts for:
- Scheduler stopped (no jobs completed in 2 hours)
- High email failure rate (>10% failed)
- Redis connection lost
- Database errors

---

## Performance Tuning

### Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM contacts 
WHERE user_id = 'some-id'
AND birthday = CURRENT_DATE;

-- Vacuum regularly
VACUUM ANALYZE;

-- Update statistics
ANALYZE contacts, cards, reminder_history;
```

### Redis Optimization

```redis
# Check memory usage
INFO memory

# Set max memory
CONFIG SET maxmemory 256mb
CONFIG SET maxmemory-policy allkeys-lru
```

### BullMQ Configuration

Increase concurrency if needed:
```typescript
// src/server/workers/birthdayWorker.ts
birthdayWorker = new Worker("birthday-reminders", async (job: Job) => {
  // ...
}, { 
  connection: connection as any,
  concurrency: 3  // Process 3 jobs in parallel
});
```

---

## Scaling Guide

### 0-1K Users (Current Setup)
- Single server
- Hourly checks
- Current configuration works

### 1K-10K Users
- Add monitoring (DataDog, New Relic)
- Switch to SendGrid/SES
- Consider Redis Cluster
- Add database read replica

### 10K-100K Users
- Separate worker servers
- Multiple BullMQ workers
- Database connection pooling
- CDN for static assets
- Email rate limiting

### 100K+ Users
- Microservices architecture
- Dedicated reminder service
- Horizontal scaling
- Advanced queue management
- Multi-region deployment

---

## Troubleshooting

### "Scheduler not initialized"

**Cause:** Redis not connected

**Fix:**
1. Check REDIS_URL in .env
2. Test Redis connection: `redis-cli -u $REDIS_URL ping`
3. Check firewall rules
4. Verify Redis service running

### "Email not sending"

**Cause:** SMTP configuration issue

**Fix:**
1. Check SMTP credentials in .env
2. Test SMTP connection:
```bash
npm install -g nodemailer
```

Create test-smtp.js:
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.verify().then(console.log).catch(console.error);
```

### "Reminders sending multiple times"

**Cause:** Multiple server instances or database issue

**Fix:**
1. Ensure only one server instance running
2. Check reminder_history for duplicates
3. Verify database transactions

### "Wrong timezone"

**Cause:** User timezone not set

**Fix:**
1. Update user timezone in profile
2. Update user_preferences timezone
3. Test with manual trigger

---

## Backup & Recovery

### Database Backup

```bash
# Automated daily backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20260613.sql
```

### Redis Backup

Redis persistence is enabled by default (RDB + AOF).

Manual backup:
```bash
redis-cli BGSAVE
```

### Disaster Recovery

1. **Server Down:** Auto-restarts via hosting platform
2. **Database Down:** Use read replica, restore from backup
3. **Redis Down:** Jobs resume when Redis reconnects
4. **Email Provider Down:** Retry queue holds jobs for 24 hours

---

## Security Checklist

- [ ] CRON_SECRET is random and secure (32+ characters)
- [ ] JWT_SECRET is random and secure (32+ characters)
- [ ] Database uses SSL connection
- [ ] Redis uses password authentication
- [ ] SMTP credentials are app-specific passwords
- [ ] Environment variables not committed to Git
- [ ] .env file in .gitignore
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Regular security updates (npm audit)

---

## Maintenance Schedule

### Daily
- Monitor scheduler status
- Check email delivery rates
- Review error logs

### Weekly
- Review reminder_history trends
- Check Redis memory usage
- Test manual trigger

### Monthly
- Update dependencies: `npm update`
- Review and optimize database queries
- Clean old email_logs (optional)
- Analyze user engagement

### Quarterly
- Security audit: `npm audit`
- Performance review
- Backup verification test
- Disaster recovery drill

---

## Support Resources

- **Documentation:** BIRTHDAY_REMINDER_SYSTEM.md
- **Testing Guide:** TESTING_BIRTHDAY_REMINDERS.md
- **Implementation:** IMPLEMENTATION_SUMMARY.md
- **GitHub Issues:** Report bugs and features
- **Email:** support@yourdomain.com

---

## Success! 🎉

Your Birthday Reminder System is now deployed and ready to help users never miss a birthday!

**Next Steps:**
1. Monitor first automated run (within 1 hour)
2. Check first reminder email delivery
3. Review user feedback
4. Iterate and improve

**Happy Deploying! 🚀**
