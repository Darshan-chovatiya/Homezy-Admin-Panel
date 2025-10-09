import { useState, useEffect } from "react";
import { Gift, Edit, Trash2, Eye, Plus, Users, History, Search, Filter } from "lucide-react";
import { couponService, Coupon, User, CreateCouponFormData, UpdateCouponFormData, CouponUsage, CouponStats, PaginationParams } from '../../services/coupan';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDiscountType, setFilterDiscountType] = useState<"all" | "percentage" | "fixed">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignUsersModal, setShowAssignUsersModal] = useState(false);
  const [showUsageHistoryModal, setShowUsageHistoryModal] = useState(false);
  const [usageHistory, setUsageHistory] = useState<CouponUsage[]>([]);
  const [usageHistoryPage, setUsageHistoryPage] = useState(1);
  const [usageHistoryTotalPages, setUsageHistoryTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formLoading, setFormLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Form state for creating coupon
  const [formData, setFormData] = useState<CreateCouponFormData>({
    couponName: "",
    couponCode: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderAmount: 0,
    startDate: "",
    endDate: "",
    usageLimitPerUser: 1,
    totalUsageLimit: undefined,
    isActive: true,
  });

  // Form state for editing coupon
  const [editFormData, setEditFormData] = useState<UpdateCouponFormData>({
    couponId: "",
    couponName: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderAmount: 0,
    startDate: "",
    endDate: "",
    usageLimitPerUser: 1,
    totalUsageLimit: undefined,
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await couponService.getAllUsers({ limit: 1000, search: userSearchTerm });
      setUsers(response.data.docs);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch coupons and stats
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params: PaginationParams = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        discountType: filterDiscountType !== "all" ? filterDiscountType : undefined,
        isActive: filterStatus === "all" ? undefined : filterStatus === "active",
        startDate: filterStartDate ? filterStartDate.toISOString().split('T')[0] : undefined,
        endDate: filterEndDate ? filterEndDate.toISOString().split('T')[0] : undefined,
      };

      const response = await couponService.getAllCoupons(params);
      setCoupons(response.data.docs);
      setTotalPages(response.data.totalPages);

      const statsResponse = await couponService.getCouponStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchTerm, filterDiscountType, filterStatus, filterStartDate, filterEndDate]);

  // Validate form
  const validateForm = (data: CreateCouponFormData | UpdateCouponFormData) => {
    const newErrors: { [key: string]: string } = {};

    if ('couponName' in data && !data.couponName) newErrors.couponName = "Coupon name is required";
    if (data.discountValue && data.discountValue <= 0) newErrors.discountValue = "Discount value must be greater than 0";
    if (data.discountType === "percentage" && data.discountValue && data.discountValue > 100)
      newErrors.discountValue = "Percentage discount cannot exceed 100";
    if ('startDate' in data && !data.startDate) newErrors.startDate = "Start date is required";
    if ('endDate' in data && !data.endDate) newErrors.endDate = "End date is required";
    if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate))
      newErrors.endDate = "End date must be after start date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle add coupon
  const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    setFormLoading(true);
    try {
      await couponService.createCoupon(formData);
      setShowAddModal(false);
      setFormData({
        couponName: "",
        couponCode: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        maxDiscountAmount: undefined,
        minOrderAmount: 0,
        startDate: "",
        endDate: "",
        usageLimitPerUser: 1,
        totalUsageLimit: undefined,
        isActive: true,
      });
      setErrors({});
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (coupon: Coupon) => {
    setEditFormData({
      couponId: coupon._id,
      couponName: coupon.couponName,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderAmount: coupon.minOrderAmount,
      startDate: coupon.startDate.split("T")[0],
      endDate: coupon.endDate.split("T")[0],
      usageLimitPerUser: coupon.usageLimitPerUser,
      totalUsageLimit: coupon.totalUsageLimit,
      isActive: coupon.isActive,
    });
    setShowEditModal(true);
  };

  // Handle edit coupon
  const handleEditCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm(editFormData)) return;

    setFormLoading(true);
    try {
      await couponService.updateCoupon(editFormData);
      setShowEditModal(false);
      setErrors({});
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (couponId: string) => {
    const result = await Swal.fire({
      title: "Delete coupon?",
      text: "This action will deactivate the coupon.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await couponService.deleteCoupon(couponId);
        fetchCoupons();
      } catch (error) {
        console.error("Error deleting coupon:", error);
      }
    }
  };

  // Open assign users modal
  const openAssignUsersModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setSelectedUserIds(coupon.assignedUsers?.map(user => user._id) || []);
    fetchUsers();
    setShowAssignUsersModal(true);
  };

  // Handle assign users
  const handleAssignUsers = async () => {
    if (!selectedCoupon || selectedUserIds.length === 0) return;

    setFormLoading(true);
    try {
      await couponService.assignCouponToUsers(selectedCoupon._id, selectedUserIds);
      setShowAssignUsersModal(false);
      setSelectedUserIds([]);
      fetchCoupons();
    } catch (error) {
      console.error("Error assigning users:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const selectAllUsers = () => {
    setSelectedUserIds(users.map(user => user._id));
  };

  // Deselect all users
  const deselectAllUsers = () => {
    setSelectedUserIds([]);
  };

  // Fetch usage history
  const fetchUsageHistory = async (couponId: string) => {
    try {
      const response = await couponService.getCouponUsageHistory(couponId, { page: usageHistoryPage, limit: 10 });
      setUsageHistory(response.data.docs);
      setUsageHistoryTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching usage history:", error);
    }
  };

  // Open usage history modal
  const openUsageHistoryModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setUsageHistoryPage(1);
    fetchUsageHistory(coupon._id);
    setShowUsageHistoryModal(true);
  };

  useEffect(() => {
    if (selectedCoupon && showUsageHistoryModal) {
      fetchUsageHistory(selectedCoupon._id);
    }
  }, [usageHistoryPage]);

  // Get status badge
  const getStatusBadge = (isActive: boolean) => (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${
        isActive
          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Management</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-white">{stats?.totalCoupons || 0}</span> | 
            Active: <span className="font-semibold text-green-600 dark:text-green-400">{stats?.activeCoupons || 0}</span> | 
            Expired: <span className="font-semibold text-red-600 dark:text-red-400">{stats?.expiredCoupons || 0}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
          Add Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons by code or name..."
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={filterDiscountType}
            onChange={(e) => {
              setFilterDiscountType(e.target.value as any);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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

          <DatePicker
            selected={filterStartDate}
            onChange={(date: Date | null) => {
              setFilterStartDate(date);
              setCurrentPage(1);
            }}
            placeholderText="Start date"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            dateFormat="yyyy-MM-dd"
          />

          <DatePicker
            selected={filterEndDate}
            onChange={(date: Date | null) => {
              setFilterEndDate(date);
              setCurrentPage(1);
            }}
            placeholderText="End date"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            dateFormat="yyyy-MM-dd"
          />

          {(filterStartDate || filterEndDate || filterDiscountType !== "all" || filterStatus !== "all" || searchTerm) && (
            <button
              onClick={() => {
                setFilterStartDate(null);
                setFilterEndDate(null);
                setFilterDiscountType("all");
                setFilterStatus("all");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading coupons...</p>
        </div>
      ) : (
        <>
          {/* Coupons Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-4">Coupon</th>
                  <th scope="col" className="px-6 py-4">Discount</th>
                  <th scope="col" className="px-6 py-4">Validity</th>
                  <th scope="col" className="px-6 py-4">Usage</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {coupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="bg-white hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30">
                          <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{coupon.couponName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{coupon.couponCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </div>
                      {coupon.maxDiscountAmount && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">Max: ₹{coupon.maxDiscountAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(coupon.startDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        to {new Date(coupon.endDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {coupon.actualUsageCount || 0} / {coupon.totalUsageLimit || "∞"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {coupon.assignedUsers?.length || 0} users
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(coupon.isActive)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setShowModal(true);
                          }}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                          </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
                          title="Edit Coupon"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openAssignUsersModal(coupon)}
                          className="rounded-lg bg-purple-50 p-2 text-purple-600 hover:bg-purple-100 transition-colors dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
                          title="Assign Users"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openUsageHistoryModal(coupon)}
                          className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                          title="Usage History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {coupons.length === 0 && !loading && (
            <div className="py-16 text-center">
              <Gift className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">No coupons found.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400"
              >
                <Plus className="h-4 w-4" />
                Create your first coupon
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-600 p-2">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Coupon</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddCoupon} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coupon Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.couponName}
                    onChange={(e) => setFormData({ ...formData, couponName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Summer Sale 2025"
                  />
                  {errors.couponName && <p className="mt-1 text-xs text-red-500">{errors.couponName}</p>}
                </div>

                {/* Coupon Code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coupon Code <span className="text-gray-400 text-xs">(optional - auto-generated if blank)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="SUMMER2025"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Describe your coupon offer..."
                    rows={3}
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder={formData.discountType === "percentage" ? "10" : "100"}
                  />
                  {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                </div>

                {/* Max Discount Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Discount <span className="text-gray-400 text-xs">(for % type)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || undefined })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="500"
                  />
                </div>

                {/* Min Order Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount || ""}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="0"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.startDate ? new Date(formData.startDate) : null}
                    onChange={(date: Date | null) => setFormData({ ...formData, startDate: date ? date.toISOString().split('T')[0] : "" })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    required
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.endDate ? new Date(formData.endDate) : null}
                    onChange={(date: Date | null) => setFormData({ ...formData, endDate: date ? date.toISOString().split('T')[0] : "" })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                    required
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
                </div>

                {/* Usage Limit Per User */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Limit Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimitPerUser}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="1"
                  />
                </div>

                {/* Total Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Usage Limit <span className="text-gray-400 text-xs">(blank = unlimited)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalUsageLimit || ""}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: parseInt(e.target.value) || undefined })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Unlimited"
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active (Coupon will be available immediately)
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {formLoading ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-600 p-2">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Coupon</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditCoupon} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coupon Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.couponName}
                    onChange={(e) => setEditFormData({ ...editFormData, couponName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.couponName && <p className="mt-1 text-xs text-red-500">{errors.couponName}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    rows={3}
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editFormData.discountType}
                    onChange={(e) => setEditFormData({ ...editFormData, discountType: e.target.value as "percentage" | "fixed" })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editFormData.discountValue}
                    onChange={(e) => setEditFormData({ ...editFormData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                </div>

                {/* Max Discount Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.maxDiscountAmount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, maxDiscountAmount: parseFloat(e.target.value) || undefined })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Min Order Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.minOrderAmount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={editFormData.startDate ? new Date(editFormData.startDate) : null}
                    onChange={(date: Date | null) => setEditFormData({ ...editFormData, startDate: date ? date.toISOString().split('T')[0] : "" })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={editFormData.endDate ? new Date(editFormData.endDate) : null}
                    onChange={(date: Date | null) => setEditFormData({ ...editFormData, endDate: date ? date.toISOString().split('T')[0] : "" })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
                </div>

                {/* Usage Limit Per User */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Limit Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.usageLimitPerUser}
                    onChange={(e) => setEditFormData({ ...editFormData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Total Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.totalUsageLimit || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, totalUsageLimit: parseInt(e.target.value) || undefined })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {formLoading ? "Updating..." : "Update Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Coupon Details Modal */}
      {showModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCoupon.couponName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{selectedCoupon.couponCode}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  {getStatusBadge(selectedCoupon.isActive)}
                </div>

                {/* Description */}
                {selectedCoupon.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                      {selectedCoupon.description}
                    </p>
                  </div>
                )}

                {/* Discount Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Discount Type</label>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {selectedCoupon.discountType === "percentage" ? "Percentage" : "Fixed Amount"}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">Discount Value</label>
                    <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                      {selectedCoupon.discountType === "percentage" ? `${selectedCoupon.discountValue}%` : `₹${selectedCoupon.discountValue}`}
                    </p>
                  </div>

                  {selectedCoupon.maxDiscountAmount && (
                    <div className="p-4 bg-amber-50 rounded-lg dark:bg-amber-900/20">
                      <label className="block text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Max Discount</label>
                      <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">₹{selectedCoupon.maxDiscountAmount}</p>
                    </div>
                  )}

                  <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                    <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Min Order Amount</label>
                    <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">₹{selectedCoupon.minOrderAmount || 0}</p>
                  </div>
                </div>

                {/* Validity Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Validity Period</label>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedCoupon.startDate).toLocaleDateString("en-IN", { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedCoupon.endDate).toLocaleDateString("en-IN", { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                    <label className="block text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">Per User Limit</label>
                    <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">{selectedCoupon.usageLimitPerUser}</p>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg dark:bg-pink-900/20">
                    <label className="block text-xs font-medium text-pink-700 dark:text-pink-300 mb-1">Total Limit</label>
                    <p className="text-lg font-semibold text-pink-900 dark:text-pink-100">{selectedCoupon.totalUsageLimit || "∞"}</p>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-lg dark:bg-teal-900/20">
                    <label className="block text-xs font-medium text-teal-700 dark:text-teal-300 mb-1">Used</label>
                    <p className="text-lg font-semibold text-teal-900 dark:text-teal-100">{selectedCoupon.actualUsageCount || 0}</p>
                  </div>
                </div>

                {/* Assigned Users */}
                {selectedCoupon.assignedUsers && selectedCoupon.assignedUsers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assigned Users ({selectedCoupon.assignedUsers.length})
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-2 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                      {selectedCoupon.assignedUsers.map(user => (
                        <div key={user._id} className="flex items-center gap-3 p-2 bg-white rounded dark:bg-gray-700">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs dark:bg-blue-900/30 dark:text-blue-400">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.emailId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created By</label>
                  <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedCoupon.createdBy.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCoupon.createdBy.emailId}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(selectedCoupon.createdAt).toLocaleDateString("en-IN", {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Users Modal */}
    {/* Assign Users Modal */}
      {showAssignUsersModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white shadow-xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Users</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCoupon.couponCode}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignUsersModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col p-6">
              {/* Search and Actions */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      fetchUsers();
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUserIds.length}</span> of{" "}
                    <span className="font-semibold">{users.length}</span> users selected
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllUsers}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      type="button"
                      onClick={deselectAllUsers}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {users.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </div>
                ) : (
                  users.map(user => (
                    <label
                      key={user._id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUserIds.includes(user._id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-600"
                          : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm dark:bg-blue-900/30 dark:text-blue-400">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.emailId}</p>
                        {user.mobileNo && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">{user.mobileNo}</p>
                        )}
                      </div>
                      {user.isActive ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowAssignUsersModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignUsers}
                disabled={formLoading || selectedUserIds.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? "Assigning..." : `Assign to ${selectedUserIds.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageHistoryModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-600 p-2">
                  <History className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usage History</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCoupon.couponCode}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUsageHistoryModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {usageHistory.length === 0 ? (
                <div className="py-16 text-center">
                  <History className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">No usage history found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {usageHistory.map(usage => (
                    <div
                      key={usage._id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all dark:border-gray-700 dark:hover:border-green-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
                            {usage.userId.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{usage.userId.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{usage.userId.emailId}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          usage.status === 'applied'
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                        }`}>
                          {usage.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{usage.orderId._id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Order Total</p>
                          <p className="font-medium text-gray-900 dark:text-white">₹{usage.orderId.totalPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Discount</p>
                          <p className="font-medium text-green-600 dark:text-green-400">₹{usage.discountAmount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Used At</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(usage.usedAt).toLocaleDateString("en-IN", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination */}
            {usageHistoryTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-semibold">{usageHistoryPage}</span> of{" "}
                  <span className="font-semibold">{usageHistoryTotalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUsageHistoryPage(prev => Math.max(1, prev - 1))}
                    disabled={usageHistoryPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setUsageHistoryPage(prev => Math.min(usageHistoryTotalPages, prev + 1))}
                    disabled={usageHistoryPage === usageHistoryTotalPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Close Button if no pagination */}
            {usageHistoryTotalPages <= 1 && (
              <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowUsageHistoryModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}