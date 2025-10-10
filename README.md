# 🤖 RetellAI WhatsApp Bridge

> Connect your RetellAI conversational AI agents to WhatsApp via Twilio

A production-ready Node.js server that bridges Twilio WhatsApp messaging with RetellAI's chat API, enabling you to deploy sophisticated conversational AI agents on WhatsApp with persistent conversation history.

---

## 📋 Table of Contents

- [What This Does](#what-this-does)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
  - [RetellAI Setup](#1-retellai-setup)
  - [MongoDB Setup](#2-mongodb-setup)
  - [Twilio Setup](#3-twilio-setup)
  - [Environment Variables](#4-environment-variables)
- [Running Locally](#running-locally)
- [Using the Development Chat Widget](#-using-the-development-chat-widget)
- [Agent Mapping](#agent-mapping-configuration)
- [Deployment to Render](#deployment-to-render)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Cost Considerations](#cost-considerations)
- [Customization](#customization)

---

## 🎯 What This Does

This server acts as a bridge between WhatsApp users and RetellAI conversational agents:

1. **User sends WhatsApp message** → Twilio receives it
2. **Twilio webhook** → Sends message to this server
3. **Server looks up conversation** → Finds or creates RetellAI chat session
4. **RetellAI processes message** → Generates intelligent response
5. **Server sends response** → Back to WhatsApp user via Twilio

**Conversations persist** across messages using MongoDB, maintaining context throughout the interaction.

---

## ✨ Key Features

- ✅ **WhatsApp Integration** - Full bidirectional messaging via Twilio
- ✅ **Persistent Conversations** - MongoDB tracks sessions per WhatsApp number
- ✅ **Multi-Agent Support** - Route different Twilio numbers to different RetellAI agents
- ✅ **Development Chat Widget** - Built-in web interface for testing
- ✅ **Production Security** - Environment-aware authentication and access control
- ✅ **Session Management** - Automatic conversation tracking and history
- ✅ **Webhook Validation** - Twilio signature verification for security
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **Deployment Ready** - Configured for Render deployment

---

## 🏗️ Architecture

### High-Level Flow

```
WhatsApp User
    ↓
Twilio (receives message)
    ↓
POST /twilio/whatsapp (webhook)
    ↓
MongoDB (lookup session by phone number)
    ↓
RetellAI Chat API (send message, get response)
    ↓
MongoDB (update session)
    ↓
Twilio API (send response)
    ↓
WhatsApp User (receives AI response)
```

### Components

- **Express Server** - Handles HTTP requests and webhooks
- **MongoDB** - Stores conversation sessions (phone number → chat_id mapping)
- **RetellAI Service** - Wrapper for RetellAI chat API
- **Twilio Service** - Handles WhatsApp message sending
- **Agent Mapping** - Routes Twilio numbers to specific agents
- **Middleware** - Authentication and validation layers

---

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database for session persistence
- **Mongoose** - MongoDB ODM
- **RetellAI SDK** - Official RetellAI Node.js SDK
- **Twilio SDK** - Official Twilio Node.js SDK
- **dotenv** - Environment variable management

---

## 📦 Prerequisites

Before you start, you'll need:

### Accounts & Services

1. **Node.js** - Version 16+ ([Download](https://nodejs.org/))
2. **RetellAI Account** - [Sign up](https://www.retellai.com/)
3. **Twilio Account** - [Sign up](https://www.twilio.com/try-twilio)
4. **MongoDB Atlas** - [Sign up](https://www.mongodb.com/cloud/atlas/register) (Free tier available)
5. **Render Account** - [Sign up](https://render.com/) (For deployment, free tier available)

### Technical Knowledge

- Basic command line usage
- Understanding of environment variables
- Familiarity with REST APIs (helpful but not required)

---

## 📁 Project Structure

```
retell-whatsapp-bridge/
├── config/
│   ├── agentMapping.js      # Maps Twilio numbers to RetellAI agents
│   └── database.js          # MongoDB connection setup
├── middleware/
│   ├── apiKeyAuth.js        # API key authentication (always enforced)
│   ├── productionApiAuth.js # API key auth (production only)
│   └── twilioValidation.js  # Validates Twilio webhook signatures
├── models/
│   └── Session.js           # MongoDB schema for conversation sessions
├── routes/
│   ├── chat.js              # Chat widget API endpoints
│   └── whatsapp.js          # Twilio webhook handlers
├── services/
│   └── retellService.js     # RetellAI API wrapper
├── public/
│   ├── index.html           # Chat widget interface
│   ├── chat.js              # Chat widget frontend logic
│   └── styles.css           # Chat widget styling
├── .env                     # Environment variables (create this)
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── server.js                # Main application entry point
└── README.md                # This file
```

### Key Files Explained

- **`server.js`** - Main application entry point, sets up Express and routes
- **`config/agentMapping.js`** - Define which Twilio numbers use which RetellAI agents
- **`config/database.js`** - MongoDB connection with error handling
- **`models/Session.js`** - Database schema for tracking conversations
- **`routes/whatsapp.js`** - Handles incoming WhatsApp messages from Twilio
- **`routes/chat.js`** - API endpoints for the development chat widget
- **`services/retellService.js`** - Wrapper for RetellAI SDK calls
- **`middleware/productionApiAuth.js`** - Protects routes in production only
- **`middleware/twilioValidation.js`** - Verifies webhooks are from Twilio

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd retell-whatsapp-bridge
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `retell-sdk` - RetellAI official SDK
- `twilio` - Twilio SDK
- `dotenv` - Environment variables
- `nodemon` - Development auto-reload (dev dependency)

### Step 3: Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Or on Windows
copy .env.example .env
```

Now edit `.env` with your actual credentials (see Configuration section below).

---

## ⚙️ Configuration

### 1. RetellAI Setup

#### Create Your Agent

1. Go to [RetellAI Dashboard](https://dashboard.retellai.com/)
2. Sign in or create an account
3. Click **"Create New Agent"**
4. Choose **"Chat Agent"** (not voice agent)
5. Configure your agent:
   - Set the agent name
   - Configure conversation flow or prompts
   - Choose your LLM settings
   - Test in the playground
6. **Save** the agent

#### Get Your Credentials

1. Go to **Settings** → **API Keys**
2. Copy your **API Key** (starts with `key_...`)
3. Go back to **Agents** → Click your agent
4. Copy the **Agent ID** (starts with `agent_...`)

**Save these for your `.env` file!**

---

### 2. MongoDB Setup

#### Create a Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Click **"Build a Database"**
4. Choose **"Free"** tier (M0 Sandbox)
5. Select your cloud provider and region (choose closest to you)
6. Click **"Create Cluster"**

#### Configure Database Access

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and strong password (save these!)
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

#### Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add specific IPs)
4. Click **"Confirm"**

⚠️ **Note:** "Allow from anywhere" is fine for development. For production, restrict to your Render IP.

#### Get Connection String

1. Go back to **"Database"**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster...`)
5. Replace `<password>` with your actual database password
6. Replace `<dbname>` with your database name (e.g., `retell_whatsapp`)

**Save this for your `.env` file!**

---

### 3. Twilio Setup

#### Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/try-twilio)
2. Sign up for an account (free trial available)
3. Verify your email and phone number

#### Get Your Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your **Account SID** and **Auth Token** from the dashboard

**Save these for your `.env` file!**

#### WhatsApp Setup - Option A: Sandbox (Testing)

Perfect for development and testing:

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to connect your phone to the sandbox
3. Your sandbox number will be shown (e.g., `whatsapp:+14155238886`)
4. This is your `TWILIO_WHATSAPP_NUMBER`

⚠️ **Sandbox Limitations:**
- Only works with numbers you've manually connected
- Shows "sandbox" in messages
- Not for production use

#### WhatsApp Setup - Option B: Production Number

For real production use:

1. Go to **Messaging** → **WhatsApp** → **Senders**
2. Click **"New Sender"**
3. Follow the approval process (requires business verification)
4. Once approved, you'll get your WhatsApp-enabled Twilio number

💡 **Tip:** Start with sandbox for testing, upgrade to production number when ready.

---

### 4. Environment Variables

Create a `.env` file in the root directory with these values:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# RetellAI Configuration
RETELL_API_KEY=key_your_retell_api_key_here
RETELL_AGENT_ID=agent_your_agent_id_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE_NAME=retell_whatsapp

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# API Security
API_KEY=your-secret-api-key-here-generate-a-strong-one
```

#### Variable Explanations

| Variable | Description | Where to Get It | Required |
|----------|-------------|-----------------|----------|
| `PORT` | Server port | Can be any available port (default: 5000) | Yes |
| `NODE_ENV` | Environment mode | `development` or `production` | Yes |
| `RETELL_API_KEY` | RetellAI API key | RetellAI Dashboard → Settings → API Keys | Yes |
| `RETELL_AGENT_ID` | Your chat agent ID | RetellAI Dashboard → Agents → Your Agent | Yes |
| `MONGODB_URI` | MongoDB connection string | MongoDB Atlas → Connect → Connection String | Yes |
| `MONGODB_DATABASE_NAME` | Database name | Choose any name (e.g., `retell_whatsapp`) | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | Twilio Console Dashboard | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | Twilio Console Dashboard | Yes |
| `TWILIO_WHATSAPP_NUMBER` | Your Twilio WhatsApp number | Twilio Messaging → WhatsApp (include `whatsapp:` prefix) | Yes |
| `API_KEY` | Security key for production API access | Generate a strong random string | Yes |

#### Generating a Strong API Key

Use one of these methods:

**Option 1: Online Generator**
- Visit: https://randomkeygen.com/
- Use a "Fort Knox Password"

**Option 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: Manual**
- Create a long random string (30+ characters)
- Mix letters, numbers, and symbols

---

## 🏃 Running Locally

### Development Mode

```bash
npm run dev
```

This starts the server with auto-reload using `nodemon`. You should see:

```
✅ MongoDB connected successfully
📊 Database: retell_whatsapp
📁 Static files enabled (development mode)
✅ Server running on http://localhost:5000
📊 Environment: development
🏥 Health check: http://localhost:5000/health
```

### Testing the Chat Widget

1. Open your browser to `http://localhost:5000/`
2. You should see the chat interface
3. Click **"Start Chat"** to create a session
4. Type a message and press **Send**
5. You should get a response from your RetellAI agent

**Debug Info:**
- Click "Debug Info" dropdown to see the chat_id
- Check your terminal for server logs
- Check MongoDB Atlas → Collections to see the session stored

### Testing WhatsApp (Sandbox)

1. Make sure your server is running locally
2. Use a tool like [ngrok](https://ngrok.com/) to expose your local server:
   ```bash
   ngrok http 5000
   ```
3. Copy the `https://` URL from ngrok (e.g., `https://abc123.ngrok.io`)
4. Go to Twilio Console → Messaging → WhatsApp Sandbox Settings
5. Set webhook URL to: `https://abc123.ngrok.io/twilio/whatsapp`
6. Send a WhatsApp message to your sandbox number
7. Check your terminal logs to see the message processing

---

## 🧪 Using the Development Chat Widget

The chat widget provides a web-based interface for testing your RetellAI agent without needing WhatsApp or Twilio setup.

### Accessing the Widget

**Development Mode Only:**
1. Ensure `NODE_ENV=development` in your `.env`
2. Start the server: `npm run dev`
3. Open browser to: `http://localhost:5000/`

**You should see:**
- Chat interface with header "🤖 RetellAI Chat Test"
- "Phase 3 Development Interface" subtitle
- Empty chat area with system message
- Disabled input box and Send button
- Green "Start Chat" button
- Disabled gray "End Chat" button
- "Not Connected" status indicator

### Starting a Conversation

1. **Click "Start Chat"**
   - Creates new RetellAI chat session
   - Returns a unique `chat_id`
   - Enables message input and Send button
   - Status changes to "Connected" (green)
   
2. **Check Debug Info** (optional)
   - Click "Debug Info" dropdown
   - See your `chat_id` (useful for troubleshooting)
   - See current status

### Sending Messages

1. **Type your message** in the input box
2. **Press Enter** or **click Send**
3. **Your message appears** (blue, right-aligned)
4. **Agent response appears** (white, left-aligned)
5. Input is temporarily disabled while processing

**What Happens Behind the Scenes:**
```
Your message → POST /api/chat/message → RetellAI API → Response displayed
```

### Ending a Session

1. **Click "End Chat"** when done
2. Session marked as "ended" in database
3. Input box disabled
4. Status changes to "Not Connected" (red)
5. System message: "Chat ended. Click Start Chat to begin..."

**Note:** You can start a new chat immediately after ending one.

### Chat Widget Features

| Element | Purpose | Behavior |
|---------|---------|----------|
| **Start Chat** | Initialize new session | Disabled once connected |
| **End Chat** | Close current session | Only enabled when connected |
| **Message Input** | Type your message | Disabled until connected |
| **Send Button** | Submit message | Disabled while processing |
| **Status Indicator** | Connection state | Green = connected, Red = disconnected |
| **Debug Info** | View technical details | Shows chat_id and status |

### Understanding the Interface

**User Messages (Blue):**
- Your messages to the agent
- Right-aligned
- Blue background

**Agent Messages (White):**
- Responses from RetellAI
- Left-aligned
- White background with border

**System Messages (Yellow):**
- Status updates
- Errors or warnings
- Center-aligned

### Widget vs WhatsApp Differences

| Feature | Chat Widget | WhatsApp |
|---------|-------------|----------|
| **Session Tracking** | Temporary (web_timestamp) | Persistent (phone number) |
| **Conversation History** | Lost on page refresh | Persists across sessions |
| **Authentication** | None (dev only) | Twilio validation |
| **Multi-User** | One at a time per browser | Unlimited concurrent |
| **Purpose** | Testing & development | Production use |
| **Agent Selection** | Uses `RETELL_AGENT_ID` | Uses agent mapping |

### Common Widget Scenarios

#### Testing Agent Responses
```
1. Start Chat
2. Send: "Hello, can you help me?"
3. Verify response makes sense
4. Continue conversation to test flow
5. End Chat when done
```

#### Testing Conversation Context
```
1. Start Chat
2. Send: "My name is John"
3. Send: "What's my name?"
4. Agent should remember "John"
5. Verify context is maintained
```

#### Testing Error Handling
```
1. Start Chat
2. Stop your server (Ctrl+C)
3. Try sending message
4. Should see error message
5. Restart server and try again
```

#### Debugging Session Issues
```
1. Start Chat
2. Open Debug Info dropdown
3. Copy the chat_id
4. Check MongoDB Atlas for this chat_id
5. Verify session is stored correctly
```

### Troubleshooting the Widget

**Widget Not Loading:**
- Check `NODE_ENV=development` in `.env`
- Verify `public/` folder has index.html, chat.js, styles.css
- Check browser console for errors (F12 → Console)
- Clear browser cache

**"Start Chat" Does Nothing:**
- Check server logs for errors
- Verify `RETELL_API_KEY` and `RETELL_AGENT_ID` in `.env`
- Test health endpoint: `http://localhost:5000/health`
- Check browser console for JavaScript errors

**Agent Not Responding:**
- Verify RetellAI agent is active in dashboard
- Check server logs for RetellAI errors
- Test agent in RetellAI playground
- Verify API key has permissions

**Messages Not Appearing:**
- Check browser console for errors
- Verify server returned successful response
- Check server logs for processing errors
- Try refreshing the page and starting new session

### Widget Limitations

⚠️ **The chat widget:**
- Does NOT work in production (`NODE_ENV=production`)
- Does NOT persist sessions across page refreshes
- Does NOT support rich media (images, files)
- Does NOT show typing indicators
- Does NOT support multiple tabs (each creates new session)
- Is ONLY for development testing

### When to Use the Widget

✅ **Use the chat widget for:**
- Initial agent testing
- Verifying RetellAI integration works
- Testing conversation flows
- Debugging agent responses
- Quick development iterations
- Demonstrating to stakeholders

❌ **Don't use the widget for:**
- Production conversations
- Performance testing
- Multi-user testing
- Long-term conversation history
- Real user interactions

### Testing Workflow Recommendation

1. **Start with Chat Widget** - Test basic agent functionality
2. **Use Twilio Sandbox** - Test WhatsApp integration
3. **Deploy to Render** - Test production environment
4. **Get Production Number** - Launch for real users

---

## 🗺️ Agent Mapping Configuration

The `config/agentMapping.js` file lets you route different Twilio numbers to different RetellAI agents.

### Default Configuration

```javascript
const agentMapping = {
  "+447723451913": "agent_9f143ae97176def0b8e57ed6a0",
};
```

### Adding Multiple Agents

```javascript
const agentMapping = {
  "+447723451913": "agent_9f143ae97176def0b8e57ed6a0",  // Support line
  "+447723451914": "agent_abc123def456789012345678",    // Sales line
  "+447723451915": "agent_xyz789ghi012345678901234",    // Billing line
};
```

### How It Works

1. WhatsApp message comes to one of your Twilio numbers
2. Server extracts the **receiving number** (which Twilio number received it)
3. Looks up that number in `agentMapping`
4. Uses the corresponding `agent_id` for the conversation
5. If no mapping found, falls back to `process.env.RETELL_AGENT_ID`

### Use Cases

- **Department routing** - Different numbers for support, sales, billing
- **Language support** - Spanish line, English line
- **A/B testing** - Test different agent configurations
- **Multi-brand** - Different agents for different brands

### Viewing Current Mappings

```bash
curl http://localhost:5000/twilio/mappings?api_key=your-api-key-here
```

Returns:
```json
{
  "success": true,
  "mappings": {
    "+447723451913": "agent_9f143ae97176def0b8e57ed6a0"
  },
  "count": 1,
  "defaultAgent": "agent_fallback_id"
}
```

---

## 🌐 Deployment to Render

### Step 1: Prepare Your Code

1. Make sure your code is in a Git repository (GitHub, GitLab, etc.)
2. Ensure `.env` is in `.gitignore` (never commit secrets!)
3. Push your code to the repository

### Step 2: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure the service:
   - **Name:** `retell-whatsapp-bridge` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

### Step 3: Set Environment Variables

In Render dashboard, go to **Environment** and add all your `.env` variables:

⚠️ **CRITICAL:** Set these correctly:

```
NODE_ENV=production
PORT=5000
API_KEY=<your-strong-secret-key>
RETELL_API_KEY=<your-retell-key>
RETELL_AGENT_ID=<your-agent-id>
MONGODB_URI=<your-mongodb-connection-string>
MONGODB_DATABASE_NAME=retell_whatsapp
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. Wait for deployment to complete
4. You'll get a URL like: `https://your-app.onrender.com`

### Step 5: Configure Twilio Webhook

1. Go to Twilio Console
2. Navigate to your WhatsApp sender/sandbox settings
3. Set the webhook URL to: `https://your-app.onrender.com/twilio/whatsapp`
4. Set HTTP method to **POST**
5. Save

### Step 6: Test Production

Send a WhatsApp message to your Twilio number. You should get a response!

**Check Render Logs:**
- Go to your Render service
- Click **"Logs"** tab
- Watch for incoming requests and responses

---

## 📚 API Documentation

### Chat Widget Endpoints

#### POST `/api/chat/start`
Creates a new chat session with RetellAI.

**Authentication:** 
- Development: None
- Production: Requires `X-API-Key` header

**Response:**
```json
{
  "success": true,
  "chat_id": "16b980523634a6dc504898cda492e939",
  "session_id": "507f1f77bcf86cd799439011",
  "message": "Chat session created and saved to database"
}
```

---

#### POST `/api/chat/message`
Sends a message to the agent and returns the response.

**Authentication:**
- Development: None
- Production: Requires `X-API-Key` header

**Request Body:**
```json
{
  "chat_id": "16b980523634a6dc504898cda492e939",
  "message": "Hello, how can you help me?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hello! I'm here to help. What can I do for you today?",
  "message_count": 1,
  "full_response": { }
}
```

---

#### POST `/api/chat/end`
Ends an active chat session.

**Authentication:**
- Development: None
- Production: Requires `X-API-Key` header

**Request Body:**
```json
{
  "chat_id": "16b980523634a6dc504898cda492e939"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat session ended"
}
```

---

#### GET `/api/chat/sessions`
Debug endpoint to view active sessions.

**Authentication:** Always requires `X-API-Key` header (even in development)

**Response:**
```json
{
  "total_sessions": 45,
  "active_sessions": 12,
  "recent_active": [
    {
      "whatsapp_number": "+447723451913",
      "chat_id": "16b980523634a6dc504898cda492e939",
      "status": "active",
      "message_count": 5,
      "last_message_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### WhatsApp Endpoints

#### POST `/twilio/whatsapp`
Receives incoming WhatsApp messages from Twilio webhook.

**Authentication:** Twilio signature validation (automatic)

**This endpoint is called by Twilio, not by you directly.**

---

#### GET `/twilio/mappings`
View current agent mappings.

**Authentication:** Always requires `X-API-Key` header

**Response:**
```json
{
  "success": true,
  "mappings": {
    "+447723451913": "agent_9f143ae97176def0b8e57ed6a0"
  },
  "count": 1,
  "defaultAgent": "agent_fallback_id"
}
```

---

### Health Check

#### GET `/health`
Returns server health status.

**Authentication:** None

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "production",
  "port": "5000"
}
```

---

## 🔒 Security

### Development vs Production Modes

This server has different security levels based on `NODE_ENV`:

#### Development Mode (`NODE_ENV=development`)

- ✅ Chat widget accessible at `/`
- ✅ Static files (HTML, JS, CSS) served
- ✅ Chat API endpoints work without authentication
- ✅ Twilio signature validation skipped
- 🎯 Purpose: Easy local testing

#### Production Mode (`NODE_ENV=production`)

- ❌ Chat widget hidden (shows status page)
- ❌ Static files not served
- ✅ Chat API endpoints require `X-API-Key` header
- ✅ Twilio signature validation enforced
- 🔒 Purpose: Secure production deployment

### Security Features

1. **API Key Protection**
   - All chat endpoints require `X-API-Key` in production
   - Prevents unauthorized API usage
   - Protects your RetellAI credits

2. **Twilio Signature Validation**
   - Verifies webhooks actually come from Twilio
   - Prevents spoofed webhook attacks
   - Automatically enforced in production

3. **MongoDB Access Control**
   - Connection string includes authentication
   - Database credentials required
   - Network access controls in Atlas

4. **Environment Variable Protection**
   - Secrets never committed to Git
   - `.gitignore` includes `.env`
   - Render encrypts environment variables

### Best Practices

1. **Never commit `.env` files**
2. **Use strong API keys** (30+ random characters)
3. **Restrict MongoDB network access** in production
4. **Rotate API keys periodically**
5. **Monitor Render logs** for suspicious activity
6. **Keep dependencies updated** (`npm audit`)

---

## 🔧 Troubleshooting

### Common Issues

#### "Cannot connect to MongoDB"

**Symptoms:**
```
❌ MongoDB connection error: MongoServerError: bad auth
```

**Solutions:**
1. Check `MONGODB_URI` is correct
2. Ensure password doesn't have special characters (or URL-encode them)
3. Verify database user has correct permissions
4. Check MongoDB Atlas network access allows your IP
5. Test connection string in MongoDB Compass

---

#### "Agent ID not configured"

**Symptoms:**
```
{
  "error": "Agent ID not configured"
}
```

**Solutions:**
1. Check `.env` has `RETELL_AGENT_ID`
2. Verify the agent ID is correct (starts with `agent_`)
3. Ensure `.env` file is in the root directory
4. Restart the server after changing `.env`

---

#### "Twilio webhook not working"

**Symptoms:**
- Send WhatsApp message, no response
- Twilio console shows webhook errors

**Solutions:**
1. Check webhook URL is correct in Twilio console
2. Ensure URL includes `/twilio/whatsapp` path
3. Verify server is publicly accessible (use ngrok for local testing)
4. Check server logs for errors
5. Verify `TWILIO_AUTH_TOKEN` is correct
6. In development, signature validation is skipped (check `NODE_ENV`)

---

#### "Chat widget not loading"

**Symptoms:**
- Blank page at `http://localhost:5000/`
- 404 errors in browser console

**Solutions:**
1. Check `NODE_ENV=development` in `.env`
2. Verify `public/` folder exists with HTML, JS, CSS files
3. Restart server after changing `NODE_ENV`
4. Check browser console for JavaScript errors
5. Clear browser cache

---

#### "Port already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. Change `PORT` in `.env` to different number (e.g., 5001)
2. Kill process using port 5000:
   ```bash
   # On Mac/Linux
   lsof -ti:5000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

---

#### "API key required in production"

**Symptoms:**
```
{
  "error": "Unauthorized",
  "message": "API key required in production..."
}
```

**Solutions:**
1. This is expected in production mode - it's working correctly!
2. Add `X-API-Key` header to your requests:
   ```bash
   curl -H "X-API-Key: your-api-key" http://your-url/api/chat/start
   ```
3. If testing locally, set `NODE_ENV=development` in `.env`

---

#### Session not persisting

**Symptoms:**
- Each WhatsApp message creates new conversation
- Agent doesn't remember previous messages

**Solutions:**
1. Check MongoDB connection is successful in logs
2. Verify `Session` collection exists in MongoDB Atlas
3. Check WhatsApp number format matches (E.164: +1234567890)
4. Look for errors in server logs during message processing
5. Verify `MONGODB_DATABASE_NAME` matches your database

---

#### RetellAI errors

**Symptoms:**
```
❌ Error creating chat: Failed to create chat session
```

**Solutions:**
1. Verify `RETELL_API_KEY` is correct
2. Check `RETELL_AGENT_ID` exists in your RetellAI dashboard
3. Ensure agent is a "chat agent" not "voice agent"
4. Check RetellAI account has available credits
5. Test API key directly in RetellAI API playground

---

### Getting Help

If you're still stuck:

1. **Check the logs** - Most errors are logged to console
2. **Search issues** - Check GitHub issues for similar problems
3. **Test components** - Test MongoDB, RetellAI, Twilio separately
4. **Ask the community** - Post in discussions with logs and error messages

---

## 💰 Cost Considerations

### Free Tiers

- **Render Free Tier:** 750 hours/month (1 service always on)
- **MongoDB Atlas Free Tier:** 512MB storage (plenty for thousands of sessions)
- **Twilio Trial:** $15 credit (good for testing)
- **RetellAI:** Pricing varies, check their website

### Estimated Monthly Costs (Production)

**Low Volume (< 1,000 messages/month):**
- Render: Free tier sufficient
- MongoDB: Free tier sufficient
- Twilio: ~$0.005 per message = ~$5
- RetellAI: Varies by plan and usage

**Medium Volume (1,000-10,000 messages/month):**
- Render: $7/month (paid tier for better performance)
- MongoDB: Free tier sufficient
- Twilio: ~$50-100/month
- RetellAI: Check their pricing calculator

**High Volume (10,000+ messages/month):**
- Consider dedicated hosting
- MongoDB Atlas paid tier for better performance
- Twilio volume discounts may apply
- RetellAI enterprise plans available

### Cost Optimization Tips

1. **Use free tiers** for development and testing
2. **Monitor usage** regularly in each platform's dashboard
3. **Set spending alerts** in Twilio and RetellAI
4. **Clean up old sessions** periodically in MongoDB
5. **Optimize agent responses** to reduce token usage
6. **Cache common responses** where appropriate

---

## 🎨 Customization

### Modifying the Chat Widget

Edit `public/index.html`, `public/chat.js`, and `public/styles.css` to customize:
- UI design and colors
- Chat behavior
- Welcome messages
- Input validation
- Error handling

### Changing Agent Behavior

1. Go to RetellAI Dashboard
2. Edit your agent's:
   - Conversation flow
   - Prompts and instructions
   - Response style
   - Tool integrations
3. Changes apply immediately (no code changes needed)

### Adding Custom Middleware

Create new files in `middleware/` folder:

```javascript
// middleware/rateLimiter.js
function rateLimiter(req, res, next) {
  // Your rate limiting logic
  next();
}
module.exports = rateLimiter;
```

Add to `server.js`:
```javascript
const rateLimiter = require('./middleware/rateLimiter');
app.use(rateLimiter);
```

### Database Schema Changes

Edit `models/Session.js` to add new fields:

```javascript
const sessionSchema = new mongoose.Schema({
  whatsapp_number: String,
  chat_id: String,
  agent_id: String,
  
  // Add custom fields
  user_name: String,
  user_language: String,
  tags: [String],
  
  status: String,
  created_at: Date,
  last_message_at: Date,
  message_count: Number
});
```

### Adding More Routes

Create new files in `routes/` folder:

```javascript
// routes/analytics.js
const express = require('express');
const router = express.Router();

router.get('/stats', async (req, res) => {
  // Your analytics logic
});

module.exports = router;
```

Add to `server.js`:
```javascript
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
```

---

## 🚧 Limitations & Known Issues

### Current Limitations

1. **No rich media support** - Text messages only (no images, videos, files)
2. **No conversation timeout** - Sessions remain active indefinitely
3. **No admin dashboard** - Must use MongoDB Atlas to view sessions
4. **No message queue** - Processes messages synchronously
5. **Single database** - Not multi-tenant

### Future Enhancements

Ideas for future versions:
- Admin dashboard for session management
- Rich media support (images, documents)
- Conversation analytics and insights
- Multi-language support
- Message queuing for high volume
- Automated session cleanup
- User profile management
- Integration with CRM systems
- Webhook events for external systems
- A/B testing framework

Feel free to fork and add these features!

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use ES6+ features
- Use async/await over callbacks
- Add comments for complex logic
- Handle all errors appropriately
- Keep functions focused and small
- Use descriptive variable names

---

## 🙏 Acknowledgments

- **RetellAI** - For their amazing conversational AI platform
- **Twilio** - For WhatsApp Business API access
- **MongoDB** - For flexible document database
- **The community** - For feedback and contributions

---

## 🎯 Community & Support

- 🏫 **Skool Community:** Join our AI Freedom Finders community for support, discussions, and updates: https://www.skool.com/ai-freedom-finders
- 📱 **TikTok:** Follow for AI tutorials, tips, and behind-the-scenes content: https://www.tiktok.com/@ai_entrepreneur_educator
- 🌐 **Website:** https://bramforth.ai
- **GitHub Issues:** Report bugs and request features
- **Discussions:** Ask questions and share your implementations

---

**Built with ❤️ for the community**

*Happy building! 🚀*