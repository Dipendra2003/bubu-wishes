import { db } from './src/db/index';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

async function createAdminAccount() {
  try {
    console.log('🔐 Creating admin account...\n');

    // Generate secure random password
    const securePassword = randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(securePassword, 10);

    // Admin credentials
    const adminEmail = 'admin@bubuwish.com';
    const adminName = 'Admin';

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin account already exists!');
      console.log('Email:', adminEmail);
      console.log('\nIf you want to reset the password, delete the existing admin first.\n');
      return;
    }

    // Create admin user
    const newAdmin = await db.insert(users).values({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      verified: true, // Admin is pre-verified
      suspended: false,
    }).returning();

    console.log('✅ Admin account created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', securePassword);
    console.log('👤 Name:', adminName);
    console.log('🛡️  Role: Admin');
    console.log('✓ Status: Verified');
    console.log('═══════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('⚠️  This password will not be shown again.\n');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    process.exit(0);
  }
}

createAdminAccount();
