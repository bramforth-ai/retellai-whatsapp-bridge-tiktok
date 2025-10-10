const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const retellService = require('../services/retellService');
const Session = require('../models/Session');
const agentMapping = require('../config/agentMapping');
const validateTwilioSignature = require('../middleware/twilioValidation');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// Twilio MessagingResponse for sending replies
const MessagingResponse = twilio.twiml.MessagingResponse;

// POST /twilio/whatsapp - Webhook for incoming WhatsApp messages
router.post('/whatsapp',
    express.urlencoded({ extended: false }), // Twilio sends form-encoded data
    validateTwilioSignature,                 // ADD THIS LINE - Validate Twilio signature
    async (req, res) => {
        console.log('\n=== Incoming WhatsApp Message ===');

        // Extract message details from Twilio
        const from = req.body.From; // Sender (user's number)
        const to = req.body.To;     // Receiver (your Twilio WhatsApp number)
        const body = req.body.Body; // The message text
        const messageSid = req.body.MessageSid;

        console.log('From:', from);
        console.log('To:', to);
        console.log('Message:', body);
        console.log('MessageSid:', messageSid);

        try {
            // Acknowledge Twilio immediately with empty response
            const twiml = new MessagingResponse();
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());

            // Process message asynchronously
            await handleWhatsAppMessage(from, to, body);

        } catch (error) {
            console.error('Error handling WhatsApp message:', error);
            // Already sent response to Twilio, just log the error
        }
    }
);

// Process WhatsApp message
async function handleWhatsAppMessage(from, to, messageText) {
    try {
        // Extract clean phone numbers
        const senderNumber = from.replace('whatsapp:', '');
        const receiverNumber = to.replace('whatsapp:', '');

        console.log('Processing message from:', senderNumber);
        console.log('Received at Twilio number:', receiverNumber);

        // Get agent ID based on which Twilio number received the message
        const agentId = agentMapping.getAgentForNumber(receiverNumber);

        if (!agentId) {
            console.error('❌ No agent configured for this number');
            await sendWhatsAppMessage(from, "Service not configured. Please contact support.");
            return;
        }

        // Look up existing session or create new one
        let session = await Session.findOne({
            whatsapp_number: senderNumber,  // FIXED: was phoneNumber
            status: 'active'
        });

        let chatId;

        if (session) {
            // Existing session found
            console.log('✅ Found existing session:', session.chat_id);
            chatId = session.chat_id;
        } else {
            // No active session - create new RetellAI chat
            console.log('🆕 Creating new RetellAI chat session');
            const chat = await retellService.createChat(agentId, {
                phoneNumber: senderNumber,  // Pass phone number as string
                channel: 'whatsapp'         // Optional: identify the channel
            });
            chatId = chat.chat_id;

            // Save to MongoDB
            session = await Session.findOrCreate(senderNumber, agentId, chatId);  // FIXED: was phoneNumber
            console.log('✅ New session saved to database');
        }

        // Send message to RetellAI
        console.log('📤 Sending to RetellAI...');
        const response = await retellService.sendMessage(chatId, messageText);

        // Update session activity
        await session.updateActivity();

        // Extract agent's response
        const agentMessage = response.messages && response.messages.length > 0
            ? response.messages[response.messages.length - 1]
            : null;

        const replyText = agentMessage?.content || 'Sorry, I could not process that message.';

        console.log('📥 Agent response:', replyText.substring(0, 100) + '...');

        // Send response back to WhatsApp via Twilio
        await sendWhatsAppMessage(from, replyText);

        console.log('✅ Message sent to WhatsApp');
        console.log('=================================\n');

    } catch (error) {
        console.error('Error processing WhatsApp message:', error);

        // Try to send error message to user
        try {
            await sendWhatsAppMessage(from, "Sorry, I encountered an error. Please try again.");
        } catch (sendError) {
            console.error('Error sending error message:', sendError);
        }
    }
}

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(to, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    const client = twilio(accountSid, authToken);

    await client.messages.create({
        body: message,
        from: fromNumber,
        to: to
    });
}

// GET /twilio/mappings - View current agent mappings (for debugging)
router.get('/mappings', apiKeyAuth, (req, res) => {
    const mappings = agentMapping.getAllMappings();
    res.json({
        success: true,
        ...mappings
    });
});

module.exports = router;