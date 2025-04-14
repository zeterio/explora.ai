#!/usr/bin/env node

/**
 * API Testing Script
 * 
 * Tests the API endpoints for the Explora.AI application
 */

import fetch from 'node-fetch';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
let authToken = null;

// Main testing function
async function runTests() {
  console.log(chalk.blue.bold('===== Explora.AI API Tests =====\n'));
  
  try {
    // 1. Test health endpoint
    await testHealthEndpoint();
    
    // 2. Test user registration
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!'
    };
    await testRegistration(testUser);
    
    // 3. All tests completed
    console.log(chalk.green.bold('\n✓ All tests completed successfully\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n✗ Tests failed'), error);
    process.exit(1);
  }
}

// Health endpoint test
async function testHealthEndpoint() {
  console.log(chalk.yellow('Testing health endpoint...'));
  
  const response = await fetch(`${API_URL}/health`);
  const data = await response.json();
  
  if (!response.ok || data.status !== 'healthy') {
    throw new Error(`Health check failed: ${JSON.stringify(data)}`);
  }
  
  console.log(chalk.green('✓ Health endpoint is working'));
  console.log(`  Database connected: ${data.database.connected}`);
  console.log(`  Response time: ${data.database.responseTime}`);
  console.log(`  Environment: ${data.environment}`);
  
  return data;
}

// Registration test
async function testRegistration(user) {
  console.log(chalk.yellow('\nTesting user registration...'));
  
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error(chalk.red('Registration failed:'), data);
    throw new Error(`Registration failed: ${JSON.stringify(data)}`);
  }
  
  console.log(chalk.green('✓ Registration successful'));
  console.log(`  User ID: ${data.user.id}`);
  console.log(`  Email: ${data.user.email}`);
  
  return data;
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 