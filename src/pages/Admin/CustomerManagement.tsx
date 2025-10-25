import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import customerService from "../../services/customer";
import Swal from "sweetalert2";

// Customer interface (unchanged)
interface Customer {
  _id: string;
  name: string;
  mobileNo: string;
  emailId?: string;
  walletBalance?: number;
  isActive: boolean;
  gender?: string;
  createdAt: string;
  addressComponent?: {
    city?: string;
    state?: string;
    pincode?: string;
    fullAddress?: string;
  };
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Add Customer Form State
  const [formData, setFormData] = useState({
    name: "",
    mobileNo: "",
    emailId: ""
  });

  // Edit Customer Form State
  const [editFormData, setEditFormData] = useState({
    customerId: "",
    name: "",
    mobileNo: "",
    emailId: "",
    walletBalance: 0
  });

  const [formLoading, setFormLoading] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAllCustomers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        isActive: filterStatus === "all" ? undefined : filterStatus === "active"
      });

      if (response.data) {
        setCustomers(response.data.docs);
        setTotalPages(response.data.totalPages);
        setTotalDocs(response.data.totalDocs);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      Swal.fire('Error', 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, filterStatus]);

  // Handle status toggle (similar to AdminManagement)
  const handleToggle = async (customer: Customer) => {
    try {
      const nextStatus = !customer.isActive;
      await customerService.updateCustomer({
        customerId: customer._id,
        isActive: nextStatus
      });
      setCustomers(prev =>
        prev.map(c =>
          c._id === customer._id ? { ...c, isActive: nextStatus } : c
        )
      );
      Swal.fire('Success', `Customer ${nextStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error("Error updating customer status:", error);
      Swal.fire('Error', 'Failed to update customer status', 'error');
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (customerId: string) => {
    const result = await Swal.fire({
      title: 'Delete customer?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await customerService.deleteCustomer(customerId);
        await Swal.fire('Deleted', 'Customer removed successfully', 'success');
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        Swal.fire('Error', 'Failed to delete customer', 'error');
      }
    }
  };

  // Handle Add Customer
  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormLoading(true);
    
    try {
      await customerService.createCustomer(formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        mobileNo: "",
        emailId: ""
      });
      await Swal.fire('Saved', 'Customer created successfully', 'success');
      fetchCustomers();
    } catch (error: any) {
      console.error("Error creating customer:", error);
      Swal.fire('Error', error.message || 'Failed to create customer', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (customer: Customer) => {
    setEditFormData({
      customerId: customer._id,
      name: customer.name,
      mobileNo: customer.mobileNo,
      emailId: customer.emailId || "",
      walletBalance: customer.walletBalance || 0
    });
    setShowEditModal(true);
  };

  // Handle Edit Customer
  const handleEditCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormLoading(true);
    
    try {
      await customerService.updateCustomer(editFormData);
      setShowEditModal(false);
      await Swal.fire('Saved', 'Customer updated successfully', 'success');
      fetchCustomers();
    } catch (error: any) {
      console.error("Error updating customer:", error);
      Swal.fire('Error', error.message || 'Failed to update customer', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
        isActive 
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Users</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Total Customers: <span className="font-semibold">{totalDocs}</span>
            </p>
          </div>
<button 
  onClick={() => setShowAddModal(true)}
  className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 hover:text-white dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
>
  <Plus className="h-4 w-4 mr-2" />
  Add Customer
</button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search customers by name, mobile, or email..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Mobile</th>
                <th scope="col" className="px-6 py-3">Location</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Wallet</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-center">Loading...</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                          <span className="text-xs font-semibold">{customer.name.slice(0,2).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{customer.emailId || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{customer.mobileNo}</td>
                    <td className="px-6 py-4">
                      {customer.addressComponent?.city || 'N/A'}
                      {customer.addressComponent?.state && `, ${customer.addressComponent.state}`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        onClick={() => handleToggle(customer)}
                      >
                        {getStatusBadge(customer.isActive)}
                      </span>
                    </td>
                    <td className="px-6 py-4">₹{customer.walletBalance || 0}</td>
                    <td className="px-6 py-4">
  <div className="flex items-center gap-2">
    <button
      onClick={() => {
        setSelectedCustomer(customer);
        setShowModal(true);
      }}
      className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
      title="View Details"
    >
      <Eye className="h-4 w-4" />
    </button>
    <button
      onClick={() => openEditModal(customer)}
      className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-primary hover:bg-blue-200 hover:text-primary/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
      title="Edit Customer"
    >
      <Edit className="h-4 w-4" />
    </button>
    <button
      onClick={() => handleDelete(customer._id)}
      className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-700 transition-colors duration-200"
      title="Delete Customer"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">No customers found.</div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleAddCustomer} className="flex-1 overflow-y-auto p-6" id="add-customer-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.mobileNo}
                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Customer</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleEditCustomer} className="flex-1 overflow-y-auto p-6" id="edit-customer-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={editFormData.mobileNo}
                    onChange={(e) => setEditFormData({ ...editFormData, mobileNo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={editFormData.emailId}
                    onChange={(e) => setEditFormData({ ...editFormData, emailId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Balance</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.walletBalance}
                    onChange={(e) => setEditFormData({ ...editFormData, walletBalance: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {formLoading ? "Updating..." : "Update Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                    <span className="text-xs font-semibold">{selectedCustomer.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.emailId || 'No email'}</p>
                    <div className="mt-1 flex gap-2">
                      {getStatusBadge(selectedCustomer.isActive)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCustomer.mobileNo}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedCustomer.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Wallet Balance</label>
                    <p className="text-sm text-gray-900 dark:text-white">₹{selectedCustomer.walletBalance || 0}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Joined Date</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedCustomer.addressComponent && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Address</label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedCustomer.addressComponent.fullAddress && (
                          <p>{selectedCustomer.addressComponent.fullAddress}</p>
                        )}
                        <div className="flex gap-1">
                          {selectedCustomer.addressComponent.city && (
                            <span>{selectedCustomer.addressComponent.city}</span>
                          )}
                          {selectedCustomer.addressComponent.state && (
                            <span>, {selectedCustomer.addressComponent.state}</span>
                          )}
                          {selectedCustomer.addressComponent.pincode && (
                            <span>- {selectedCustomer.addressComponent.pincode}</span>
                          )}
                        </div>
                        {!selectedCustomer.addressComponent.fullAddress && 
                         !selectedCustomer.addressComponent.city && (
                          <p className="text-gray-500 dark:text-gray-400">No address available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
