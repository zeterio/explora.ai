#!/usr/bin/env node

/**
 * Supabase Setup Script
 * 
 * This script helps set up the Supabase database for Explora.AI.
 * It provides instructions on how to run the SQL schema and set up authentication.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import boxen from 'boxen';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  dotenv.config();
}

console.log(boxen(chalk.blue.bold('Explora.AI: Supabase Setup Helper'), {
  padding: 1,
  margin: 1,
  borderStyle: 'round'
}));

// Verify environment variables
if (!process.env.SUPABASE_URL) {
  console.error(chalk.red('Error: SUPABASE_URL environment variable is not set.'));
  console.log('Please set it in .env.local or .env file.');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(chalk.red('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.'));
  console.log('Please set it in .env.local or .env file.');
  process.exit(1);
}

// Check if schema.sql exists
const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error(chalk.red('Error: schema.sql not found in scripts directory.'));
  process.exit(1);
}

console.log(chalk.green('✓ Environment variables verified'));
console.log(chalk.green('✓ Schema file found'));

console.log('\n' + chalk.yellow.bold('SETUP INSTRUCTIONS:'));
console.log('Follow these steps to set up your Supabase database:\n');

console.log(chalk.white.bold('1. Go to your Supabase project dashboard:'));
console.log(`   ${process.env.SUPABASE_URL}\n`);

console.log(chalk.white.bold('2. Run the SQL schema:'));
console.log('   - Go to "SQL Editor" in the Supabase dashboard');
console.log('   - Create a "New query"');
console.log('   - Copy and paste the contents of scripts/schema.sql');
console.log('   - Run the query\n');

console.log(chalk.white.bold('3. Configure Authentication:'));
console.log('   - Go to "Authentication" → "Providers"');
console.log('   - Enable "Email" provider');
console.log('   - Enable "Google" and "GitHub" providers if using OAuth');
console.log('   - Configure redirect URLs (typically your app domain + /api/auth/callback/[provider])\n');

console.log(chalk.white.bold('4. Set up environment variables:'));
console.log(`   - Ensure SUPABASE_URL is set to: ${process.env.SUPABASE_URL}`);
console.log('   - Ensure SUPABASE_SERVICE_ROLE_KEY is set correctly');
console.log('   - Set SUPABASE_ANON_KEY (find in Project Settings → API)\n');

console.log(chalk.white.bold('5. Configure CORS:'));
console.log('   - Go to Project Settings → API → CORS');
console.log('   - Add your frontend URL to the allowed origins\n');

console.log(chalk.green.bold('For local development:'));
console.log('   - Use http://localhost:3000 as your origin');
console.log('   - Set NEXTAUTH_URL=http://localhost:3000\n');

console.log(chalk.yellow('Note: This script does not make actual changes to your Supabase project.'));
console.log(chalk.yellow('It only provides instructions for manual setup.'));

console.log('\n' + chalk.green.bold('Need to view the schema?'));
console.log('Run the following command to display the SQL schema:');
console.log(chalk.blue('cat scripts/schema.sql'));

console.log('\n' + chalk.magenta.bold('Happy coding! 🚀')); 