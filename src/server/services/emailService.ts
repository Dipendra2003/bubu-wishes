import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Enhanced email template matching the project UI theme
const getEmailTemplate = (content: string, title: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${preheader ? `<!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->` : ''}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-wrapper {
      width: 100%;
      background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%);
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(236, 72, 153, 0.15);
    }
    
    .email-header {
      background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .email-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 3s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }
    
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }
    
    .logo-icon {
      background: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .logo-text {
      font-size: 28px;
      font-weight: 800;
      color: white;
      text-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .email-title {
      font-size: 22px;
      font-weight: 700;
      color: white;
      margin: 0;
      position: relative;
      z-index: 1;
    }
    
    .email-body {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px 0;
    }
    
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0 0 24px 0;
      font-weight: 500;
    }
    
    .otp-container {
      background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%);
      border: 3px dashed #ec4899;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    
    .otp-label {
      font-size: 14px;
      font-weight: 600;
      color: #ec4899;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 12px 0;
    }
    
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      color: #ec4899;
      letter-spacing: 8px;
      margin: 0;
      text-shadow: 0 2px 4px rgba(236, 72, 153, 0.1);
    }
    
    .otp-expiry {
      font-size: 13px;
      color: #9ca3af;
      margin: 12px 0 0 0;
      font-weight: 600;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 100px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
      transition: all 0.3s ease;
      margin: 8px 0;
    }
    
    .cta-button:hover {
      box-shadow: 0 12px 32px rgba(236, 72, 153, 0.4);
      transform: translateY(-2px);
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #fce7f3, transparent);
      margin: 32px 0;
    }
    
    .footer {
      background: #fafafa;
      padding: 32px 30px;
      text-align: center;
      border-top: 1px solid #fce7f3;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin: 8px 0;
      font-weight: 500;
    }
    
    .footer-links {
      margin: 16px 0;
    }
    
    .footer-link {
      color: #ec4899;
      text-decoration: none;
      font-weight: 600;
      margin: 0 12px;
      font-size: 13px;
    }
    
    .footer-link:hover {
      text-decoration: underline;
    }
    
    .security-notice {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      border-radius: 8px;
    }
    
    .security-notice p {
      margin: 0;
      font-size: 14px;
      color: #92400e;
      font-weight: 600;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      
      .email-body {
        padding: 30px 20px;
      }
      
      .otp-code {
        font-size: 28px;
        letter-spacing: 4px;
      }
      
      .email-header {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <path d="M12 7v6m0 0v.01"></path>
              <circle cx="12" cy="17" r="1" fill="#ec4899"></circle>
            </svg>
          </div>
          <span class="logo-text">BubuWish</span>
        </div>
        <h1 class="email-title">${title}</h1>
      </div>
      
      <div class="email-body">
        ${content}
      </div>
      
      <div class="footer">
        <p class="footer-text">
          <strong>BubuWish</strong> - The Cutest Way To Send Greetings 💝
        </p>
        <div class="footer-links">
          <a href="${process.env.APP_URL || 'http://localhost:5000'}" class="footer-link">Home</a>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}/about" class="footer-link">About</a>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}/contact" class="footer-link">Contact</a>
        </div>
        <p class="footer-text" style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
          &copy; ${new Date().getFullYear()} BubuWish. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Template for verification email
export const getVerificationEmailHtml = (code: string, userName: string = 'there') => {
  const content = `
    <p class="greeting">Hey ${userName}! 👋</p>
    <p class="message">
      Welcome to <strong>BubuWish</strong>! We're excited to have you here. You're just one step away from creating magical 3D greeting cards featuring adorable Bubu & Dudu characters.
    </p>
    
    <div class="otp-container">
      <p class="otp-label">Your Verification Code</p>
      <p class="otp-code">${code}</p>
      <p class="otp-expiry">⏰ Expires in 15 minutes</p>
    </div>
    
    <p class="message">
      Enter this code in the verification screen to activate your account and start creating amazing cards!
    </p>
    
    <div class="security-notice">
      <p>🔒 <strong>Security Note:</strong> Never share this code with anyone. BubuWish will never ask for your verification code via phone or social media.</p>
    </div>
    
    <div class="divider"></div>
    
    <p class="message" style="font-size: 14px; color: #6b7280;">
      If you didn't create a BubuWish account, you can safely ignore this email.
    </p>
  `;
  
  return getEmailTemplate(content, 'Verify Your BubuWish Account', 'Complete your account setup');
};

// Template for password reset email
export const getPasswordResetEmailHtml = (code: string, userName: string = 'there') => {
  const content = `
    <p class="greeting">Hi ${userName},</p>
    <p class="message">
      We received a request to reset your password for your BubuWish account. Don't worry, we've got you covered!
    </p>
    
    <div class="otp-container">
      <p class="otp-label">Password Reset Code</p>
      <p class="otp-code">${code}</p>
      <p class="otp-expiry">⏰ Expires in 15 minutes</p>
    </div>
    
    <p class="message">
      Use this code to reset your password and regain access to your magical greeting cards.
    </p>
    
    <div class="security-notice">
      <p>🔒 <strong>Security Alert:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately. Your account is safe.</p>
    </div>
    
    <div class="divider"></div>
    
    <p class="message" style="font-size: 14px; color: #6b7280;">
      Need help? Feel free to <a href="${process.env.APP_URL || 'http://localhost:5000'}/contact" style="color: #ec4899; font-weight: 600;">contact our support team</a>.
    </p>
  `;
  
  return getEmailTemplate(content, 'Reset Your Password', 'Password reset request');
};

// Template for welcome email (after verification)
export const getWelcomeEmailHtml = (userName: string) => {
  const content = `
    <p class="greeting">Welcome aboard, ${userName}! 🎉</p>
    <p class="message">
      Your account is now verified and ready to go! You can now create beautiful, interactive 3D greeting cards that will make your loved ones smile.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.APP_URL || 'http://localhost:5000'}/dashboard" class="cta-button">
        ✨ Start Creating Your First Card
      </a>
    </div>
    
    <div style="background: #f9fafb; border-radius: 16px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0 0 16px 0; font-weight: 700; color: #1f2937; font-size: 16px;">
        🎨 What you can do with BubuWish:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-weight: 500;">
        <li style="margin: 8px 0;">Choose from adorable Bubu & Dudu themes</li>
        <li style="margin: 8px 0;">Add music, voice notes, and custom photos</li>
        <li style="margin: 8px 0;">Lock cards with puzzles or countdown timers</li>
        <li style="margin: 8px 0;">Share via link with beautiful 3D animations</li>
        <li style="margin: 8px 0;">Manage birthdays with automated reminders</li>
      </ul>
    </div>
    
    <p class="message">
      We can't wait to see the magic you create! If you need any help, our support team is always here for you.
    </p>
    
    <div class="divider"></div>
    
    <p class="message" style="text-align: center; font-size: 14px;">
      <strong>Happy card creating! 💝</strong>
    </p>
  `;
  
  return getEmailTemplate(content, 'Welcome to BubuWish!', 'Your account is ready');
};

// Template for birthday reminder email (to app user)
export const getBirthdayReminderEmailHtml = (
  userName: string, 
  contactName: string, 
  daysUntil: number,
  contactBirthday: Date
) => {
  const urgencyLevel = daysUntil === 1 ? 'urgent' : daysUntil === 3 ? 'medium' : 'low';
  const urgencyColor = daysUntil === 1 ? '#f43f5e' : daysUntil === 3 ? '#f59e0b' : '#ec4899';
  
  const birthdayDate = contactBirthday.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
  
  const timeText = daysUntil === 1 
    ? '<strong>Tomorrow!</strong>' 
    : `in <strong>${daysUntil} days</strong>`;
  
  const content = `
    <p class="greeting">Hi ${userName}! 👋</p>
    <p class="message">
      This is your friendly reminder that <strong>${contactName}'s birthday</strong> is coming up ${timeText} on <strong>${birthdayDate}</strong>!
    </p>
    
    <div style="background: linear-gradient(135deg, ${urgencyColor}15 0%, ${urgencyColor}25 100%); border: 2px solid ${urgencyColor}; border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎂</div>
      <p style="font-size: 24px; font-weight: 800; color: ${urgencyColor}; margin: 0 0 8px 0;">
        ${contactName}
      </p>
      <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">
        Birthday: ${birthdayDate}
      </p>
      <div style="background: white; border-radius: 100px; padding: 12px 24px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <p style="font-size: 14px; font-weight: 700; color: ${urgencyColor}; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
          ${daysUntil === 1 ? '⏰ Tomorrow!' : `⏳ ${daysUntil} Days Away`}
        </p>
      </div>
    </div>
    
    <p class="message">
      Don't let this special day slip by! Create a magical 3D birthday card that ${contactName} will absolutely love. 💝
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.APP_URL || 'http://localhost:5000'}/dashboard?create=true" class="cta-button">
        ✨ Create Birthday Card Now
      </a>
    </div>
    
    <div style="background: #f9fafb; border-radius: 16px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0 0 16px 0; font-weight: 700; color: #1f2937; font-size: 16px;">
        💡 Quick Card Ideas:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-weight: 500;">
        <li style="margin: 8px 0;">Add a personalized voice message</li>
        <li style="margin: 8px 0;">Include their favorite photos</li>
        <li style="margin: 8px 0;">Choose an adorable Bubu & Dudu theme</li>
        <li style="margin: 8px 0;">Add a puzzle lock for extra fun</li>
        <li style="margin: 8px 0;">Schedule it to unlock on their birthday</li>
      </ul>
    </div>
    
    ${daysUntil === 1 ? `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">
          ⚡ <strong>Last Minute Reminder:</strong> You still have time to create something amazing! Our AI assistant can help you craft the perfect message in seconds.
        </p>
      </div>
    ` : ''}
    
    <div class="divider"></div>
    
    <p class="message" style="text-align: center; font-size: 14px; color: #6b7280;">
      <strong>Want to stop these reminders?</strong><br/>
      You can manage your email preferences in your <a href="${process.env.APP_URL || 'http://localhost:5000'}/profile?tab=preferences" style="color: #ec4899; font-weight: 600;">profile settings</a>.
    </p>
  `;
  
  const title = daysUntil === 1 
    ? `${contactName}'s Birthday is Tomorrow! 🎉`
    : `Upcoming Birthday: ${contactName} 🎂`;
  
  return getEmailTemplate(content, title, `${contactName}'s birthday reminder`);
};

// Template for birthday wish email (to contact on their birthday)
export const getBirthdayWishEmailHtml = (
  recipientName: string,
  senderName: string
) => {
  const content = `
    <div style="text-align: center; margin: 32px 0;">
      <div style="font-size: 80px; line-height: 1; margin-bottom: 24px;">🎉</div>
      <p class="greeting" style="font-size: 32px; font-weight: 800; color: #ec4899; margin: 0 0 16px 0; text-align: center;">
        Happy Birthday, ${recipientName}!
      </p>
    </div>
    
    <p class="message" style="text-align: center; font-size: 18px;">
      ${senderName} is thinking of you today and wishes you the most magical birthday ever! 🎂✨
    </p>
    
    <div style="background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%); border: 3px dashed #ec4899; border-radius: 20px; padding: 40px; text-align: center; margin: 32px 0;">
      <div style="font-size: 64px; margin-bottom: 16px;">🎁</div>
      <p style="font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">
        You have a special surprise waiting!
      </p>
      <p style="font-size: 16px; color: #4b5563; margin: 0 0 24px 0; font-weight: 500;">
        ${senderName} has created a magical 3D birthday card just for you. Open it to see your personalized surprise!
      </p>
      <a href="${process.env.APP_URL || 'http://localhost:5000'}/dashboard" class="cta-button">
        🎊 Open Your Birthday Card
      </a>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: white; border-radius: 16px; padding: 24px 32px; box-shadow: 0 8px 24px rgba(236, 72, 153, 0.15);">
        <p style="font-size: 48px; font-weight: 800; color: #ec4899; margin: 0 0 8px 0; line-height: 1;">
          🎈 🎂 🎊
        </p>
        <p style="font-size: 16px; color: #4b5563; margin: 0; font-weight: 600;">
          May all your wishes come true!
        </p>
      </div>
    </div>
    
    <p class="message" style="text-align: center;">
      Wishing you a day filled with love, laughter, and wonderful memories! 💝
    </p>
    
    <div class="divider"></div>
    
    <p class="message" style="text-align: center; font-size: 14px; color: #6b7280;">
      This birthday wish was sent by <strong>${senderName}</strong> via <strong>BubuWish</strong> - The Cutest Way To Send Greetings! 💝
    </p>
  `;
  
  return getEmailTemplate(content, `🎉 Happy Birthday, ${recipientName}!`, 'Your birthday surprise awaits');
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[SMTP Not Configured] Skipped sending email to ${to}: ${subject}`);
    console.log(`Email Body Preview: ${html.substring(0, 200)}...`);
    return;
  }
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'BubuWish Magic Cards'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`✅ Email sent to ${to}: ${subject}`);
};
