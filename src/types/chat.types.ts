// User interface
export interface User {
  _id: string;
  name: string;
  emailId: string;
  userImage: string;
  isActive: boolean;
  mobileNo: string;
  fcm: string;
}

// Vendor interface
export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  businessName: string;
  fcmToken: string;
  isActive: boolean;
}

// Message interface
export interface Message {
  _id: string;
  senderId: string;
  senderType: 'admin' | 'user' | 'vendor';
  receiverId: string;
  receiverType: 'admin' | 'user' | 'vendor';
  message: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chat list item (sidebar mein dikhega)
export interface ChatListItem {
  userId: string;
  userName: string;
  userImage: string;
  userType: 'user' | 'vendor';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// Chat category type (dropdown ke liye)
export type ChatCategory = 'users' | 'vendors';

// Chat context state interface
export interface ChatContextState {
  chatType: ChatCategory;
  allUsers: User[];
  allVendors: Vendor[];
  chatList: ChatListItem[];
  selectedChat: ChatListItem | null;
  messages: Message[];
  unreadCounts: Record<string, number>;
  isLoading: boolean;
}