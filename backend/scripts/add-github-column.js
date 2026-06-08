const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '..', '.env.local');
let envConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valParts] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      envConfig[key.trim()] = valParts.join('=').trim().replace(/^"|"$/g, '');
    }
  });
}

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

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

async function addGithubColumn() {
  console.log('🔄 Adding GitHub column to user_portfolios table...\n');

  try {
    console.log('➕ Adding github column (JSONB)...');
    await executeSql(`
      ALTER TABLE IF EXISTS user_portfolios 
      ADD COLUMN IF NOT EXISTS github JSONB DEFAULT '{"connected":false}'::jsonb;
    `);
    console.log('   ✓ github column added\n');

    console.log('✅ GitHub column added successfully!');
    console.log('🎉 You can now reconnect GitHub and deploy!\n');

  } catch (error) {
    console.log('ℹ️  API method not available. Running manual SQL instead...\n');
    console.log('📋 Copy this SQL and run it in Supabase Dashboard → SQL Editor:\n');
    console.log(`
-- Add github column to user_portfolios (JSONB)
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS github JSONB DEFAULT '{"connected":false}'::jsonb;
    `);
    console.log('\n📌 Steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click SQL Editor');
    console.log('4. Click "New Query"');
    console.log('5. Paste the SQL above');
    console.log('6. Click Run');
    console.log('7. Refresh your app\n');
  }
}

addGithubColumn();
