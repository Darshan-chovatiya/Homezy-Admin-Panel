import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import socketService from '../services/socketService';
import notificationService, { User, Vendor } from '../services/notification';

// Types
type ChatType = 'users' | 'vendors';

interface Message {
  _id: string;
  senderId: string;
  senderType: 'admin' | 'user' | 'vendor';
  receiverId: string;
  receiverType: 'admin' | 'user' | 'vendor';
  message: string;
  messageType: 'text' | 'image';
  isRead: boolean;
  createdAt: string;
}

interface ChatContextType {
  chatType: ChatType;
  setChatType: (type: ChatType) => void;
  allUsers: (User | Vendor)[];
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  messages: Message[];
  sendMessage: (text: string) => void;
  isSocketConnected: boolean;
}

// Create Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider Component
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatType, setChatType] = useState<ChatType>('users');
  const [allUsers, setAllUsers] = useState<(User | Vendor)[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Initialize Socket on Mount
  useEffect(() => {
    // Get admin ID from localStorage (ya AuthContext se)
    const adminId = localStorage.getItem('adminId') || 'admin123'; // Temporary

    console.log('🚀 Initializing socket for admin:', adminId);
    socketService.initSocket(adminId);

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsSocketConnected(socketService.isSocketConnected());
    }, 1000);

    // Setup Socket Listeners
    setupSocketListeners();

    // Cleanup on unmount
    return () => {
      clearInterval(checkConnection);
      socketService.disconnectSocket();
    };
  }, []);

  // Setup all socket event listeners
  const setupSocketListeners = () => {
    // Listen for user messages
    socketService.onUserMessage((data) => {
      console.log('📩 User message received:', data);
      
      const newMessage: Message = {
        _id: data._id || Date.now().toString(),
        senderId: data.senderId,
        senderType: 'user',
        receiverId: data.receiverId,
        receiverType: 'admin',
        message: data.message,
        messageType: data.messageType || 'text',
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      // Add message to list
      setMessages((prev) => [...prev, newMessage]);

      // Show notification if chat not open
      if (selectedUserId !== data.senderId) {
        showNotification('New message from user', data.message);
      }
    });

    // Listen for vendor messages
    socketService.onVendorMessage((data) => {
      console.log('📩 Vendor message received:', data);
      
      const newMessage: Message = {
        _id: data._id || Date.now().toString(),
        senderId: data.senderId,
        senderType: 'vendor',
        receiverId: data.receiverId,
        receiverType: 'admin',
        message: data.message,
        messageType: data.messageType || 'text',
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);

      if (selectedUserId !== data.senderId) {
        showNotification('New message from service provider', data.message);
      }
    });
  };

  // Show browser notification
  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  // Fetch users/vendors when chatType changes
  useEffect(() => {
    fetchUsers();
  }, [chatType]);

  // Fetch users or vendors
  const fetchUsers = async () => {
    try {
      const response = await notificationService.getUsersOrVendors(chatType, {
        page: 1,
        limit: 100,
      });

      if (response.data) {
        setAllUsers(response.data.docs);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUserId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUserId, chatType]);

  // Load messages for selected user (dummy for now)
  const loadMessages = () => {
    console.log('Loading messages for:', selectedUserId);
    
    // TODO: API call to fetch messages
    // const response = await chatApi.getMessages(selectedUserId, chatType);
    
    // Dummy messages for now
    const dummyMessages: Message[] = [
      {
        _id: '1',
        senderId: 'admin123',
        senderType: 'admin',
        receiverId: selectedUserId!,
        receiverType: chatType === 'users' ? 'user' : 'vendor',
        message: 'Hello! How can I help you?',
        messageType: 'text',
        isRead: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        senderId: selectedUserId!,
        senderType: chatType === 'users' ? 'user' : 'vendor',
        receiverId: 'admin123',
        receiverType: 'admin',
        message: 'I need help with my booking',
        messageType: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    setMessages(dummyMessages);
  };

  // Send message function
  const sendMessage = (text: string) => {
    if (!selectedUserId || !text.trim()) {
      console.error('Cannot send message: No user selected or empty message');
      return;
    }

    console.log('📤 Sending message to:', selectedUserId);

    // Create message object
    const newMessage: Message = {
      _id: Date.now().toString(),
      senderId: 'admin123', // Replace with actual admin ID
      senderType: 'admin',
      receiverId: selectedUserId,
      receiverType: chatType === 'users' ? 'user' : 'vendor',
      message: text,
      messageType: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update - turant UI mein dikha do
    setMessages((prev) => [...prev, newMessage]);

    // Send via socket
    socketService.sendMessage({
      receiverId: selectedUserId,
      receiverType: chatType === 'users' ? 'user' : 'vendor',
      message: text,
      messageType: 'text',
    });

    // TODO: API call bhi karna padega backup ke liye
    // await chatApi.sendMessage(selectedUserId, chatType, text);
  };

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