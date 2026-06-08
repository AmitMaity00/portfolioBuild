const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl);
    const options = {
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function addColumns() {
  console.log('🔄 Adding missing columns to user_portfolios table...\n');

  try {
    console.log('➕ Adding vibe column...');
    await executeSql(`
      ALTER TABLE IF EXISTS user_portfolios 
      ADD COLUMN IF NOT EXISTS vibe VARCHAR(50) DEFAULT 'professional';
    `);
    console.log('   ✓ vibe column added\n');

    console.log('➕ Adding profile_image column...');
    await executeSql(`
      ALTER TABLE IF EXISTS user_portfolios 
      ADD COLUMN IF NOT EXISTS profile_image TEXT;
    `);
    console.log('   ✓ profile_image column added\n');

    console.log('✅ All columns added successfully!');
    console.log('🎉 Refresh your app and test saving profiles with images.\n');

  } catch (error) {
    console.log('ℹ️  API method not available. Running manual SQL instead...\n');
    console.log('📋 Copy this SQL and run it in Supabase Dashboard → SQL Editor:\n');
    console.log(`
-- Add missing columns to user_portfolios
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS vibe VARCHAR(50) DEFAULT 'professional';

ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS profile_image TEXT;
    `);
    console.log('\n📌 Steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click SQL Editor');
    console.log('4. Click "New Query"');
    console.log('5. Paste the SQL above');
    console.log('6. Click Run\n');
  }
}

addColumns();
