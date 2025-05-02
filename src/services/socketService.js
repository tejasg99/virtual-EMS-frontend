import { io } from "socket.io-client";
import { store } from "../app/store.js";

class SocketService {
  socket = null;
  // Store callbacks for different events
  eventCallbacks = {
    newChatMessage: [],
    chatHistory: [],
    newQuestion: [],
    questionAnswered: [],
    qnaHistory: [],
    socketError: [],
  };

  connect() {
    // Prevent multiple connections
    if (this.socket && this.socket.connected) {
      console.log("Socket already connected");
      return;
    }

    const token = store.getState().auth?.token; // Get token from the redux store
    if (!token) {
      console.error(
        "SocketService: Cannot connect without authentication token"
      );
      return;
    }

    // Get backend URL from environment variables
    // Ensure VITE_SOCKET_URL is set, fallback to API URL if not explicitly set
    const socketURL =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL.replace("/api/v1", ""); // Remove API path if falling back
    console.log(`SocketService: Connecting to ${socketURL}...`);

    // Initialize socket connection with authentication token
    this.socket = io(socketURL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 3000, // in milliseconds
      // transports: ['websocket'], // Optionally force websocket
    });

    // Standard connection event listeners
    this.socket.on("connect", () => {
      console.log(
        `SocketService: Connected successfully with ID: ${this.socket.id}`
      );
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`SocketService: Disconnected, Reason: ${reason}`);
      // Handle disconnect logic if needed (e.g., show message to user)
    });

    this.socket.on("connect_error", (error) => {
      console.error(`SocketService: Connection Error: ${error.message}`);
      // Handle specific errors (e.g., auth error might require logout)
      if (error.message.includes("Authentication error")) {
        // Consider dispatching logout action here if auth fails persistently
        console.error(
          "Socket Authentication failed. Logging out might be required."
        );
        // store.dispatch(logOut()); // Example - import logOut action if needed
      }
    });

    // Custom application event listeners
    // Listen for events defined in the backend
    this.socket.on("newChatMessage", (message) => {
      console.log("SocketService: Recieved new chat message", message);
      this.triggerEventCallbacks("newChatMessage", message);
    });

    this.socket.on("chatHistory", (history) => {
      console.log(
        `SocketService: Received chatHistory (${history?.length || 0} messages)`
      );
      this.triggerEventCallbacks("chatHistory", history);
    });

    this.socket.on("newQuestion", (question) => {
      console.log("SocketService: Received newQuestion", question);
      this.triggerEventCallbacks("newQuestion", question);
    });

    this.socket.on("questionAnswered", (question) => {
      console.log("SocketService: Received questionAnswered", question);
      this.triggerEventCallbacks("questionAnswered", question);
    });

    this.socket.on("qnaHistory", (history) => {
      console.log(
        `SocketService: Received qnaHistory (${history?.length || 0} questions)`
      );
      this.triggerEventCallbacks("qnaHistory", history);
    });

    // Listen for generic errors emitted by the backend handlers
    this.socket.on("socketError", (error) => {
      console.error("SocketService: Received socketError from server:", error);
      this.triggerEventCallbacks("socketError", error);
      // Optionally show a toast notification
      // toast.error(error.message || 'A server error occurred.');
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("SocketService: Disconnecting...");
      this.socket.disconnect();
      this.socket = null;
      // Clear all callbacks on explicit disconnect
      Object.keys(this.eventCallbacks).forEach((event) => {
        this.eventCallbacks[event] = [];
      });
    }
  }

  // Emmiter methods
  // Emit event with acknowledgement (if callback provided)
  emitWithAck(eventName, data, callback) {
    if (this.socket && this.socket.connected) {
      console.log(`SocketService: Emitting ${eventName}`, data);
      this.socket.emit(eventName, data, (response) => {
        console.log(`SocketService: Ack received for ${eventName}`, response);
        if (callback && typeof callback === "function") {
          callback(response);
        }
      });
    } else {
      console.error(
        `SocketService: Cannot emit ${eventName}. Socket not connected.`
      );
      if (callback && typeof callback === "function") {
        callback({ success: false, message: "Not connected to server." });
      }
    }
  }

  joinEventRoom(eventId, callback) {
    this.emitWithAck("joinEventRoom", { eventId }, callback);
  }

  leaveEventRoom(eventId, callback) {
    // No ack needed usually for leaving
    if (this.socket && this.socket.connected) {
      console.log(`SocketService: Emitting leaveEventRoom for ${eventId}`);
      this.socket.emit("leaveEventRoom", { eventId });
      if (callback) callback({ success: true }); // Assume success locally
    } else {
      console.error(
        `SocketService: Cannot emit leaveEventRoom. Socket not connected.`
      );
      if (callback) callback({ success: false, message: "Not connected." });
    }
  }

  sendChatMessage(eventId, message, callback) {
    this.emitWithAck("sendChatMessage", { eventId, message }, callback);
  }

  joinEventQnaRoom(eventId, callback) {
    this.emitWithAck("joinEventQnaRoom", { eventId }, callback);
  }

  leaveEventQnaRoom(eventId, callback) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leaveEventQnaRoom", { eventId });
      if (callback) callback({ success: true });
    } else {
      if (callback) callback({ success: false, message: "Not connected." });
    }
  }

  submitQuestion(eventId, question, callback) {
    this.emitWithAck("submitQuestion", { eventId, question }, callback);
  }

  answerQuestion(eventId, questionId, answer, callback) {
    this.emitWithAck(
      "answerQuestion",
      { eventId, questionId, answer },
      callback
    );
  }

  // Listener Registration methods

  // Register a callback for a specific event
  on(eventName, callback) {
    if (this.eventCallbacks[eventName] && typeof callback === "function") {
      this.eventCallbacks[eventName].push(callback);
      console.log(`SocketService: Registered listener for ${eventName}`);
    } else {
      console.warn(
        `SocketService: Attempted to register listener for unknown event: ${eventName}`
      );
    }
  }

  // Unregister a specific callback for an event
  off(eventName, callback) {
    if (this.eventCallbacks[eventName]) {
      this.eventCallbacks[eventName] = this.eventCallbacks[eventName].filter(
        (cb) => cb !== callback
      );
      console.log(`SocketService: Unregisterd listener for ${eventName} `);
    }
  }

  // Helper to trigger all registered callbacks for an event
  triggerEventCallbacks(eventName, data) {
    if (this.eventCallbacks[eventName]) {
      this.eventCallbacks[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `SocketService: Error in callback for event ${eventName}: `,
            error
          );
        }
      });
    }
  }
}

// Export a singleton instance of this service
const socketService = new SocketService();
export default socketService;
