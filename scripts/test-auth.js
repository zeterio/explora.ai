#!/usr/bin/env node

/**
 * Authentication Testing Script
 * 
 * Tests the complete authentication flow for the Explora.AI application
 */

import fetch from 'node-fetch';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { createCookieJar, getCookieString, setCookieString } from 'node-fetch-cookies';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const cookieJar = createCookieJar();

// Main testing function
async function runTests() {
  console.log(chalk.blue.bold('===== Explora.AI Authentication Tests =====\n'));
  
  try {
    // 1. Test health endpoint
    await testHealthEndpoint();
    
    // 2. Test user registration
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!'
    };
    const userData = await testRegistration(testUser);
    
    // 3. Test login through credentials provider
    const session = await testLogin(testUser);
    
    // 4. Test protected endpoint access (requires authentication)
    await testProtectedEndpoint(session);
    
    // 5. All tests completed
    console.log(chalk.green.bold('\n✓ All authentication tests completed successfully\n'));
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
    // If user already exists, that's okay for our test
    if (response.status === 409) {
      console.log(chalk.yellow('Note: User already exists, continuing with test'));
      return { id: 'existing-user', email: user.email };
    } else {
      console.error(chalk.red('Registration failed:'), data);
      throw new Error(`Registration failed: ${JSON.stringify(data)}`);
    }
  }
  
  console.log(chalk.green('✓ Registration successful'));
  console.log(`  User ID: ${data.user.id}`);
  console.log(`  Email: ${data.user.email}`);
  
  return data.user;
}

// Login test
async function testLogin(user) {
  console.log(chalk.yellow('\nTesting login with credentials...'));
  
  // First, get CSRF token from NextAuth
  console.log('  Fetching CSRF token...');
  const csrfResponse = await fetch(`${APP_URL}/api/auth/csrf`, {
    credentials: 'include',
  });
  
  const csrfData = await csrfResponse.json();
  if (!csrfResponse.ok || !csrfData.csrfToken) {
    throw new Error(`Failed to get CSRF token: ${JSON.stringify(csrfData)}`);
  }
  
  // Now login with credentials
  console.log('  Submitting login credentials...');
  const loginResponse = await fetch(`${APP_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email: user.email,
      password: user.password,
      callbackUrl: APP_URL,
    }),
    redirect: 'manual',
    credentials: 'include',
  });
  
  // NextAuth will return a redirect, so we check for status code 302
  if (loginResponse.status !== 302) {
    throw new Error(`Login failed, expected 302 redirect, got ${loginResponse.status}`);
  }
  
  // Get the session
  console.log('  Fetching session...');
  const sessionResponse = await fetch(`${APP_URL}/api/auth/session`, {
    credentials: 'include',
  });
  
  const sessionData = await sessionResponse.json();
  
  // If we have a user object, we're logged in
  if (!sessionData.user) {
    throw new Error(`Session verification failed: ${JSON.stringify(sessionData)}`);
  }
  
  console.log(chalk.green('✓ Login successful'));
  console.log(`  User: ${sessionData.user.name} (${sessionData.user.email})`);
  
  return sessionData;
}

// Test accessing a protected endpoint
async function testProtectedEndpoint(session) {
  // This is a placeholder - replace with a real protected endpoint in your API
  console.log(chalk.yellow('\nTesting protected endpoint access...'));
  console.log('  Note: This is a simulated test as we don\'t have a real protected endpoint yet');
  
  // In a real test, you would use the session to access a protected endpoint
  // For example:
  // const response = await fetch(`${API_URL}/user/profile`, {
  //   headers: {
  //     'Authorization': `Bearer ${session.accessToken}`,
  //   },
  // });
  
  // For now, we'll just check that we have a valid session
  if (session && session.user) {
    console.log(chalk.green('✓ Session is valid, protected endpoints should be accessible'));
  } else {
    throw new Error('Invalid session, protected endpoints would be inaccessible');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1); 