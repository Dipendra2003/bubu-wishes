import { db } from './src/db/index';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function listAllUsers() {
  console.log('\n📋 All Users in Database:\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  const allUsers = await db.select().from(users);
  
  if (allUsers.length === 0) {
    console.log('No users found in database.');
    return [];
  }

  allUsers.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🛡️  Role: ${user.role}`);
    console.log(`   ✓ Verified: ${user.verified ? 'Yes' : 'No'}`);
    console.log(`   🚫 Suspended: ${user.suspended ? 'Yes' : 'No'}`);
    console.log(`   📅 Created: ${new Date(user.createdAt).toLocaleString()}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`\nTotal Users: ${allUsers.length}\n`);
  
  return allUsers;
}

async function deleteUser(email: string) {
  try {
    const deleted = await db.delete(users).where(eq(users.email, email)).returning();
    
    if (deleted.length > 0) {
      console.log(`\n✅ User deleted successfully: ${email}\n`);
      return true;
    } else {
      console.log(`\n❌ User not found: ${email}\n`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return false;
  }
}

async function deleteAllUsers() {
  try {
    const deleted = await db.delete(users).returning();
    console.log(`\n✅ Deleted ${deleted.length} users from database.\n`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    return false;
  }
}

async function main() {
  console.log('\n🛠️  User Management Tool\n');
  
  const allUsers = await listAllUsers();
  
  if (allUsers.length === 0) {
    console.log('No users to manage. Exiting...\n');
    rl.close();
    process.exit(0);
    return;
  }

  console.log('\nWhat would you like to do?\n');
  console.log('1. Delete a specific user (by email)');
  console.log('2. Delete ALL users (⚠️  DANGER!)');
  console.log('3. Exit\n');
  
  const choice = await question('Enter your choice (1-3): ');
  
  switch (choice.trim()) {
    case '1':
      const email = await question('\nEnter email to delete: ');
      const confirm = await question(`\n⚠️  Are you sure you want to delete ${email}? (yes/no): `);
      
      if (confirm.toLowerCase() === 'yes') {
        await deleteUser(email.trim());
      } else {
        console.log('\n❌ Cancelled.\n');
      }
      break;
      
    case '2':
      const confirmAll = await question('\n⚠️  ⚠️  ⚠️  DELETE ALL USERS? This cannot be undone! (type "DELETE ALL" to confirm): ');
      
      if (confirmAll === 'DELETE ALL') {
        await deleteAllUsers();
      } else {
        console.log('\n❌ Cancelled. (You must type "DELETE ALL" exactly)\n');
      }
      break;
      
    case '3':
      console.log('\n👋 Goodbye!\n');
      break;
      
    default:
      console.log('\n❌ Invalid choice.\n');
  }
  
  rl.close();
  process.exit(0);
}

main();
