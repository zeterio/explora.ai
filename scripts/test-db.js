#!/usr/bin/env node

/**
 * Database Testing Script
 * 
 * Tests CRUD operations on the Supabase database for the Explora.AI application
 */

import chalk from 'chalk';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(chalk.red('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'));
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test user details
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'Password123!',
  name: 'Test User'
};

let userId = null;
let profileId = null;
let learningPathId = null;

// Main testing function
async function runTests() {
  console.log(chalk.blue.bold('===== Explora.AI Database Tests =====\n'));
  
  try {
    // 1. Create a test user
    await createTestUser();
    
    // 2. Test profile operations
    await testProfileOperations();
    
    // 3. Test learning path operations
    await testLearningPathOperations();
    
    // 4. Test highlights operations
    await testHighlightOperations();
    
    // 5. Clean up test data
    await cleanupTestData();
    
    // 6. All tests completed
    console.log(chalk.green.bold('\n✓ All database tests completed successfully\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n✗ Tests failed'), error);
    
    // Attempt to clean up even if tests fail
    if (userId) {
      try {
        await cleanupTestData();
      } catch (cleanupError) {
        console.error('Failed to clean up test data:', cleanupError);
      }
    }
    
    process.exit(1);
  }
}

// Create test user in Supabase Auth
async function createTestUser() {
  console.log(chalk.yellow('Creating test user...'));
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: testUser.email,
    password: testUser.password,
    email_confirm: true,
    user_metadata: { name: testUser.name }
  });
  
  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }
  
  userId = data.user.id;
  console.log(chalk.green('✓ Test user created successfully'));
  console.log(`  User ID: ${userId}`);
  console.log(`  Email: ${data.user.email}`);
  
  return data.user;
}

// Test profile operations
async function testProfileOperations() {
  console.log(chalk.yellow('\nTesting profile operations...'));
  
  // 1. Create profile
  console.log('  Creating profile...');
  const { data: createData, error: createError } = await supabase
    .from('profiles')
    .insert([{
      user_id: userId,
      name: testUser.name,
      bio: 'This is a test profile',
      interests: ['ai', 'machine learning', 'education'],
      preferences: {
        theme: 'dark',
        fontSize: 'medium',
        notificationsEnabled: true
      },
      is_email_verified: true
    }])
    .select()
    .single();
  
  if (createError) {
    throw new Error(`Failed to create profile: ${createError.message}`);
  }
  
  profileId = createData.id;
  console.log(chalk.green('  ✓ Profile created successfully'));
  
  // 2. Read profile
  console.log('  Reading profile...');
  const { data: readData, error: readError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (readError || !readData) {
    throw new Error(`Failed to read profile: ${readError?.message || 'Profile not found'}`);
  }
  
  console.log(chalk.green('  ✓ Profile read successfully'));
  
  // 3. Update profile
  console.log('  Updating profile...');
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ 
      bio: 'This is an updated test profile',
      interests: ['ai', 'machine learning', 'education', 'data science']
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`);
  }
  
  console.log(chalk.green('  ✓ Profile updated successfully'));
  
  return updateData;
}

// Test learning path operations
async function testLearningPathOperations() {
  console.log(chalk.yellow('\nTesting learning path operations...'));
  
  // 1. Create learning path
  console.log('  Creating learning path...');
  const { data: pathData, error: pathError } = await supabase
    .from('learning_paths')
    .insert([{
      user_id: userId,
      title: 'Test Learning Path',
      description: 'A test learning path for database testing',
      is_public: true,
      topics: ['ai', 'machine learning'],
      difficulty: 'intermediate',
      estimated_hours: 10
    }])
    .select()
    .single();
  
  if (pathError) {
    throw new Error(`Failed to create learning path: ${pathError.message}`);
  }
  
  learningPathId = pathData.id;
  console.log(chalk.green('  ✓ Learning path created successfully'));
  
  // 2. Create learning path items
  console.log('  Creating learning path items...');
  const { data: itemsData, error: itemsError } = await supabase
    .from('learning_path_items')
    .insert([
      {
        path_id: learningPathId,
        title: 'Introduction',
        description: 'Introduction to the topic',
        content: 'This is the introduction content',
        item_order: 1
      },
      {
        path_id: learningPathId,
        title: 'Basic Concepts',
        description: 'Overview of basic concepts',
        content: 'This is the basic concepts content',
        item_order: 2
      }
    ])
    .select();
  
  if (itemsError) {
    throw new Error(`Failed to create learning path items: ${itemsError.message}`);
  }
  
  console.log(chalk.green(`  ✓ ${itemsData.length} learning path items created successfully`));
  
  // 3. Read learning path with items
  console.log('  Reading learning path with items...');
  const { data: readPathData, error: readPathError } = await supabase
    .from('learning_paths')
    .select(`
      *,
      learning_path_items (*)
    `)
    .eq('id', learningPathId)
    .single();
  
  if (readPathError) {
    throw new Error(`Failed to read learning path: ${readPathError.message}`);
  }
  
  console.log(chalk.green('  ✓ Learning path read successfully'));
  console.log(`    Path: ${readPathData.title}`);
  console.log(`    Items: ${readPathData.learning_path_items.length}`);
  
  return readPathData;
}

// Test highlight operations
async function testHighlightOperations() {
  console.log(chalk.yellow('\nTesting highlight operations...'));
  
  // 1. Create highlight
  console.log('  Creating highlight...');
  const { data: highlightData, error: highlightError } = await supabase
    .from('highlights')
    .insert([{
      user_id: userId,
      content: 'This is a test highlighted text',
      source_url: 'https://example.com/article',
      source_title: 'Test Article',
      color: '#ffeb3b',
      tags: ['important', 'review']
    }])
    .select()
    .single();
  
  if (highlightError) {
    throw new Error(`Failed to create highlight: ${highlightError.message}`);
  }
  
  const highlightId = highlightData.id;
  console.log(chalk.green('  ✓ Highlight created successfully'));
  
  // 2. Read highlights
  console.log('  Reading highlights...');
  const { data: readHighlights, error: readError } = await supabase
    .from('highlights')
    .select('*')
    .eq('user_id', userId);
  
  if (readError) {
    throw new Error(`Failed to read highlights: ${readError.message}`);
  }
  
  console.log(chalk.green(`  ✓ ${readHighlights.length} highlights read successfully`));
  
  // 3. Delete highlight
  console.log('  Deleting highlight...');
  const { error: deleteError } = await supabase
    .from('highlights')
    .delete()
    .eq('id', highlightId);
  
  if (deleteError) {
    throw new Error(`Failed to delete highlight: ${deleteError.message}`);
  }
  
  console.log(chalk.green('  ✓ Highlight deleted successfully'));
  
  return readHighlights;
}

// Clean up test data
async function cleanupTestData() {
  console.log(chalk.yellow('\nCleaning up test data...'));
  
  // The cascade delete should remove profiles, learning paths, etc.
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    throw new Error(`Failed to delete test user: ${error.message}`);
  }
  
  console.log(chalk.green('✓ Test data cleaned up successfully'));
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 