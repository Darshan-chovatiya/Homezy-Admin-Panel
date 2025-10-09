// import React from 'react'

// function ChatWindow() {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default ChatWindow


import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, Smile } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext';

interface ChatWindowProps {
  chatType: 'users' | 'vendors';
  selectedUserId: string | null;
}

function ChatWindow({ chatType, selectedUserId }: ChatWindowProps) {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    allUsers, 
    typingUsers, 
    startTyping, 
    stopTyping,
    markAsRead 
  } = useChatContext();
  
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      markAsRead();
    }
  }, [selectedUserId, messages, markAsRead]);

  // Get selected user details
  const selectedUser = allUsers.find(user => user._id === selectedUserId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    try {
      await sendMessage(messageText.trim());
      setMessageText('');
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);

    // Typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping();
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      stopTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // If no user selected
  if (!selectedUserId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/20">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-2">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Select a {chatType === 'users' ? 'user' : 'service provider'} to start chatting
          </p>
        </div>
      </div>
    );
  }

  // If user not found
  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/20">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            User not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900/10">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {selectedUser.userImage || (selectedUser as any).image ? (
                <img
                  src={selectedUser.userImage || (selectedUser as any).image}
                  alt={selectedUser.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {/* Online Status */}
            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
              selectedUser.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedUser.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chatType === 'users' ? 'User' : 'Service Provider'}
              {chatType === 'vendors' && (selectedUser as any).businessName && (
                <span> • {(selectedUser as any).businessName}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isAdmin = msg.senderType === 'admin';
              const messageTime = new Date(msg.createdAt);
              const isToday = messageTime.toDateString() === new Date().toDateString();
              
              return (
                <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isAdmin ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isAdmin
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                      
                      {/* Message Type Indicator */}
                      {msg.messageType !== 'text' && (
                        <div className="mt-1 text-xs opacity-75">
                          {msg.messageType === 'image' && '📷 Image'}
                          {msg.messageType === 'file' && '📎 File'}
                        </div>
                      )}
                    </div>
                    
                    {/* Time and Read Status */}
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      isAdmin ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span>
                        {isToday 
                          ? messageTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }
                      </span>
                      {isAdmin && msg.isRead && (
                        <span className="text-blue-500">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {Object.values(typingUsers).some(typing => typing) && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            
            {/* Attachment buttons */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Send image"
            >
              <Image className="h-5 w-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;