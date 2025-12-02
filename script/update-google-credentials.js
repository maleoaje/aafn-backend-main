/**
 * Script to update Google OAuth credentials in the database
 * 
 * Usage:
 *   node script/update-google-credentials.js
 * 
 * Or with environment variables:
 *   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node script/update-google-credentials.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Setting = require('../models/Setting');

// Try multiple common environment variable names for MongoDB connection
const MONGODB_URI = 
  process.env.MONGO_URI || 
  process.env.MONGODB_URI || 
  process.env.DATABASE_URL ||
  process.env.MONGODB_URL;

if (!MONGODB_URI) {
  console.error('❌ Error: MongoDB connection string not found');
  console.error('   Please set one of these in your .env file:');
  console.error('   - MONGO_URI (preferred)');
  console.error('   - MONGODB_URI');
  console.error('   - DATABASE_URL');
  console.error('   - MONGODB_URL');
  console.error('\n   Or set it as an environment variable before running this script.');
  process.exit(1);
}

// Get credentials from environment variables or command line arguments
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.argv[2];
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.argv[3];
const enableGoogleLogin = process.env.GOOGLE_LOGIN_STATUS === 'true' || process.argv[4] === 'true';

if (!googleClientId || !googleClientSecret) {
  console.error('❌ Error: Google credentials are required');
  console.log('\nUsage:');
  console.log('  Method 1: Set environment variables');
  console.log('    GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node script/update-google-credentials.js');
  console.log('\n  Method 2: Pass as arguments');
  console.log('    node script/update-google-credentials.js <client-id> <client-secret> [enable]');
  console.log('\n  Method 3: Use .env file');
  console.log('    Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file');
  process.exit(1);
}

async function updateGoogleCredentials() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📝 Updating Google OAuth credentials...');
    console.log(`   Client ID: ${googleClientId.substring(0, 20)}...`);
    console.log(`   Enable Login: ${enableGoogleLogin}`);

    const updateFields = {
      'setting.google_id': googleClientId,
      'setting.google_secret': googleClientSecret,
      'setting.google_login_status': enableGoogleLogin,
    };

    const result = await Setting.findOneAndUpdate(
      { name: 'storeSetting' },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    if (result) {
      console.log('\n✅ Google OAuth credentials updated successfully!');
      console.log('\n📋 Updated settings:');
      console.log(`   Google ID: ${result.setting.google_id ? '✅ Set' : '❌ Not set'}`);
      console.log(`   Google Secret: ${result.setting.google_secret ? '✅ Set' : '❌ Not set'}`);
      console.log(`   Google Login Status: ${result.setting.google_login_status ? '✅ Enabled' : '❌ Disabled'}`);
      
      console.log('\n⚠️  Important: Make sure to configure the redirect URI in Google Cloud Console:');
      const baseUrl = process.env.NEXT_PUBLIC_STORE_DOMAIN || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      console.log(`   ${baseUrl}/api/auth/callback/google`);
    } else {
      console.log('❌ Failed to update settings');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating Google credentials:', error.message);
    process.exit(1);
  }
}

updateGoogleCredentials();

