import { useState, useEffect } from 'react';
import notificationService, { User, Vendor } from '../../services/notification';

interface UsersListProps {
  chatType: 'users' | 'vendors';
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

function UsersList({ chatType, selectedUserId, onSelectUser }: UsersListProps) {
  const [entities, setEntities] = useState<(User | Vendor)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users or vendors
  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getUsersOrVendors(chatType, {
        page: 1,
        limit: 100,
        search: searchTerm,
      });

      if (response.data) {
        setEntities(response.data.docs);
      }
    } catch (error) {
      console.error(`Error fetching ${chatType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [chatType, searchTerm]);

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
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : entities.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">No {chatType} found</p>
          </div>
        ) : (
          entities.map((entity) => {
            const isUser = chatType === 'users';
            const name = entity.name;
            const subText = isUser ? (entity as User).emailId : (entity as Vendor).businessName;
            const isSelected = selectedUserId === entity._id;

            return (
              <div
                key={entity._id}
                onClick={() => onSelectUser(entity._id)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {/* Avatar */}
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {name.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {subText}
                  </p>
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