import { useState, useEffect } from "react";
import { apiService } from "../../services/api";

interface Order {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    mobileNo: string;
    emailId?: string;
  } | null;
  subcategoryId: {
    _id: string;
    name: string;
    basePrice: string;
  };
  vendorId?: {
    _id: string;
    name: string;
    businessName: string;
    email?: string;
    phone?: string;
  } | null;
  slot: {
    slotId: string;
    startTime: string;
    endTime: string;
  };
  status: "pending" | "assigned" | "accepted" | "rejected" | "completed";
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  payment?: {
    _id: string;
    mode: string;
    amount: number;
    status: string;
    transactionId?: string;
    paymentGateway?: string;
    paidAt?: string;
  };
}

export default function BookingOversight() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "assigned" | "accepted" | "rejected" | "completed">("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<"all" | "pending" | "completed" | "failed" | "refunded">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [assignModal, setAssignModal] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);
  const [availableVendors, setAvailableVendors] = useState<Array<{
    _id: string;
    name: string;
    businessName: string;
    email?: string;
    phone?: string;
    overallRating: number;
    totalRatings: number;
    completedJobs: number;
  }>>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: {
        status?: string;
        paymentStatus?: string;
        startDate?: string;
        endDate?: string;
      } = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterPaymentStatus !== "all") filters.paymentStatus = filterPaymentStatus;
      if (dateRange.start) filters.startDate = dateRange.start;
      if (dateRange.end) filters.endDate = dateRange.end;

      const response = await apiService.getOrders(filters);
      if (response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount and filter changes
  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterPaymentStatus, dateRange.start, dateRange.end]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      order.subcategoryId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.vendorId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesSearch;
  });

  // Fetch available vendors for assignment
  const fetchAvailableVendors = async (order: Order) => {
    try {
      const response = await apiService.getAvailableVendors(
        order.subcategoryId._id,
        order.slot.startTime,
        order.slot.slotId
      );
      if (response.data) {
        setAvailableVendors(response.data);
      }
    } catch (err) {
      console.error('Error fetching available vendors:', err);
      setAvailableVendors([]);
    }
  };

  // Handle order assignment
  const handleAssignOrder = async () => {
    if (!selectedOrderForAssign || !selectedVendorId) return;

    try {
      const response = await apiService.assignOrder(selectedOrderForAssign._id, selectedVendorId);
      if (response.data) {
        // Refresh orders list
        await fetchOrders();
        setAssignModal(false);
        setSelectedOrderForAssign(null);
        setSelectedVendorId("");
        setAvailableVendors([]);
        alert('Order assigned successfully!');
      }
    } catch (err) {
      console.error('Error assigning order:', err);
      alert('Failed to assign order');
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTotalStats = () => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === "completed").length;
    const pending = orders.filter(o => o.status === "pending").length;
    const assigned = orders.filter(o => o.status === "assigned").length;
    const totalRevenue = orders
      .filter(o => o.payment?.status === "completed")
      .reduce((sum, o) => sum + parseFloat(o.totalPrice), 0);

    return { total, completed, pending, assigned, totalRevenue };
  };

  const stats = getTotalStats();

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <>
        {/* <PageMeta
          title="Booking Oversight | Homezy Admin Panel"
          description="Track and manage all bookings on the Homezy platform"
        />
        <PageBreadcrumb pageTitle="Booking Oversight" /> */}
        
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading orders...</span>
        </div>
      </>
    );
  }

  return (
    <>
      {/* <PageMeta
        title="Booking Oversight | Homezy Admin Panel"
        description="Track and manage all bookings on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Booking Oversight" /> */}
      
      <div className="space-y-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="text-blue-600 dark:text-blue-300">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <span className="text-green-600 dark:text-green-300">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <span className="text-yellow-600 dark:text-yellow-300">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="text-blue-600 dark:text-blue-300">👤</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.assigned}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <span className="text-purple-600 dark:text-purple-300">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Orders
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={fetchOrders}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                🔄 Refresh
              </button>
              <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Export Orders
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by order ID, customer, service, or vendor..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                placeholder="Start Date"
              />
              <input
                type="date"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                placeholder="End Date"
              />
              <select
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "assigned" | "accepted" | "rejected" | "completed")}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
              <select
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as "all" | "pending" | "completed" | "failed" | "refunded")}
              >
                <option value="all">All Payment</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Order ID</th>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Service</th>
                  <th scope="col" className="px-6 py-3">Vendor</th>
                  <th scope="col" className="px-6 py-3">Scheduled Time</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Payment</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {order._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.customerId ? (
                        <>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.customerId.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customerId.mobileNo}
                          </div>
                          {order.customerId.emailId && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.customerId.emailId}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No customer assigned
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.subcategoryId.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Base: {formatCurrency(order.subcategoryId.basePrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.vendorId ? (
                        <>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.vendorId.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.vendorId.businessName}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(order.slot.startTime)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.slot.startTime).toLocaleTimeString()} - {new Date(order.slot.endTime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.totalPrice)}
                      </div>
                      {order.payment && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.payment.mode}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      {order.payment ? getPaymentStatusBadge(order.payment.status) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          View
                        </button>
                        {order.status === "pending" && !order.vendorId && (
                          <button
                            onClick={async () => {
                              setSelectedOrderForAssign(order);
                              await fetchAvailableVendors(order);
                              setAssignModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && !loading && (
            <div className="py-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">No orders found matching your criteria.</div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Details - {selectedOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.customerId ? (
                      <>
                        <div><strong>Name:</strong> {selectedOrder.customerId.name}</div>
                        <div><strong>Phone:</strong> {selectedOrder.customerId.mobileNo}</div>
                        {selectedOrder.customerId.emailId && (
                          <div><strong>Email:</strong> {selectedOrder.customerId.emailId}</div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 italic">No customer assigned</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Service Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Service:</strong> {selectedOrder.subcategoryId.name}</div>
                    <div><strong>Base Price:</strong> {formatCurrency(selectedOrder.subcategoryId.basePrice)}</div>
                    <div><strong>Total Price:</strong> {formatCurrency(selectedOrder.totalPrice)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Scheduling</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Start Time:</strong> {formatDateTime(selectedOrder.slot.startTime)}</div>
                    <div><strong>End Time:</strong> {formatDateTime(selectedOrder.slot.endTime)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Status & Payment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong> {getStatusBadge(selectedOrder.status)}
                    </div>
                    {selectedOrder.payment && (
                      <>
                        <div className="flex items-center gap-2">
                          <strong>Payment:</strong> {getPaymentStatusBadge(selectedOrder.payment.status)}
                        </div>
                        <div><strong>Payment Mode:</strong> {selectedOrder.payment.mode}</div>
                        {selectedOrder.payment.transactionId && (
                          <div><strong>Transaction ID:</strong> {selectedOrder.payment.transactionId}</div>
                        )}
                        {selectedOrder.payment.paidAt && (
                          <div><strong>Paid At:</strong> {formatDateTime(selectedOrder.payment.paidAt)}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedOrder.vendorId && (
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Assigned Vendor</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedOrder.vendorId.name}</div>
                    <div><strong>Business:</strong> {selectedOrder.vendorId.businessName}</div>
                    {selectedOrder.vendorId.email && (
                      <div><strong>Email:</strong> {selectedOrder.vendorId.email}</div>
                    )}
                    {selectedOrder.vendorId.phone && (
                      <div><strong>Phone:</strong> {selectedOrder.vendorId.phone}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Order Modal */}
      {assignModal && selectedOrderForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assign Order
              </h3>
              <button
                onClick={() => {
                  setAssignModal(false);
                  setSelectedOrderForAssign(null);
                  setSelectedVendorId("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order: {selectedOrderForAssign.subcategoryId.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customer: {selectedOrderForAssign.customerId?.name || 'No customer assigned'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Vendor
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a vendor...</option>
                  {availableVendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name} - {vendor.businessName} 
                      {vendor.overallRating > 0 && ` (⭐ ${vendor.overallRating.toFixed(1)})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setAssignModal(false);
                    setSelectedOrderForAssign(null);
                    setSelectedVendorId("");
                    setAvailableVendors([]);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignOrder}
                  disabled={!selectedVendorId}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}