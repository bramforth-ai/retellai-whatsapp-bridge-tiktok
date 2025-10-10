/**
 * Agent Mapping Configuration
 * Maps WhatsApp phone numbers to RetellAI agent IDs
 * 
 * Format: Phone numbers should be in E.164 format (+1234567890)
 * 
 * Use Case Examples:
 * - Different departments (Support, Sales, Billing)
 * - Different languages (English line, Spanish line)
 * - A/B testing different agent configurations
 * - Multi-brand support
 */

// Configure your agent mappings here
// Replace with your actual Twilio WhatsApp numbers and RetellAI agent IDs
const agentMapping = {
  // Example format:
  // "+14155551234": "agent_abc123def456ghi789",  // Support line
  // "+14155555678": "agent_xyz789abc123def456",  // Sales line
  // "+14155559012": "agent_qrs456tuv789wxy012",  // Billing line
};

/**
 * Get agent ID for a given phone number
 * Falls back to default agent if no mapping found
 * @param {string} phoneNumber - Phone number in E.164 format
 * @returns {string} Agent ID
 */
function getAgentForNumber(phoneNumber) {
  const agentId = agentMapping[phoneNumber];
  
  if (agentId) {
    console.log(`✅ Found agent mapping: ${phoneNumber} → ${agentId}`);
    return agentId;
  }
  
  // Fallback to default agent from environment
  const defaultAgent = process.env.RETELL_AGENT_ID;
  console.log(`ℹ️  No mapping for ${phoneNumber}, using default agent: ${defaultAgent}`);
  return defaultAgent;
}

/**
 * Check if a phone number has a specific agent mapping
 * @param {string} phoneNumber - Phone number in E.164 format
 * @returns {boolean}
 */
function hasMapping(phoneNumber) {
  return phoneNumber in agentMapping;
}

/**
 * Get all configured mappings (for admin/debug)
 * @returns {object}
 */
function getAllMappings() {
  return {
    mappings: agentMapping,
    count: Object.keys(agentMapping).length,
    defaultAgent: process.env.RETELL_AGENT_ID
  };
}

module.exports = {
  getAgentForNumber,
  hasMapping,
  getAllMappings
};