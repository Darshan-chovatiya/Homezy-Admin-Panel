import { io, Socket } from 'socket.io-client';

interface SocketMessage {
  _id: string;
  senderId: string;
  senderType: 'admin' | 'user' | 'vendor';
  receiverId: string;
  receiverType: 'admin' | 'user' | 'vendor';
  message: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    name: string;
    businessName?: string;
    image?: string;
  };
}

interface TypingData {
  chatId: string;
  userType: string;
  isTyping: boolean;
}

// Socket configuration
const SOCKET_URL =  'https://homezy.itfuturz.in/';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  // Initialize socket connection
  initSocket(adminId: string) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    console.log('🚀 Initializing socket connection for admin:', adminId);

    // Create socket connection
    this.socket = io(SOCKET_URL, {
      auth: {
        token: this.getAuthToken(),
      },
      query: {
        adminId: adminId,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection success
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
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
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => {
          if (this.socket) {
            this.socket.connect();
          }
        }, 2000 * this.reconnectAttempts);
      }
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnection success
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    // Socket error
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  // Disconnect socket
  disconnectSocket() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
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
    messageType?: 'text' | 'image' | 'file';
    orderId?: string;
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return false;
    }

    console.log('📤 Sending message via socket:', data);
    this.socket.emit('send_support_message', {
      toUserId: data.receiverId,
      toUserType: data.receiverType,
      message: data.message,
      messageType: data.messageType || 'text',
      orderId: data.orderId || null,
    });
    return true;
  }

  // Send vendor-admin message
  sendVendorAdminMessage(data: {
    message: string;
    messageType?: 'text' | 'image' | 'file';
    mediaUrl?: string;
    orderId?: string;
    vendorId?: string; // Required for admin messages
  }) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected');
      return false;
    }

    console.log('📤 Sending vendor-admin message:', data);
    this.socket.emit('send_vendor_admin_message', data);
    return true;
  }

  // Listen for incoming messages from users
  onUserMessage(callback: (data: SocketMessage) => void) {
    if (!this.socket) return;
    this.socket.on('support_message_received', callback);
  }

  // Listen for incoming messages from vendors
  onVendorMessage(callback: (data: SocketMessage) => void) {
    if (!this.socket) return;
    this.socket.on('support_message_received', callback);
  }

  // Listen for vendor-admin messages
  onVendorAdminMessageReceived(callback: (data: { message: SocketMessage; chatId: string; senderType: string; unreadCount: number }) => void) {
    if (!this.socket) return;
    this.socket.on('vendor_admin_message_received', callback);
  }

  // Listen for user-admin messages
  onUserAdminMessageReceived(callback: (data: { message: SocketMessage; chatId: string; senderType: string; unreadCount: number }) => void) {
    if (!this.socket) return;
    this.socket.on('user_admin_message_received', callback);
  }

  onVendorAdminMessageSent(callback: (data: { message: SocketMessage; chatId: string }) => void) {
    if (!this.socket) return;
    this.socket.on('vendor_admin_message_sent', callback);
  }

  // Join order room for real-time updates
  joinOrderRoom(orderId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('join_order_room', { orderId });
    console.log('📊 Joined order room:', orderId);
  }

  // Leave order room
  leaveOrderRoom(orderId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('leave_order_room', { orderId });
    console.log('📊 Left order room:', orderId);
  }

  // Typing indicators
  startTyping(chatId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('vendor_admin_typing_start', { chatId });
  }

  stopTyping(chatId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('vendor_admin_typing_stop', { chatId });
  }

  // Listen for typing indicators
  onTyping(callback: (data: TypingData) => void) {
    if (!this.socket) return;
    this.socket.on('vendor_admin_typing', callback);
  }

  // Listen for order updates
  onOrderUpdate(callback: (data: { orderId: string; orderNumber: string; status: string; timestamp: string }) => void) {
    if (!this.socket) return;
    this.socket.on('order_updated', callback);
  }

  // Listen for vendor location updates
  onVendorLocationUpdate(callback: (data: { orderId: string; orderNumber: string; location: { latitude: number; longitude: number; address: string }; timestamp: string }) => void) {
    if (!this.socket) return;
    this.socket.on('vendor_location_updated', callback);
  }

  // Listen for vendor availability updates
  onVendorAvailabilityUpdate(callback: (data: { vendorId: string; vendorName: string; isOnline: boolean; timestamp: string }) => void) {
    if (!this.socket) return;
    this.socket.on('vendor_availability_updated', callback);
  }

  // Listen for vendor going offline
  onVendorWentOffline(callback: (data: { vendorId: string; vendorName: string; timestamp: string }) => void) {
    if (!this.socket) return;
    this.socket.on('vendor_went_offline', callback);
  }

  // Listen for messages read receipts
  onMessagesRead(callback: (data: { chatId: string; readBy: string; readAt: string }) => void) {
    if (!this.socket) return;
    this.socket.on('messages_read', callback);
  }

  // Listen for user online/offline status
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void) {
    if (!this.socket) return;
    this.socket.on('user_status_change', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get auth token (implement based on your auth system)
  private getAuthToken(): string {
    // Return your encrypted JWT token here
    // This should match what your backend expects
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    
    if (!token) {
      console.warn('⚠️ No auth token found in localStorage');
      return '';
    }

    console.log('🔑 Using auth token for socket:', token.substring(0, 20) + '...');
    
    // If your backend expects encrypted token, you might need to encrypt it here
    // For now, assuming the token is already encrypted or ready to use
    return token;
  }

  // Reconnect manually
  reconnect(adminId: string) {
    console.log('🔄 Manual reconnect requested');
    this.disconnectSocket();
    setTimeout(() => {
      this.initSocket(adminId);
    }, 1000);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;