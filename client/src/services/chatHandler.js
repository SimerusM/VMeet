const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ChatHandler {
  constructor(meeting_id, username, socket, setChatHistory, onError) {
    this.meeting_id = meeting_id;
    this.username = username;
    this.socket = socket;
    this.chatHistory = [];
    this.setChatHistory = setChatHistory;
    this.onError = onError;
  }

  async initialize() {
    this.setupSocketListeners();
    const response = await fetch(`${apiUrl}/api/chat_history/${this.meeting_id}`)
    if (!response.ok) {
      this.onError('Failed to fetch chat history. Please try again.');
      return;
    }
    this.chatHistory = await response.json();
    if (this.setChatHistory) {
      this.setChatHistory([...this.chatHistory]); // update UI
    }
  }

  setupSocketListeners() {
    this.socket.on('chat_message', (data) => {
      console.log("WebSocket event received:", data);
      this.chatHistory.push(data);
      if (this.setChatHistory) {
        this.setChatHistory([...this.chatHistory]); // update UI
      }
    });
  }

  sendMessage(text) {
    this.socket.emit('chat_message', { meeting_id: this.meeting_id, text: text, sender: this.username });
  }

  setChatHistoryListener(listener) {
    this.setChatHistory = listener;
  }
}

export default ChatHandler;
