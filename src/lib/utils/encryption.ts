/**
 * Encryption Utilities
 * 
 * This module provides utilities for encrypting and decrypting sensitive user data.
 * It uses Node.js crypto module with AES-256-GCM algorithm.
 */

import * as crypto from 'crypto';

// Environment variables should be properly set up
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_IV_LENGTH = 16;
const ENCRYPTION_TAG_LENGTH = 16;

if (!ENCRYPTION_KEY) {
  console.error('Warning: ENCRYPTION_KEY environment variable is not set. Encryption will not work properly.');
}

/**
 * Encrypt sensitive data
 * 
 * @param data - The data to encrypt (object or string)
 * @returns Encrypted data as a Buffer
 */
export function encryptData(data: any): Buffer {
  try {
    if (!ENCRYPTION_KEY) {
      throw new Error('Encryption key is not set');
    }

    // Convert data to string if it's not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    
    // Create cipher using AES-256-GCM
    const cipher = crypto.createCipheriv(
      'aes-256-gcm', 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(dataString, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return a buffer with iv, authTag and encrypted data
    // Format: IV (16 bytes) + Auth Tag (16 bytes) + Encrypted Data
    return Buffer.concat([iv, authTag, encrypted]);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * 
 * @param encryptedData - The data to decrypt (Buffer)
 * @returns Decrypted data (parsed back to original type if possible)
 */
export function decryptData(encryptedData: Buffer): any {
  try {
    if (!ENCRYPTION_KEY) {
      throw new Error('Encryption key is not set');
    }
    
    // Extract IV, auth tag and encrypted data from the buffer
    const iv = encryptedData.subarray(0, ENCRYPTION_IV_LENGTH);
    const authTag = encryptedData.subarray(ENCRYPTION_IV_LENGTH, ENCRYPTION_IV_LENGTH + ENCRYPTION_TAG_LENGTH);
    const encryptedContent = encryptedData.subarray(ENCRYPTION_IV_LENGTH + ENCRYPTION_TAG_LENGTH);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encryptedContent);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // Convert back to original format
    const decryptedStr = decrypted.toString('utf8');
    
    try {
      // Try to parse as JSON if possible
      return JSON.parse(decryptedStr);
    } catch {
      // If not valid JSON, return as string
      return decryptedStr;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
} 