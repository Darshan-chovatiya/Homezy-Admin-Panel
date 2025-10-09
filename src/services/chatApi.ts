import api from './api';

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
  private baseUrl = '/chat';

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
      const response = await api.post(`${this.baseUrl}/admin/send-message`, data);
      return response.data;
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
      const response = await api.post(`${this.baseUrl}/admin/send-message`, data);
      return response.data;
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
      const response = await api.post(`${this.baseUrl}/admin/chat-history`, {
        page: data.page || 1,
        limit: data.limit || 50,
        orderId: data.orderId,
        ...(data.chatType === 'user' && { userId: data.userId }),
        ...(data.chatType === 'vendor' && { vendorId: data.userId }),
      });
      return response.data.data;
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
      const response = await api.post(`${this.baseUrl}/admin/chat-list`, {
        page: data.page || 1,
        limit: data.limit || 20,
        search: data.search,
      });
      return response.data.data;
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
      const response = await api.post(`${this.baseUrl}/admin/mark-read`, data);
      return response.data;
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
      const response = await api.get('/users', {
        params: {
          page: data.page || 1,
          limit: data.limit || 100,
          search: data.search,
          isActive: true,
        },
      });
      return response.data;
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
      const response = await api.get('/vendors', {
        params: {
          page: data.page || 1,
          limit: data.limit || 100,
          search: data.search,
          isActive: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting vendors:', error);
      throw error;
    }
  }

  // Upload file for chat
  async uploadFile(file: File, type: 'image' | 'file' = 'file') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/upload/chat-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get user details for chat
  async getUserDetails(userId: string) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  // Get vendor details for chat
  async getVendorDetails(vendorId: string) {
    try {
      const response = await api.get(`/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting vendor details:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await api.get(`${this.baseUrl}/admin/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Clear chat history
  async clearChatHistory(chatId: string) {
    try {
      const response = await api.delete(`${this.baseUrl}/admin/clear-chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  // Block/Unblock user
  async blockUser(userId: string, isBlocked: boolean) {
    try {
      const response = await api.post(`${this.baseUrl}/admin/block-user`, {
        userId,
        isBlocked,
      });
      return response.data;
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
      const response = await api.get(`${this.baseUrl}/admin/analytics`, {
        params: data,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chat analytics:', error);
      throw error;
    }
  }
}

const chatApiService = new ChatApiService();
export default chatApiService;
