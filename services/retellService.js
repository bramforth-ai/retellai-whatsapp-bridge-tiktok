const Retell = require('retell-sdk').default;

class RetellService {
  constructor() {
    this.client = new Retell({
      apiKey: process.env.RETELL_API_KEY
    });
  }

  // Create a new chat session
  async createChat(agentId, dynamicVariables = {}) {
    try {
      const chat = await this.client.chat.create({
        agent_id: agentId,
        retell_llm_dynamic_variables: dynamicVariables  // ADD THIS
      });
      console.log('✅ New chat created:', chat.chat_id);
      return chat;
    } catch (error) {
      console.error('❌ Error creating chat:', error.message);
      throw new Error('Failed to create chat session');
    }
  }

  // Send a message and get response
  async sendMessage(chatId, message) {
    try {
      const response = await this.client.chat.createChatCompletion({
        chat_id: chatId,
        content: message
      });
      console.log('✅ Message sent, received response');
      return response;
    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      throw new Error('Failed to send message');
    }
  }
}

// Export a single instance
module.exports = new RetellService();