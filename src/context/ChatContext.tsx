import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import socketService from '../services/socketService';
import chatApiService, { ChatMessage, ChatListItem } from '../services/chatApi';
import notificationService, { User, Vendor } from '../services/notification';
import { useAuth } from './AuthContext';

// Types
type ChatType = 'users' | 'vendors';

interface Message {
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

interface ChatContextType {
  chatType: ChatType;
  setChatType: (type: ChatType) => void;
  allUsers: (User | Vendor)[];
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  messages: Message[];
  sendMessage: (text: string, messageType?: 'text' | 'image' | 'file', mediaUrl?: string) => void;
  isSocketConnected: boolean;
  isLoading: boolean;
  unreadCounts: Record<string, number>;
  chatList: ChatListItem[];
  loadChatHistory: () => Promise<void>;
  markAsRead: () => Promise<void>;
  typingUsers: Record<string, boolean>;
  startTyping: () => void;
  stopTyping: () => void;
}

// Create Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider Component
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [chatType, setChatType] = useState<ChatType>('users');
  const [allUsers, setAllUsers] = useState<(User | Vendor)[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Initialize Socket on Mount
  useEffect(() => {
    if (!user || !token) {
      console.log('⚠️ No user or token available for socket connection');
      return;
    }

    // Get admin ID from user or generate one
    const adminId = user._id || user.emailId || 'admin123';

    console.log('🚀 Initializing socket for admin:', adminId);
    socketService.initSocket(adminId);

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsSocketConnected(socketService.isSocketConnected());
    }, 1000);

    // Setup Socket Listeners
    setupSocketListeners();

    // Load initial chat list
    loadChatList();

    // Cleanup on unmount
    return () => {
      clearInterval(checkConnection);
      socketService.disconnectSocket();
    };
  }, [user, token]);

  // Load chat list
  const loadChatList = async () => {
    try {
      setIsLoading(true);
      const response = await chatApiService.getChatList({ page: 1, limit: 50 });
      setChatList(response.chats);
      
      // Update unread counts
      const counts: Record<string, number> = {};
      response.chats.forEach(chat => {
        counts[chat.partner._id] = chat.unreadCount;
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading chat list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup all socket event listeners
  const setupSocketListeners = useCallback(() => {
    // Listen for support messages (both user and vendor)
    socketService.onUserMessage((data) => {
      console.log('📩 Support message received:', data);
      
      const newMessage: Message = {
        _id: data._id || Date.now().toString(),
        senderId: data.senderId,
        senderType: data.senderType,
        receiverId: data.receiverId,
        receiverType: data.receiverType,
        message: data.message,
        messageType: data.messageType || 'text',
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
        sender: data.sender,
      };

      // Add message to list if current chat is open
      if (selectedUserId === data.senderId) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [data.senderId]: (prev[data.senderId] || 0) + 1
      }));

      // Show notification if chat not open
      if (selectedUserId !== data.senderId) {
        showNotification(`New message from ${data.senderType}`, data.message);
      }

      // Refresh chat list
      loadChatList();
    });

    // Listen for vendor-admin messages
    socketService.onVendorAdminMessageReceived((data) => {
      console.log('📩 Vendor-admin message received:', data);
      
      const newMessage: Message = {
        _id: data.message._id,
        senderId: data.message.sender._id,
        senderType: data.message.senderType,
        receiverId: 'admin',
        receiverType: 'admin',
        message: data.message.message,
        messageType: data.message.messageType,
        isRead: false,
        createdAt: data.message.createdAt,
        sender: data.message.sender,
      };

      // Add message to list if current chat is open
      if (selectedUserId === data.message.sender._id) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [data.message.sender._id]: data.unreadCount || 0
      }));

      // Show notification if chat not open
      if (selectedUserId !== data.message.sender._id) {
        showNotification(`New message from ${data.message.sender.name}`, data.message.message);
      }

      // Refresh chat list
      loadChatList();
    });

    // Listen for typing indicators
    socketService.onTyping((data) => {
      console.log('⌨️ Typing indicator:', data);
      setTypingUsers(prev => ({
        ...prev,
        [data.chatId]: data.isTyping
      }));

      // Clear typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.chatId]: false
          }));
        }, 3000);
      }
    });

    // Listen for messages read receipts
    socketService.onMessagesRead((data) => {
      console.log('✅ Messages read:', data);
      // Update messages as read in the current chat
      if (currentChatId === data.chatId) {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isRead: true
        })));
      }
    });

    // Listen for order updates
    socketService.onOrderUpdate((data) => {
      console.log('📦 Order updated:', data);
      showNotification('Order Status Update', `Order ${data.orderNumber} status changed to ${data.status}`);
    });

    // Listen for vendor location updates
    socketService.onVendorLocationUpdate((data) => {
      console.log('📍 Vendor location updated:', data);
      showNotification('Vendor Location Update', `Vendor location updated for order ${data.orderNumber}`);
    });

    // Listen for vendor availability updates
    socketService.onVendorAvailabilityUpdate((data) => {
      console.log('🔄 Vendor availability updated:', data);
      showNotification('Vendor Status Update', `${data.vendorName} is now ${data.isOnline ? 'online' : 'offline'}`);
    });

    // Listen for vendor going offline
    socketService.onVendorWentOffline((data) => {
      console.log('🔴 Vendor went offline:', data);
      showNotification('Vendor Offline', `${data.vendorName} has gone offline`);
    });
  }, [selectedUserId, currentChatId]);

  // Show browser notification
  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch users/vendors when chatType changes
  useEffect(() => {
    fetchUsers();
  }, [chatType]);

  // Fetch users or vendors
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (chatType === 'users') {
        response = await chatApiService.getUsers({ page: 1, limit: 100 });
      } else {
        response = await chatApiService.getVendors({ page: 1, limit: 100 });
      }

      if (response.data) {
        setAllUsers(response.data.docs || response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUserId) {
      loadChatHistory();
    } else {
      setMessages([]);
      setCurrentChatId(null);
    }
  }, [selectedUserId, chatType]);

  // Load chat history for selected user
  const loadChatHistory = async () => {
    if (!selectedUserId) return;
    
    try {
      setIsLoading(true);
      console.log('Loading chat history for:', selectedUserId);
      
      const response = await chatApiService.getChatHistory({
        page: 1,
        limit: 50,
        chatType: chatType,
        userId: selectedUserId,
      });

      if (response.messages) {
        // Convert ChatMessage to Message format
        const formattedMessages: Message[] = response.messages.map(msg => ({
          _id: msg._id,
          senderId: msg.senderType === 'admin' ? 'admin123' : selectedUserId,
          senderType: msg.senderType,
          receiverId: msg.senderType === 'admin' ? selectedUserId : 'admin123',
          receiverType: msg.senderType === 'admin' ? (chatType === 'users' ? 'user' : 'vendor') : 'admin',
          message: msg.message,
          messageType: msg.messageType,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          sender: msg.sender,
        }));

        setMessages(formattedMessages);
        setCurrentChatId(response.chatInfo?._id || null);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to empty messages
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!currentChatId) return;
    
    try {
      await chatApiService.markAsRead({ chatId: currentChatId });
      
      // Update local state
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isRead: true
      })));
      
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [selectedUserId!]: 0
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send message function
  const sendMessage = async (text: string, messageType: 'text' | 'image' | 'file' = 'text', mediaUrl?: string) => {
    if (!selectedUserId || !text.trim()) {
      console.error('Cannot send message: No user selected or empty message');
      return;
    }

    console.log('📤 Sending message to:', selectedUserId);

    // Create message object
    const adminId = user?._id || user?.emailId || 'admin123';
    const newMessage: Message = {
      _id: Date.now().toString(),
      senderId: adminId,
      senderType: 'admin',
      receiverId: selectedUserId,
      receiverType: chatType === 'users' ? 'user' : 'vendor',
      message: text,
      messageType: messageType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update - show immediately in UI
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Send via API first
      await chatApiService.sendMessage({
        message: text,
        messageType: messageType,
        mediaUrl: mediaUrl,
        receiverId: selectedUserId,
        receiverType: chatType === 'users' ? 'user' : 'vendor',
      });

      // Also send via socket for real-time delivery
      socketService.sendMessage({
        receiverId: selectedUserId,
        receiverType: chatType === 'users' ? 'user' : 'vendor',
        message: text,
        messageType: messageType,
      });

      // Mark as read for sender
      await markAsRead();
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic update on error
      setMessages((prev) => prev.filter(msg => msg._id !== newMessage._id));
    }
  };

  // Typing indicators
  const startTyping = useCallback(() => {
    if (currentChatId) {
      socketService.startTyping(currentChatId);
    }
  }, [currentChatId]);

  const stopTyping = useCallback(() => {
    if (currentChatId) {
      socketService.stopTyping(currentChatId);
    }
  }, [currentChatId]);

  // Context value
  const value: ChatContextType = {
    chatType,
    setChatType,
    allUsers,
    selectedUserId,
    setSelectedUserId,
    messages,
    sendMessage,
    isSocketConnected,
    isLoading,
    unreadCounts,
    chatList,
    loadChatHistory,
    markAsRead,
    typingUsers,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Custom hook to use chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}