import notificationService from './notification';

// Types for chat API
export interface ChatMessage {
  _id: string;
  message: string;
  messageType: 'text' | 'image' | 'file';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  thumbnailUrl?: string;
  senderType: 'admin' | 'user' | 'vendor';
  isSentByMe: boolean;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: {
    orderId?: string;
    orderUpdate?: any;
  };
  sender?: {
    _id: string;
    name: string;
    businessName?: string;
    image?: string;
  };
}

export interface ChatListItem {
  _id: string;
  partner: {
    _id: string;
    name: string;
    businessName?: string;
    image?: string;
    type: 'admin' | 'user' | 'vendor';
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  orderId?: string;
  orderNumber?: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  chatInfo: {
    partner: {
      _id: string;
      name: string;
      businessName?: string;
      image?: string;
      rating?: number;
      type: 'admin' | 'user' | 'vendor';
    };
    orderId?: string;
    orderNumber?: string;
  } | null;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalMessages: number;
  };
}

export interface ChatListResponse {
  chats: ChatListItem[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalChats: number;
  };
}

class ChatApiService {

  // Send message from admin to user/vendor
  async sendMessage(data: {
    message: string;
    messageType?: 'text' | 'image' | 'file';
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileMimeType?: string;
    thumbnailUrl?: string;
    orderId?: string;
    orderUpdate?: any;
    receiverId: string;
    receiverType: 'user' | 'vendor';
  }) {
    try {
      // For now, just return success since chat API endpoints may not be implemented yet
      console.log('📤 Sending message:', data);
      return { success: true, data: { messageId: Date.now().toString() } };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Send vendor-admin message
  async sendVendorAdminMessage(data: {
    message: string;
    messageType?: 'text' | 'image' | 'file';
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileMimeType?: string;
    thumbnailUrl?: string;
    orderId?: string;
    orderUpdate?: any;
    vendorId?: string; // Required for admin messages
  }) {
    try {
      // For now, just return success since chat API endpoints may not be implemented yet
      console.log('📤 Sending vendor-admin message:', data);
      return { success: true, data: { messageId: Date.now().toString() } };
    } catch (error) {
      console.error('Error sending vendor-admin message:', error);
      throw error;
    }
  }

  // Get chat history
  async getChatHistory(data: {
    page?: number;
    limit?: number;
    orderId?: string;
    chatType?: 'user' | 'vendor';
    userId?: string;
  }): Promise<ChatHistoryResponse> {
    try {
      // For now, return empty chat history since API may not be implemented yet
      console.log('📚 Getting chat history:', data);
      return {
        messages: [],
        chatInfo: null,
        pagination: {
          page: data.page || 1,
          limit: data.limit || 50,
          totalPages: 0,
          totalMessages: 0
        }
      };
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  // Get chat list for admin
  async getChatList(data: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ChatListResponse> {
    try {
      // For now, return empty chat list since API may not be implemented yet
      console.log('📋 Getting chat list:', data);
      return {
        chats: [],
        pagination: {
          page: data.page || 1,
          limit: data.limit || 20,
          totalPages: 0,
          totalChats: 0
        }
      };
    } catch (error) {
      console.error('Error getting chat list:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(data: {
    messageId?: string;
    chatId: string;
  }) {
    try {
      // For now, just return success since API may not be implemented yet
      console.log('✅ Marking messages as read:', data);
      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Get users list for chat
  async getUsers(data: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const response = await notificationService.getUsersOrVendors('users', {
        page: data.page || 1,
        limit: data.limit || 100,
        search: data.search,
      });
      return response;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  // Get vendors list for chat
  async getVendors(data: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const response = await notificationService.getUsersOrVendors('vendors', {
        page: data.page || 1,
        limit: data.limit || 100,
        search: data.search,
      });
      return response;
    } catch (error) {
      console.error('Error getting vendors:', error);
      throw error;
    }
  }

  // Upload file for chat
  async uploadFile(file: File, type: 'image' | 'file' = 'file') {
    try {
      console.log('📎 Uploading file:', file.name, 'type:', type);
      // For now, return a mock response since upload API may not be implemented yet
      return { 
        success: true, 
        data: { 
          url: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        } 
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get user details for chat
  async getUserDetails(userId: string) {
    try {
      console.log('👤 Getting user details:', userId);
      // For now, return mock user data
      return { 
        success: true, 
        data: { 
          _id: userId,
          name: 'User Name',
          emailId: 'user@example.com',
          mobileNo: '1234567890',
          isActive: true
        } 
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  // Get vendor details for chat
  async getVendorDetails(vendorId: string) {
    try {
      console.log('🏢 Getting vendor details:', vendorId);
      // For now, return mock vendor data
      return { 
        success: true, 
        data: { 
          _id: vendorId,
          name: 'Vendor Name',
          email: 'vendor@example.com',
          phone: '1234567890',
          businessName: 'Business Name',
          isActive: true
        } 
      };
    } catch (error) {
      console.error('Error getting vendor details:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      console.log('🔔 Getting unread count');
      // For now, return mock unread count
      return { success: true, data: { unreadCount: 0 } };
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Clear chat history
  async clearChatHistory(chatId: string) {
    try {
      console.log('🗑️ Clearing chat history:', chatId);
      // For now, return success
      return { success: true };
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  // Block/Unblock user
  async blockUser(userId: string, isBlocked: boolean) {
    try {
      console.log('🚫 Blocking/unblocking user:', userId, isBlocked);
      // For now, return success
      return { success: true };
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      throw error;
    }
  }

  // Get chat analytics
  async getChatAnalytics(data: {
    startDate?: string;
    endDate?: string;
    userType?: 'user' | 'vendor';
  }) {
    try {
      console.log('📊 Getting chat analytics:', data);
      // For now, return mock analytics
      return { 
        success: true, 
        data: { 
          totalMessages: 0,
          activeChats: 0,
          responseTime: 0
        } 
      };
    } catch (error) {
      console.error('Error getting chat analytics:', error);
      throw error;
    }
  }
}

const chatApiService = new ChatApiService();
export default chatApiService;
