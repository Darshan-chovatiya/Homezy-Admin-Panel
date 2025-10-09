import React, { useState } from 'react';
import UsersList from '../../components/chat/UsersList';
import ChatWindow from '../../components/chat/ChatWindow';

type ChatType = 'users' | 'vendors';

function ChatManagement() {
  const [chatType, setChatType] = useState<ChatType>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-[calc(100vh-120px)]">
      {/* Header with Dropdown */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Chat Management
          </h3>
          <select
            value={chatType}
            onChange={(e) => {
              setChatType(e.target.value as ChatType);
              setSelectedUserId(null); // Reset selection when changing type
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="users">Users</option>
            <option value="vendors">Service Providers</option>
          </select>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex h-[calc(100%-73px)]">
        {/* Left Sidebar - Users List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <UsersList
            chatType={chatType}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
          />
        </div>

        {/* Right Side - Chat Window */}
        <div className="w-2/3">
          <ChatWindow
            chatType={chatType}
            selectedUserId={selectedUserId}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatManagement;