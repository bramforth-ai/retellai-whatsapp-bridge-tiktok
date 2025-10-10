const express = require('express');
const router = express.Router();
const retellService = require('../services/retellService');
const Session = require('../models/Session');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const productionApiAuth = require('../middleware/productionApiAuth');

// POST /api/chat/start - Initialize new chat session
router.post('/start', productionApiAuth, async (req, res) => {
    try {
    const agentId = process.env.RETELL_AGENT_ID;
    
    if (!agentId) {
      return res.status(500).json({ error: 'Agent ID not configured' });
    }

    // Create new chat session with RetellAI
    const chat = await retellService.createChat(agentId);
    
    // For web chat, use a temporary identifier (could use session ID or IP)
    // In Phase 4b, this will be the actual WhatsApp number
    const webIdentifier = `web_${Date.now()}`;

    // Save session to MongoDB
    const session = await Session.findOrCreate(webIdentifier, agentId, chat.chat_id);

    res.json({
      success: true,
      chat_id: chat.chat_id,
      session_id: session._id,
      message: 'Chat session created and saved to database'
    });

  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({
      error: 'Failed to start chat',
      details: error.message
    });
  }
});

// POST /api/chat/message - Send message to agent
router.post('/message', productionApiAuth, async (req, res) => {
  try {
    const { chat_id, message } = req.body;

    if (!chat_id || !message) {
      return res.status(400).json({ error: 'chat_id and message are required' });
    }

    // Find session in MongoDB
    const session = await Session.findOne({ chat_id: chat_id, status: 'active' });
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found or ended' });
    }

    // Send message to RetellAI
    const response = await retellService.sendMessage(chat_id, message);

    // Update session activity in MongoDB
    await session.updateActivity();

    // Extract agent's response from the messages array
    const agentMessage = response.messages && response.messages.length > 0
      ? response.messages[response.messages.length - 1]
      : null;

    res.json({
      success: true,
      response: agentMessage?.content || 'No response from agent',
      message_count: session.message_count,
      full_response: response
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// POST /api/chat/end - End chat session
router.post('/end', productionApiAuth, async (req, res) => {
  try {
    const { chat_id } = req.body;

    if (!chat_id) {
      return res.status(400).json({ error: 'chat_id is required' });
    }

    // Find and end session in MongoDB
    const session = await Session.findOne({ chat_id: chat_id, status: 'active' });
    
    if (session) {
      await session.endSession();
      console.log('✅ Session ended:', session._id);
    }

    res.json({
      success: true,
      message: 'Chat session ended'
    });

  } catch (error) {
    console.error('Error ending chat:', error);
    res.status(500).json({
      error: 'Failed to end chat',
      details: error.message
    });
  }
});

// GET /api/chat/sessions - Debug endpoint to see active sessions
router.get('/sessions', apiKeyAuth, async (req, res) => {
  try {
    const activeSessions = await Session.find({ status: 'active' })
      .sort({ last_message_at: -1 })
      .limit(20);
    
    const allSessionCount = await Session.countDocuments();
    const activeSessionCount = await Session.countDocuments({ status: 'active' });

    res.json({
      total_sessions: allSessionCount,
      active_sessions: activeSessionCount,
      recent_active: activeSessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      error: 'Failed to fetch sessions',
      details: error.message
    });
  }
});

module.exports = router;