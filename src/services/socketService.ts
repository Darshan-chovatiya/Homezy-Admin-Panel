import { io, Socket } from 'socket.io-client';

// Socket configuration
const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  // Initialize socket connection
  initSocket(adminId: string) {
    if (this.socket) {
      console.log('Socket already connected');
      return;
    }

    console.log('Initializing socket connection...');

    // Create socket connection
    this.socket = io(SOCKET_URL, {
      auth: {
        adminId: adminId,
        userType: 'admin',
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection success
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnection success
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });
  }

  // Disconnect socket
  disconnectSocket() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Send message to user/vendor
  sendMessage(data: {
    receiverId: string;
    receiverType: 'user' | 'vendor';
    message: string;
    messageType: 'text' | 'image';
  }) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    console.log('📤 Sending message:', data);
    this.socket.emit('admin_send_message', data);
  }

  // Listen for incoming messages from users
  onUserMessage(callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('user_message', (data) => {
      console.log('📩 Received message from user:', data);
      callback(data);
    });
  }

  // Listen for incoming messages from vendors
  onVendorMessage(callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('vendor_message', (data) => {
      console.log('📩 Received message from vendor:', data);
      callback(data);
    });
  }

  // Listen for user online/offline status
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('user_status_change', (data) => {
      console.log('👤 User status changed:', data);
      callback(data);
    });
  }

  // Listen for typing indicator
  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      callback(data);
    });
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;