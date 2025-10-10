// Chat state
let chatId = null;
let isConnected = false;

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const startButton = document.getElementById('startButton');
const endButton = document.getElementById('endButton');
const chatMessages = document.getElementById('chatMessages');
const statusIndicator = document.getElementById('statusIndicator');
const debugChatId = document.getElementById('debugChatId');
const debugStatus = document.getElementById('debugStatus');

// Initialize event listeners
startButton.addEventListener('click', startChat);
endButton.addEventListener('click', endChat);
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !sendButton.disabled) {
    sendMessage();
  }
});

// Start a new chat session
async function startChat() {
  try {
    updateDebugStatus('Starting chat...');
    startButton.disabled = true;

    const response = await fetch('/api/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      chatId = data.chat_id;
      isConnected = true;
      
      // Update UI
      messageInput.disabled = false;
      sendButton.disabled = false;
      endButton.disabled = false;
      statusIndicator.textContent = 'Connected';
      statusIndicator.className = 'status connected';
      
      // Update debug info
      debugChatId.textContent = chatId;
      updateDebugStatus('Connected');

      // Clear system message and add welcome
      chatMessages.innerHTML = '';
      addSystemMessage('Chat started! Send a message to begin.');
      
      // Focus input
      messageInput.focus();
    } else {
      throw new Error(data.error || 'Failed to start chat');
    }

  } catch (error) {
    console.error('Error starting chat:', error);
    addSystemMessage(`Error: ${error.message}`);
    startButton.disabled = false;
    updateDebugStatus('Error');
  }
}

// Send a message to the agent
async function sendMessage() {
  const message = messageInput.value.trim();
  
  if (!message || !chatId) return;

  try {
    // Disable input while processing
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to chat
    addUserMessage(message);
    messageInput.value = '';
    
    updateDebugStatus('Sending message...');

    // Send to backend
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message: message
      })
    });

    const data = await response.json();

    if (data.success) {
      // Add agent response
      addAgentMessage(data.response);
      updateDebugStatus('Message received');
    } else {
      throw new Error(data.error || 'Failed to send message');
    }

  } catch (error) {
    console.error('Error sending message:', error);
    addSystemMessage(`Error: ${error.message}`);
    updateDebugStatus('Error');
  } finally {
    // Re-enable input
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
  }
}

// End the chat session
async function endChat() {
  try {
    updateDebugStatus('Ending chat...');

    const response = await fetch('/api/chat/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    });

    const data = await response.json();

    if (data.success) {
      // Reset state
      chatId = null;
      isConnected = false;
      
      // Update UI
      messageInput.disabled = true;
      sendButton.disabled = true;
      endButton.disabled = true;
      startButton.disabled = false;
      statusIndicator.textContent = 'Not Connected';
      statusIndicator.className = 'status disconnected';
      
      // Update debug info
      debugChatId.textContent = 'None';
      updateDebugStatus('Disconnected');

      addSystemMessage('Chat ended. Click "Start Chat" to begin a new conversation.');
    }

  } catch (error) {
    console.error('Error ending chat:', error);
    addSystemMessage(`Error: ${error.message}`);
  }
}

// UI Helper Functions
function addUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function addAgentMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message agent-message';
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function addSystemMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'system-message';
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateDebugStatus(status) {
  debugStatus.textContent = status;
}

// Initial status
updateDebugStatus('Idle');