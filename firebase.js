/**
 * Firebase Configuration Module
 * 
 * This module handles the connection to Firebase services for Aptix API.
 * It initializes the Firebase Admin SDK and exports the Firestore database instance.
 * 
 * @module firebase
 * @version 1.2.4
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Firebase initialization options
let firebaseConfig = {};

try {
  // Try to load from environment variable first
  if (process.env.SERVICE_ACCOUNT_KEY) {
    logger.info('Initializing Firebase with service account from environment variable');
    try {
      const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
      firebaseConfig = {
        credential: admin.credential.cert(serviceAccount)
      };
    } catch (parseError) {
      logger.error('Failed to parse SERVICE_ACCOUNT_KEY environment variable', { error: parseError.message });
      throw new Error('Invalid SERVICE_ACCOUNT_KEY environment variable format. Must be valid JSON.');
    }
  } 
  // Then try to load from local file
  else {
    const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      logger.info('Initializing Firebase with service account from local file');
      firebaseConfig = {
        credential: admin.credential.cert(serviceAccountPath)
      };
    } else {
      throw new Error('Service account file not found at: ' + serviceAccountPath);
    }
  }

  // Initialize Firebase Admin SDK
  admin.initializeApp(firebaseConfig);

  // Test the connection
  logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firebase', { error: error.message });
  
  if (process.env.NODE_ENV === 'production') {
    throw error; // In production, fail fast
  } else {
    logger.warn('Running in development mode with Firebase initialization error. Some features may not work correctly.');
  }
}

// Export Firestore database instance
const db = admin.firestore();

// Add timestamp settings for consistency
db.settings({ timestampsInSnapshots: true });

module.exports = db;
