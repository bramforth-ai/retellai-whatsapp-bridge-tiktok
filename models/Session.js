const mongoose = require('mongoose');

// Simple session schema - just mapping WhatsApp numbers to RetellAI chat IDs
const sessionSchema = new mongoose.Schema({
  whatsapp_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chat_id: {
    type: String,
    required: true
  },
  agent_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_message_at: {
    type: Date,
    default: Date.now
  },
  message_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for finding active sessions quickly
sessionSchema.index({ status: 1, last_message_at: -1 });

// Static method to find or create a session
sessionSchema.statics.findOrCreate = async function(whatsappNumber, agentId, chatId) {
  let session = await this.findOne({ whatsapp_number: whatsappNumber, status: 'active' });
  
  if (!session) {
    session = await this.create({
      whatsapp_number: whatsappNumber,
      chat_id: chatId,
      agent_id: agentId,
      status: 'active'
    });
    console.log('✅ New session created:', session._id);
  } else {
    console.log('✅ Existing session found:', session._id);
  }
  
  return session;
};

// Method to update last message time
sessionSchema.methods.updateActivity = async function() {
  this.last_message_at = new Date();
  this.message_count += 1;
  await this.save();
};

// Method to end session
sessionSchema.methods.endSession = async function() {
  this.status = 'ended';
  await this.save();
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;