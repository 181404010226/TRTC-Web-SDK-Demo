/* eslint-disable*/
import { userId } from './room.js';

let chatTrtc = null;

export function setupChatUI(trtc) {
  chatTrtc = trtc;
  
  // Check if chat container exists
  let chatContainer = document.getElementById('chat-container');
  if (!chatContainer) {
    // Create chat container if it doesn't exist
    chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.className = 'chat-container';
    
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chatMessages';
    chatMessages.className = 'chat-messages';
    
    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'chat-input-container';
    
    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.id = 'chatInput';
    chatInput.className = 'chat-input';
    chatInput.placeholder = window.lang_ === 'zh-cn' ? '输入消息...' : 'Type a message...';
    
    const sendButton = document.createElement('button');
    sendButton.id = 'sendMessage';
    sendButton.className = 'btn btn-primary send-btn';
    sendButton.innerHTML = window.lang_ === 'zh-cn' ? '发送' : 'Send';
    
    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(sendButton);
    
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(chatInputContainer);
    
    // Add chat container to the page
    const contentElement = document.querySelector('.content');
    contentElement.appendChild(chatContainer);
    
    // Add event listeners
    sendButton.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .chat-container {
        margin-top: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
        height: 200px;
        display: flex;
        flex-direction: column;
      }
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        background-color: #f9f9f9;
      }
      .chat-input-container {
        display: flex;
        border-top: 1px solid #ddd;
        padding: 10px;
      }
      .chat-input {
        flex: 1;
        border-radius: 3px;
        border: 1px solid #ccc;
        padding: 5px;
      }
      .send-btn {
        margin-left: 10px;
      }
      .message {
        margin-bottom: 5px;
        padding: 5px;
        border-radius: 5px;
      }
      .self-message {
        background-color: #dcf8c6;
        align-self: flex-end;
        margin-left: 20%;
      }
      .other-message {
        background-color: #f1f0f0;
        align-self: flex-start;
        margin-right: 20%;
      }
      .message-sender {
        font-weight: bold;
        margin-right: 5px;
      }
    `;
    document.head.appendChild(style);
  }
}

export function initChatEvents(trtc) {
  trtc.on(TRTC.EVENT.CUSTOM_MESSAGE, (event) => {
    console.log('Received custom message event:', event);
    try {
      // Decode ArrayBuffer to string
      const jsonString = new TextDecoder().decode(event.data);
      console.log('Decoded message:', jsonString);
      
      // Parse JSON string to object
      const messageObj = JSON.parse(jsonString);
      console.log('Parsed message object:', messageObj);
      
      if (messageObj.userId !== userId) {
        displayMessage(messageObj, false);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });
}

function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  if (message && chatTrtc) {
    // Create message object
    const messageObj = {
      userId: userId,
      message: message,
      timestamp: Date.now()
    };
    
    console.log('Sending message object:', messageObj);
    
    try {
      // Prepare the ArrayBuffer data
      const jsonString = JSON.stringify(messageObj);
      const data = new TextEncoder().encode(jsonString).buffer;
      console.log('Encoded message:', jsonString);
      
      // Send message via SignalChannel API
      chatTrtc.sendCustomMessage({
        cmdId: 1, // Required cmdId parameter (1-10)
        data: data // Convert string to ArrayBuffer
      });
      console.log('Message sent successfully');
      
      // Add message to chat UI
      displayMessage(messageObj, true);
      // Clear input
      chatInput.value = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
}

export function displayMessage(messageObj, isSelf) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(isSelf ? 'self-message' : 'other-message');
  
  const senderSpan = document.createElement('span');
  senderSpan.classList.add('message-sender');
  senderSpan.textContent = isSelf ? 
    (window.lang_ === 'zh-cn' ? '你' : 'You') : 
    messageObj.userId;
  
  const messageContent = document.createElement('span');
  messageContent.textContent = messageObj.message;
  
  messageDiv.appendChild(senderSpan);
  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);
  
  // Auto scroll to the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
} 