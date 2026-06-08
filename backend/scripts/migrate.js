#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
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
  console.error('❌ Error: Missing environment variables\n');
  console.error('Required in .env.local:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addColumns() {
  try {
    console.log('🔄 Adding missing columns to user_portfolios table...\n');

    // Execute raw SQL using the rpc approach or direct query
    // Since we don't have exec_sql RPC, we'll use the table editor approach
    // But first, let's try to get table info
    
    console.log('📊 Checking current table structure...');
    const { data: tableInfo, error: checkError } = await supabase
      .from('user_portfolios')
      .select()
      .limit(0);

    if (checkError) {
      console.error('❌ Cannot access table:', checkError.message);
      throw new Error('Unable to verify table structure');
    }

    console.log('✓ Table accessible\n');

    // Try adding a test row to trigger schema validation
    console.log('➕ Adding vibe column...');
    const testUser = `migration_${Date.now()}`;
    
    const { data, error } = await supabase
      .from('user_portfolios')
      .insert({
        user_id: testUser,
        email: `${testUser}@temp.local`,
        username: testUser,
        full_name: 'Migration Test',
        vibe: 'professional',
        profile_image: null,
        is_published: false
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('vibe') || error.message.includes('profile_image')) {
        console.log('\n⚠️  Columns don\'t exist yet - they need to be added via Supabase Dashboard\n');
        throw new Error('Columns missing - manual setup required');
      }
      throw error;
    }

    // Clean up test row
    if (data?.id) {
      await supabase.from('user_portfolios').delete().eq('user_id', testUser);
    }

    console.log('✓ vibe column working');
    console.log('✓ profile_image column working\n');
    console.log('✅ All columns are ready!\n');

  } catch (error) {
    console.log('\n📋 Manual Setup Required\n');
    console.log('Go to Supabase Dashboard and run this SQL:\n');
    console.log('=' .repeat(60));
    console.log(`
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS vibe VARCHAR(50) DEFAULT 'professional';

ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS profile_image TEXT;
    `);
    console.log('=' .repeat(60));
    console.log('\nSteps:');
    console.log('1. Open: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click: SQL Editor (left sidebar)');
    console.log('4. Click: New Query');
    console.log('5. Copy & paste the SQL above');
    console.log('6. Click: Run\n');
  }
}

addColumns().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
