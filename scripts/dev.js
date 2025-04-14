#!/usr/bin/env node

/**
 * dev.js
 * Task Master CLI - AI-driven development task management
 *
 * This script forwards commands to the installed task-master-ai executable
 */

// Add at the very beginning of the file
if (process.env.DEBUG === '1') {
  console.error('DEBUG - dev.js received args:', process.argv.slice(2));
}

import { spawn } from 'child_process';
import path from 'path';

// Extract the arguments (skip the first two: node and script path)
const args = process.argv.slice(2);

// Path to task-master executable
const taskMasterPath = path.resolve(
  process.cwd(),
  'node_modules/task-master-ai/bin/task-master.js'
);

// Run the task-master command with provided arguments
const child = spawn('node', [taskMasterPath, ...args], { stdio: 'inherit' });

// Handle errors
child.on('error', (error) => {
  console.error(`Error running task-master: ${error.message}`);
  process.exit(1);
});

// Forward exit code
child.on('close', (code) => {
  process.exit(code);
});
