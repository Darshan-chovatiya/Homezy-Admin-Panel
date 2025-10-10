# Chat System Implementation

This document describes the real-time chat system implementation for the Homezy Admin Panel.

## Features Implemented

### 1. Socket Service (`src/services/socketService.ts`)
- Real-time WebSocket connection using Socket.IO
- Authentication with encrypted JWT tokens
- Automatic reconnection with exponential backoff
- Event listeners for various chat events:
  - Support messages (user ↔ admin, vendor ↔ admin)
  - Vendor-admin messages
  - Typing indicators
  - Order updates
  - Vendor location updates
  - Vendor availability updates
  - Message read receipts

### 2. Chat API Service (`src/services/chatApi.ts`)
- REST API integration for chat operations
- Message sending and receiving
- Chat history retrieval
- Chat list management
- File upload support
- Unread count tracking
- User/vendor management

### 3. Chat Context (`src/context/ChatContext.tsx`)
- Global state management for chat functionality
- Integration with authentication system
- Real-time message handling
- Typing indicators
- Unread count management
- Browser notifications

### 4. Chat Components

#### UsersList (`src/components/chat/UsersList.tsx`)
- Displays list of users/vendors
- Search functionality
- Online status indicators
- Unread message counts
- User avatars and details

#### ChatWindow (`src/components/chat/ChatWindow.tsx`)
- Real-time message display
- Message input with typing indicators
- File attachment support (UI ready)
- Auto-scroll to latest messages
- Read receipts
- Typing indicators

#### ChatManagement (`src/pages/Admin/ChatManagement.tsx`)
- Main chat interface
- Socket connection status
- User/vendor selection
- Chat type switching

## Backend Integration

The frontend is designed to work with the following backend APIs:

### Socket Events
- `send_support_message` - Send messages to users/vendors
- `send_vendor_admin_message` - Send vendor-admin messages
- `vendor_admin_typing_start/stop` - Typing indicators
- `join_order_room` - Join order-specific rooms
- `support_message_received` - Receive messages
- `vendor_admin_message_received/sent` - Vendor-admin messages
- `vendor_admin_typing` - Typing indicators
- `order_updated` - Order status updates
- `vendor_location_updated` - Vendor location updates
- `vendor_availability_updated` - Vendor availability
- `messages_read` - Read receipts

### REST API Endpoints
- `POST /chat/admin/send-message` - Send message
- `POST /chat/admin/chat-history` - Get chat history
- `POST /chat/admin/chat-list` - Get chat list
- `POST /chat/admin/mark-read` - Mark messages as read
- `GET /users` - Get users list
- `GET /vendors` - Get vendors list

## Environment Configuration

Add the following environment variables:

```env
REACT_APP_SOCKET_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000
```

## Authentication

The system integrates with the existing AuthContext:
- Uses admin token for socket authentication
- Automatically initializes socket connection on login
- Handles token refresh and reconnection

## Usage

1. **Initialize Chat System**: The ChatProvider is automatically initialized when the app starts
2. **Select User/Vendor**: Click on any user or vendor in the sidebar to start chatting
3. **Send Messages**: Type in the input field and press Enter or click Send
4. **Real-time Updates**: Messages appear instantly via WebSocket
5. **Notifications**: Browser notifications for new messages when chat is not active

## Key Features

- ✅ Real-time messaging via WebSocket
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Online/offline status
- ✅ Unread message counts
- ✅ Browser notifications
- ✅ File attachment support (UI ready)
- ✅ Order status updates
- ✅ Vendor location tracking
- ✅ Search functionality
- ✅ Responsive design
- ✅ Dark mode support

## Socket Connection Status

The system shows real-time connection status:
- 🟢 Green dot: Connected
- 🔴 Red dot: Disconnected
- Automatic reconnection attempts

## Error Handling

- Graceful fallback when socket connection fails
- API error handling with user feedback
- Automatic retry mechanisms
- Connection status monitoring

## Performance Optimizations

- Message pagination
- Optimistic UI updates
- Efficient re-rendering
- Connection pooling
- Automatic cleanup on unmount

## Security

- JWT token authentication
- Encrypted token transmission
- User authorization checks
- Input sanitization
- XSS protection

## Browser Support

- Modern browsers with WebSocket support
- Fallback to polling if WebSocket fails
- Mobile responsive design
- Touch-friendly interface

## Future Enhancements

- Voice messages
- Video calls
- Message encryption
- Chat export
- Advanced search
- Message reactions
- Chat groups
- Message scheduling

