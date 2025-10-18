import React, { useState, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';
import chatApiService from '../../services/chatApi';
import { User, Vendor } from '../../services/notification';

interface UsersListProps {
  chatType: 'users' | 'vendors';
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

function UsersList({ chatType, selectedUserId, onSelectUser }: UsersListProps) {
  const { allUsers, isLoading, unreadCounts } = useChatContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEntities, setFilteredEntities] = useState<(User | Vendor)[]>([]);

  // Filter entities based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEntities(allUsers);
    } else {
      const filtered = allUsers.filter(entity => {
        const name = entity.name.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        if (chatType === 'users') {
          const user = entity as User;
          return name.includes(search) || 
                 user.emailId?.toLowerCase().includes(search) ||
                 user.mobileNo?.includes(search);
        } else {
          const vendor = entity as Vendor;
          return name.includes(search) || 
                 vendor.businessName?.toLowerCase().includes(search) ||
                 vendor.email?.toLowerCase().includes(search);
        }
      });
      setFilteredEntities(filtered);
    }
  }, [allUsers, searchTerm, chatType]);

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder={`Search ${chatType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? `No ${chatType} found matching "${searchTerm}"` : `No ${chatType} found`}
            </p>
          </div>
        ) : (
          filteredEntities.map((entity) => {
            const isUser = chatType === 'users';
            const name = entity.name;
            const subText = isUser ? (entity as User).emailId : (entity as Vendor).businessName;
            const isSelected = selectedUserId === entity._id;
            const unreadCount = unreadCounts[entity._id] || 0;
            const isOnline = isUser ? (entity as User).isActive : (entity as Vendor).isActive;

            return (
              <div
                key={entity._id}
                onClick={() => onSelectUser(entity._id)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {/* Avatar with Online Status */}
                <div className="relative">
                  <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {entity.userImage || (entity as Vendor).image ? (
                      <img
                        src={entity.userImage || (entity as Vendor).image}
                        alt={name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Online Status Indicator */}
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {name}
                    </h4>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {subText}
                  </p>
                  {isUser && (entity as User).mobileNo && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {(entity as User).mobileNo}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UsersList;
