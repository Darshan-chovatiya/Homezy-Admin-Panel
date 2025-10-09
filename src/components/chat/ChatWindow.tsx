// import React from 'react'

// function ChatWindow() {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default ChatWindow


import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatWindowProps {
  chatType: 'users' | 'vendors';
  selectedUserId: string | null;
}

function ChatWindow({ chatType, selectedUserId }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');

  // Dummy messages for now
  const messages = [
    {
      _id: '1',
      senderId: 'admin123',
      senderType: 'admin',
      message: 'Hello! How can I help you?',
      createdAt: '2025-10-09T10:30:00Z',
    },
    {
      _id: '2',
      senderId: 'user123',
      senderType: 'user',
      message: 'I need help with my booking',
      createdAt: '2025-10-09T10:31:00Z',
    },
    {
      _id: '3',
      senderId: 'admin123',
      senderType: 'admin',
      message: 'Sure, let me check your booking details.',
      createdAt: '2025-10-09T10:32:00Z',
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    console.log('Sending message:', messageText);
    // TODO: API call to send message
    setMessageText('');
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900/10">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              JD
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              John Doe
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chatType === 'users' ? 'User' : 'Service Provider'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAdmin = msg.senderType === 'admin';
          return (
            <div
              key={msg._id}
              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isAdmin
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    isAdmin ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
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