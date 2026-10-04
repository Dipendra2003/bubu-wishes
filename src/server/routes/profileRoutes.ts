import { Router } from 'express';
import { db } from '../../db/index';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest, invalidateUserCache } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { validatePassword } from '../lib/passwordValidation';

const BCRYPT_COST = 12;

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get current user profile
router.get('/me', (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // req.user is already retrieved and cached in authenticate middleware
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      birthday: user.birthday,
      location: user.location,
      timezone: user.timezone,
      createdAt: user.createdAt,
      hasPassword: Boolean(user.password),
      isGoogleLinked: user.oauthProvider === 'google'
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { name, bio, phone, birthday, location, timezone, avatarUrl } = req.body;

    // Validate name if provided
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null;
    if (location !== undefined) updateData.location = location;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        verified: users.verified,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        phone: users.phone,
        birthday: users.birthday,
        location: users.location,
        timezone: users.timezone,
        createdAt: users.createdAt,
      });

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    invalidateUserCache(userId);

    res.json({ message: 'Profile updated successfully', user: result[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'New password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Get current user
    const result = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, result[0].password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_COST);

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    invalidateUserCache(userId);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// NEW: Set password for OAuth-only users
router.post('/set-password', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
    }

    // Get current user
    const result = await db
      .select({ password: users.password, oauthProvider: users.oauthProvider })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has a password
    if (result[0].password && result[0].password.length > 0) {
      return res.status(400).json({ 
        error: 'Password already set. Use change-password endpoint instead.' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_COST);

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    invalidateUserCache(userId);

    res.json({ message: 'Password set successfully' });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// Delete account
router.delete('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { password, confirmDelete } = req.body;

    // Get current user
    const result = await db
      .select({ password: users.password, oauthProvider: users.oauthProvider })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRecord = result[0];

    if (userRecord.password) {
      // Password-based account: require password verification
      if (!password) {
        return res.status(400).json({ error: 'Password is required to delete account' });
      }
      const isValid = await bcrypt.compare(password, userRecord.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    } else {
      // OAuth-only account: require explicit confirmation string
      if (confirmDelete !== 'DELETE MY ACCOUNT') {
        return res.status(400).json({ 
          error: 'Please type "DELETE MY ACCOUNT" to confirm account deletion',
          oauthOnly: true
        });
      }
    }

    // Delete user (cascade will delete related data)
    await db.delete(users).where(eq(users.id, userId));

    invalidateUserCache(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
