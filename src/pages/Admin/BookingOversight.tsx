import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  servicePartnerName: string;
  servicePartnerEmail: string;
  servicePartnerPhone: string;
  serviceName: string;
  serviceCategory: string;
  bookingDate: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "disputed";
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentMethod: string;
  rating?: number;
  review?: string;
  cancellationReason?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

const dummyBookings: Booking[] = [
  {
    id: "BK001",
    customerName: "John Doe",
    customerEmail: "john.doe@email.com",
    customerPhone: "+1 (555) 123-4567",
    servicePartnerName: "Sarah Johnson",
    servicePartnerEmail: "sarah.johnson@email.com",
    servicePartnerPhone: "+1 (555) 234-5678",
    serviceName: "House Cleaning",
    serviceCategory: "Cleaning",
    bookingDate: "2024-03-15",
    scheduledDate: "2024-03-20",
    scheduledTime: "10:00 AM",
    address: "123 Main St, New York, NY 10001",
    status: "completed",
    totalAmount: 120,
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    rating: 5,
    review: "Excellent service! Very thorough and professional.",
    createdAt: "2024-03-15T09:30:00Z",
    updatedAt: "2024-03-20T14:30:00Z"
  },
  {
    id: "BK002",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@email.com",
    customerPhone: "+1 (555) 456-7890",
    servicePartnerName: "Mike Wilson",
    servicePartnerEmail: "mike.wilson@email.com",
    servicePartnerPhone: "+1 (555) 345-6789",
    serviceName: "Plumbing Repair",
    serviceCategory: "Plumbing",
    bookingDate: "2024-03-18",
    scheduledDate: "2024-03-22",
    scheduledTime: "2:00 PM",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    status: "in_progress",
    totalAmount: 180,
    paymentStatus: "paid",
    paymentMethod: "UPI",
    createdAt: "2024-03-18T11:15:00Z",
    updatedAt: "2024-03-22T14:00:00Z"
  },
  {
    id: "BK003",
    customerName: "Robert Smith",
    customerEmail: "robert.smith@email.com",
    customerPhone: "+1 (555) 789-0123",
    servicePartnerName: "David Brown",
    servicePartnerEmail: "david.brown@email.com",
    servicePartnerPhone: "+1 (555) 567-8901",
    serviceName: "Electrical Work",
    serviceCategory: "Electrical",
    bookingDate: "2024-03-19",
    scheduledDate: "2024-03-25",
    scheduledTime: "9:00 AM",
    address: "789 Pine St, Chicago, IL 60601",
    status: "confirmed",
    totalAmount: 250,
    paymentStatus: "paid",
    paymentMethod: "Debit Card",
    createdAt: "2024-03-19T16:45:00Z",
    updatedAt: "2024-03-19T16:45:00Z"
  },
  {
    id: "BK004",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.anderson@email.com",
    customerPhone: "+1 (555) 012-3456",
    servicePartnerName: "Sarah Johnson",
    servicePartnerEmail: "sarah.johnson@email.com",
    servicePartnerPhone: "+1 (555) 234-5678",
    serviceName: "House Cleaning",
    serviceCategory: "Cleaning",
    bookingDate: "2024-03-16",
    scheduledDate: "2024-03-21",
    scheduledTime: "11:00 AM",
    address: "321 Elm St, Houston, TX 77001",
    status: "cancelled",
    totalAmount: 100,
    paymentStatus: "refunded",
    paymentMethod: "Credit Card",
    cancellationReason: "Customer requested cancellation due to schedule conflict",
    createdAt: "2024-03-16T13:20:00Z",
    updatedAt: "2024-03-17T10:30:00Z"
  },
  {
    id: "BK005",
    customerName: "Michael Johnson",
    customerEmail: "michael.johnson@email.com",
    customerPhone: "+1 (555) 345-6789",
    servicePartnerName: "Mike Wilson",
    servicePartnerEmail: "mike.wilson@email.com",
    servicePartnerPhone: "+1 (555) 345-6789",
    serviceName: "Landscaping",
    serviceCategory: "Gardening",
    bookingDate: "2024-03-20",
    scheduledDate: "2024-03-26",
    scheduledTime: "8:00 AM",
    address: "654 Maple Dr, Phoenix, AZ 85001",
    status: "disputed",
    totalAmount: 300,
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    disputeReason: "Service quality not as expected, customer requesting partial refund",
    createdAt: "2024-03-20T08:15:00Z",
    updatedAt: "2024-03-26T16:45:00Z"
  },
  {
    id: "BK006",
    customerName: "Jennifer Wilson",
    customerEmail: "jennifer.wilson@email.com",
    customerPhone: "+1 (555) 678-9012",
    servicePartnerName: "David Brown",
    servicePartnerEmail: "david.brown@email.com",
    servicePartnerPhone: "+1 (555) 567-8901",
    serviceName: "HVAC Service",
    serviceCategory: "HVAC",
    bookingDate: "2024-03-21",
    scheduledDate: "2024-03-27",
    scheduledTime: "1:00 PM",
    address: "987 Cedar Ln, Miami, FL 33101",
    status: "pending",
    totalAmount: 220,
    paymentStatus: "pending",
    paymentMethod: "Credit Card",
    createdAt: "2024-03-21T14:30:00Z",
    updatedAt: "2024-03-21T14:30:00Z"
  }
];

