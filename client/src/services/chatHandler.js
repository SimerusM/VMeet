const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ChatHandler {
  constructor(meeting_id, username, socket, setChatHistory, onError) {
    this.meeting_id = meeting_id;
    this.username = username;
    this.socket = socket;
    this.chatHistory = [];
    this.setChatHistory = setChatHistory;
    this.onError = onError;
    this.rateLimited = false; // Initialize rate-limited flag
    this.rateLimitTimeWindow = 3; // 3 second rate limit cool down
  }

  async initialize() {
    this.setupSocketListeners();
    const response = await fetch(`${apiUrl}/api/chat_history/${this.meeting_id}`)
    if (!response.ok) {
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
      if (data['rate_limited'] === true) {
        console.log("Rate limited chat");
        this.rateLimited = true;

        // Refresh rate limiting flag callback
        setTimeout(() => {
          this.rateLimited = false;
          console.log("Rate limit has been reset automatically after timeout.");
        }, this.rateLimitTimeWindow * 1000);

      } else {
        this.chatHistory.push(data);
        if (this.setChatHistory) {
          this.setChatHistory([...this.chatHistory]); // update UI
        }
      }
    });

    // Listen for the rate limit reset event
    this.socket.on('rate_limit_reset', () => {
      console.log("Rate limit reset received");
      this.rateLimited = false; // Reset the flag
    });
  }

  sendMessage(text) {
    if (this.rateLimited) {
      console.log("You are rate limited");
      return;
    }
    this.socket.emit('chat_message', { meeting_id: this.meeting_id, text: text, sender: this.username });
  }

  setChatHistoryListener(listener) {
    this.setChatHistory = listener;
  }
}

export default ChatHandler;
