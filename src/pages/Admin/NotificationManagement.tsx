import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import notificationService, { User, Vendor, NotificationData, PaginationParams } from '../../services/notification';
import customerService from '../../services/customer';
import vendorService from '../../services/vendor';
import Swal from 'sweetalert2';

export default function NotificationManagement() {
  const [type, setType] = useState<'users' | 'vendors'>('users');
  const [entities, setEntities] = useState<(User | Vendor)[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Notification Form State
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
  });

  // Fetch users or vendors
  const fetchEntities = async () => {
    try {
      setLoading(true);
      const params: PaginationParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
      };
      const response = await notificationService.getUsersOrVendors(type, params);

      if (response.data) {
        setEntities(response.data.docs);
        setTotalPages(response.data.totalPages);
        setTotalDocs(response.data.totalDocs);
        // Reset selections when data changes
        setSelectedEntities([]);
        setSelectAll(false);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      Swal.fire('Error', `Failed to fetch ${type}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [type, currentPage, searchTerm]);

  // Handle Select All
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEntities([]);
    } else {
      setSelectedEntities(entities.map(entity => entity._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle Individual Selection
  const handleSelectEntity = (id: string) => {
    if (selectedEntities.includes(id)) {
      setSelectedEntities(selectedEntities.filter(entityId => entityId !== id));
    } else {
      setSelectedEntities([...selectedEntities, id]);
    }
    setSelectAll(false);
  };

  // Handle Status Toggle
  const handleToggleStatus = async (entity: User | Vendor) => {
    try {
      const nextStatus = !entity.isActive;
      
      if (type === 'users') {
        await customerService.updateCustomer({
          customerId: entity._id,
          isActive: nextStatus
        });
      } else {
        await vendorService.updateVendor({
          vendorId: entity._id,
          isActive: nextStatus
        });
      }
      
      // Update local state
      setEntities(prev =>
        prev.map(e =>
          e._id === entity._id ? { ...e, isActive: nextStatus } : e
        )
      );
      
      Swal.fire('Success', `${type === 'users' ? 'Customer' : 'Vendor'} ${nextStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      Swal.fire('Error', `Failed to update ${type} status`, 'error');
    }
  };

  // Handle Send Notification
  const handleSendNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormLoading(true);

    try {
      const notificationData: NotificationData = {
        title: notificationForm.title,
        message: notificationForm.message,
        recipientType: selectAll
          ? type
          : type === 'users'
          ? 'specific_users'
          : 'specific_vendors',
        ...(selectAll ? {} : { [type === 'users' ? 'specificUsers' : 'specificVendors']: selectedEntities }),
      };

      await notificationService.sendNotification(notificationData);
      setShowSendModal(false);
      setNotificationForm({ title: '', message: '' });
      setSelectedEntities([]);
      setSelectAll(false);
      await Swal.fire('Success', 'Notification sent successfully', 'success');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      Swal.fire('Error', error.message || 'Failed to send notification', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Notification Management</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Total {type === 'users' ? 'Users' : 'Service Providers'}: <span className="font-semibold">{totalDocs}</span>
            </p>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            disabled={entities.length === 0 && !selectAll && selectedEntities.length === 0}
            className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 hover:text-white dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:hover:text-blue-200 transition-colors duration-200 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'users' | 'vendors');
              setCurrentPage(1);
              setSearchTerm('');
            }}
          >
            <option value="users">Users</option>
            <option value="vendors">Service Providers</option>
          </select>
          <div className="flex-1">
            <input
              type="text"
              placeholder={`Search ${type} by name, email, or mobile...`}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-[#013365] focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="ml-2">Select All</span>
                  </label>
                </th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">{type === 'users' ? 'Email' : 'Business Name'}</th>
                <th scope="col" className="px-6 py-3">{type === 'users' ? 'Mobile' : 'Phone'}</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center">Loading...</td>
                </tr>
              ) : (
                entities.map((entity) => (
                  <tr
                    key={entity._id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEntities.includes(entity._id)}
                        onChange={() => handleSelectEntity(entity._id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#013365] focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                          <span className="text-xs font-semibold">{entity.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{entity.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {type === 'users' ? (entity as User).emailId || 'No email' : (entity as Vendor).businessName}
                    </td>
                    <td className="px-6 py-4">{type === 'users' ? (entity as User).mobileNo : (entity as Vendor).phone}</td>
                    <td className="px-6 py-4">
                      <span
                        onClick={() => handleToggleStatus(entity)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                          entity.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {entity.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {entities.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">No {type} found.</div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page <span className="font-semibold">{currentPage}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send Notification</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendNotification} className="flex-1 overflow-y-auto p-6" id="send-notification-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    required
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <textarea
                    required
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter notification message"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recipients ({selectAll ? `All ${type}` : `${selectedEntities.length} selected`})
                  </label>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {selectAll
                      ? `Sending to all active ${type}`
                      : selectedEntities.length > 0
                      ? `Sending to ${selectedEntities.length} selected ${type}`
                      : 'Select recipients or choose "Select All"'}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={formLoading || (!selectAll && selectedEntities.length === 0)}
                  className="rounded-lg bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {formLoading ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}