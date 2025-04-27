/**
 * Aptix API Server
 * 
 * Main entry point for the Aptix API, which provides endpoints for interacting
 * with AI agents deployed on the Solana blockchain.
 * 
 * @version 1.2.4
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');
const winston = require('winston');
const Joi = require('joi');
const admin = require('firebase-admin');
const db = require('./firebase');

// Load environment variables
require('dotenv').config();

// Initialize Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Apply security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Request logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Validation schemas
const interactSchema = Joi.object({
  message: Joi.string().required().min(1).max(1000)
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: '1.2.4',
    timestamp: new Date().toISOString()
  });
});

// API Endpoint to fetch agent details
app.get('/api/agent/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const docRef = db.collection('agents').doc(name);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      logger.warn(`Agent not found: ${name}`);
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `The agent '${name}' does not exist in the database`
      });
    }

    const agentDetails = docSnap.data();
    logger.info(`Successfully retrieved agent: ${name}`);
    return res.json(agentDetails);
  } catch (error) {
    logger.error(`Error fetching agent details: ${error.message}`, { 
      agent: name, 
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving agent details'
    });
  }
});

// API Endpoint to interact with the agent using POST
app.post('/api/agent/:name/interact', async (req, res) => {
  const { name } = req.params;
  const { error, value } = interactSchema.validate(req.body);
  
  if (error) {
    logger.warn(`Validation error for agent interaction: ${error.message}`);
    return res.status(400).json({ 
      error: 'Validation error', 
      message: error.message 
    });
  }
  
  const { message } = value;

  try {
    const docRef = db.collection('agents').doc(name);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      logger.warn(`Agent not found for interaction: ${name}`);
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `The agent '${name}' does not exist in the database`
      });
    }

    const agentDetails = docSnap.data();
    
    // Create a system prompt with agent details
    const systemPrompt = `You are ${name}, a helpful AI agent with the following personality: ${
      agentDetails.personality || 'neutral and general.'
    } ${agentDetails.description || ''}
    
    When responding, always maintain your character and consider your knowledge about the Solana blockchain environment.
    Your answers should be concise, helpful, and accurate. If you don't know something, admit it rather than making up information.
    `;
    
    logger.info(`Processing interaction with agent: ${name}`);
    const openAIResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const agentReply = openAIResponse.choices[0]?.message?.content || 
      "I'm sorry, I couldn't process your request at this time.";

    // Log interaction for analytics (could store in DB in the future)
    logger.info(`Agent interaction complete: ${name}`);
    
    // Track usage statistics
    try {
      await db.collection('analytics').add({
        agent: name,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        messageLength: message.length,
        responseLength: agentReply.length,
        type: 'interaction'
      });
    } catch (analyticsError) {
      // Non-fatal error, just log it
      logger.error(`Failed to record analytics: ${analyticsError.message}`);
    }

    return res.json({ 
      agent: name, 
      reply: agentReply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error in agent interaction: ${error.message}`, { 
      agent: name, 
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred during agent interaction'
    });
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Not found handler
app.use((req, res) => {
  logger.warn(`Not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Aptix API server running on http://localhost:${PORT}`);
});