export default function BookingOversight() {
  const [bookings, setBookings] = useState<Booking[]>(dummyBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "disputed">("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<"all" | "pending" | "paid" | "refunded" | "failed">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.servicePartnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesPaymentStatus = filterPaymentStatus === "all" || booking.paymentStatus === filterPaymentStatus;
    const matchesDateRange = (!dateRange.start || booking.bookingDate >= dateRange.start) &&
                            (!dateRange.end || booking.bookingDate <= dateRange.end);
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
  });

  const handleStatusChange = (bookingId: string, newStatus: Booking["status"]) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() } : booking
    ));
  };

  const handleRefund = (bookingId: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, paymentStatus: "refunded", updatedAt: new Date().toISOString() } : booking
    ));
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      disputed: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Booking["paymentStatus"]) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTotalStats = () => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === "completed").length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const disputed = bookings.filter(b => b.status === "disputed").length;
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return { total, completed, pending, disputed, totalRevenue };
  };

  const stats = getTotalStats();

  return (
    <>
      <PageMeta
        title="Booking Oversight | Homezy Admin Panel"
        description="Track and manage all bookings on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Booking Oversight" />
      
      <div className="space-y-6">
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <span className="text-orange-600 dark:text-orange-300">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Disputed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.disputed}</p>
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
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Bookings
            </h3>
            <div className="flex gap-2">
              <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Export Bookings
              </button>
              <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                Generate Report
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by booking ID, customer, or service partner..."
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
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="disputed">Disputed</option>
              </select>
              <select
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
              >
                <option value="all">All Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Booking ID</th>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Service Partner</th>
                  <th scope="col" className="px-6 py-3">Service</th>
                  <th scope="col" className="px-6 py-3">Date & Time</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Payment</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {booking.id}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.customerName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.customerEmail}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.servicePartnerName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.servicePartnerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.serviceName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.serviceCategory}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.scheduledTime}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${booking.totalAmount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          View
                        </button>
                        {booking.paymentStatus === "paid" && booking.status !== "refunded" && (
                          <button
                            onClick={() => handleRefund(booking.id)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            Refund
                          </button>
                        )}
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking["status"])}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="disputed">Disputed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">No bookings found matching your criteria.</div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Booking Details - {selectedBooking.id}
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
                    <div><strong>Name:</strong> {selectedBooking.customerName}</div>
                    <div><strong>Email:</strong> {selectedBooking.customerEmail}</div>
                    <div><strong>Phone:</strong> {selectedBooking.customerPhone}</div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Service Partner Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedBooking.servicePartnerName}</div>
                    <div><strong>Email:</strong> {selectedBooking.servicePartnerEmail}</div>
                    <div><strong>Phone:</strong> {selectedBooking.servicePartnerPhone}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Service:</strong> {selectedBooking.serviceName}</div>
                    <div><strong>Category:</strong> {selectedBooking.serviceCategory}</div>
                    <div><strong>Scheduled Date:</strong> {new Date(selectedBooking.scheduledDate).toLocaleDateString()}</div>
                    <div><strong>Scheduled Time:</strong> {selectedBooking.scheduledTime}</div>
                    <div><strong>Address:</strong> {selectedBooking.address}</div>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Payment & Status</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Amount:</strong> ${selectedBooking.totalAmount}</div>
                    <div><strong>Payment Method:</strong> {selectedBooking.paymentMethod}</div>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong> {getStatusBadge(selectedBooking.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Payment:</strong> {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                    </div>
                    {selectedBooking.rating && (
                      <div><strong>Rating:</strong> ⭐ {selectedBooking.rating}/5</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedBooking.review && (
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Customer Review</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.review}</p>
                </div>
              )}

              {selectedBooking.cancellationReason && (
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Cancellation Reason</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.cancellationReason}</p>
                </div>
              )}

              {selectedBooking.disputeReason && (
                <div>
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Dispute Reason</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.disputeReason}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  Resolve Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
