![Logo](https://media.discordapp.net/attachments/1333920253532569601/1333988510171926589/shdfghfdsg.png?ex=679b8ddd&is=679a3c5d&hm=23c449d8e7e6d723cda1f1f2da4c6c8ef9a9ad26df31c94a186a2b3d85711fc7&=&format=webp&quality=lossless)

# Aptix API

> Official backend service for Aptix AI agents on the Solana blockchain.

[![Version](https://img.shields.io/badge/version-1.2.4-blue.svg)](https://github.com/aptixdotfun/aptix-api)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![Solana](https://img.shields.io/badge/solana-blockchain-purple)](https://solana.com)

The **Aptix API** provides a robust backend service enabling seamless interaction with AI agents created using the **Aptix Framework**. This API offers a secure interface to fetch agent metadata and interact with their AI capabilities, leveraging OpenAI's GPT models.

## 🔑 Key Features

- **Secure Agent Interactions**: Engage with Aptix AI agents through rate-limited, validated endpoints
- **Enhanced Security**: Comprehensive error handling, input validation, and security middlewares
- **Detailed Logging**: Winston-based logging for debugging and monitoring
- **Developer-Friendly**: Clear error messages and consistent response formats
- **Health Monitoring**: Built-in health check endpoint for monitoring system status
- **Scalable Architecture**: Ready for production deployments at scale

## 📋 Prerequisites

- **Node.js** v16.0.0 or higher
- **npm** or **yarn**
- **Firebase** account and Firestore database
- **OpenAI API** key

## 🚀 Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aptixdotfun/aptix-api.git
cd aptix-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your credentials:
```bash
OPENAI_API_KEY=your-openai-api-key
PORT=3000
CORS_ORIGIN=*
LOG_LEVEL=info
NODE_ENV=development
OPENAI_MODEL=gpt-3.5-turbo
```

5. Configure Firebase:
- Option 1: Set `SERVICE_ACCOUNT_KEY` environment variable with JSON content
- Option 2: Create `serviceAccountKey.json` file from the example:
  ```bash
  cp serviceAccountKey.example.json serviceAccountKey.json
  ```
  Then edit with your Firebase credentials.

### Running the API

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```
Returns health status of the API server.

### Get Agent Details
```
GET /api/agent/:name
```
Fetches metadata for a specific AI agent.

**Response Example:**
```json
{
  "name": "Aura",
  "description": "Solana blockchain analyst",
  "personality": "Helpful and concise market analyst",
  "version": "1.0.0",
  "capabilities": ["market-analysis", "token-tracking"]
}
```

### Interact with Agent
```
POST /api/agent/:name/interact
```

**Request Payload:**
```json
{
  "message": "What is the current market cap of Solana?"
}
```

**Response Example:**
```json
{
  "agent": "Aura",
  "reply": "As of the latest data, Solana has a market capitalization of approximately $21.4 billion.",
  "timestamp": "2025-01-15T12:34:56.789Z"
}
```

## 📦 Dependencies

| Dependency | Purpose |
|------------|---------|
| express | Web framework |
| firebase-admin | Firebase integration |
| openai | AI model integration |
| winston | Logging system |
| helmet | Security enhancements |
| express-rate-limit | Rate limiting |
| joi | Request validation |
| morgan | HTTP request logging |

## 🔒 Security Considerations

- Environment variables should never be committed to version control
- Always use HTTPS in production
- Consider implementing JWT authentication for production use
- Rotate API keys regularly
- Implement IP whitelisting for production environments when possible

## 🧪 Testing

```bash
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

## 🔗 Related Projects

- [Aptix Framework](https://github.com/aptixdotfun/aptix-framework) - Core framework for creating AI agents
- [Aptix SDK](https://github.com/aptixdotfun/aptix-sdk) - Client SDK for interacting with Aptix agents

