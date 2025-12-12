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
  const [formData, setFormData] = useState<CreateCouponFormData & { discountValueInput?: string; maxDiscountAmountInput?: string }>({
    couponName: "",
    couponCode: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    discountValueInput: "0",
    maxDiscountAmount: undefined,
    maxDiscountAmountInput: "",
    minOrderAmount: 0,
    startDate: "",
    endDate: "",
    usageLimitPerUser: 1,
    totalUsageLimit: undefined,
    isActive: true,
  });

  // Form state for editing coupon
  const [editFormData, setEditFormData] = useState<UpdateCouponFormData & { discountValueInput?: string; maxDiscountAmountInput?: string }>({
    couponId: "",
    couponName: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    discountValueInput: "0",
    maxDiscountAmount: undefined,
    maxDiscountAmountInput: "",
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
    
    // Validate percentage discount cannot exceed 100%
    if (data.discountType === "percentage") {
      if (data.discountValue && data.discountValue > 100) {
        newErrors.discountValue = "Percentage discount cannot exceed 100%";
      }
      if (data.discountValue && data.discountValue <= 0) {
        newErrors.discountValue = "Percentage discount must be greater than 0";
      }
    }
    
    // Validate fixed discount value should be less than min order amount
    if (data.discountType === "fixed") {
      if (data.discountValue && data.minOrderAmount && data.minOrderAmount > 0) {
        if (data.discountValue >= data.minOrderAmount) {
          newErrors.discountValue = "Discount amount must be less than minimum order amount";
        }
      }
      // Also validate discount value is reasonable (not too high)
      if (data.discountValue && data.discountValue > 100000) {
        newErrors.discountValue = "Discount value is too high";
      }
    }
    
    // For percentage type, validate max discount if provided
    if (data.discountType === "percentage") {
      if (data.maxDiscountAmount && data.minOrderAmount && data.minOrderAmount > 0) {
        if (data.maxDiscountAmount >= data.minOrderAmount) {
          newErrors.maxDiscountAmount = "Max discount amount must be less than minimum order amount";
        }
      }
      // Validate max discount is reasonable
      if (data.maxDiscountAmount && data.maxDiscountAmount > 100000) {
        newErrors.maxDiscountAmount = "Max discount amount is too high";
      }
    }
    
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
        discountValueInput: "0",
        maxDiscountAmount: undefined,
        maxDiscountAmountInput: "",
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
      discountValueInput: coupon.discountValue.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount,
      maxDiscountAmountInput: coupon.maxDiscountAmount ? coupon.maxDiscountAmount.toString() : "",
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

  // Handle status toggle
  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const nextStatus = !coupon.isActive;
      await couponService.updateCoupon({
        couponId: coupon._id,
        isActive: nextStatus
      });
      
      // Update local state
      setCoupons(prev =>
        prev.map(c =>
          c._id === coupon._id ? { ...c, isActive: nextStatus } : c
        )
      );
      
      // Update stats
      const statsResponse = await couponService.getCouponStats();
      setStats(statsResponse.data);
      
      Swal.fire('Success', `Coupon ${nextStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating coupon status:', error);
      Swal.fire('Error', 'Failed to update coupon status', 'error');
    }
  };

  // Get status badge
  const getStatusBadge = (coupon: Coupon) => (
    <span
      onClick={() => handleToggleStatus(coupon)}
      className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
        coupon.isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {coupon.isActive ? "Active" : "Inactive"}
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
          className="inline-flex items-center gap-2 rounded-lg bg-[#013365] px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-[#013365]/90 focus:outline-none focus:ring-4 focus:ring-[#013365]/30 transition-all dark:bg-[#013365] dark:hover:bg-[#013365]/90"
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
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-[#013365]/30"
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
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            dateFormat="yyyy-MM-dd"
          />

          <DatePicker
            selected={filterEndDate}
            onChange={(date: Date | null) => {
              setFilterEndDate(date);
              setCurrentPage(1);
            }}
            placeholderText="End date"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
              className="text-sm text-[#013365] hover:text-[#013365] font-medium dark:text-blue-400"
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
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
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
                          <Gift className="h-6 w-6 text-[#013365] dark:text-blue-400" />
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
                    <td className="px-6 py-4">{getStatusBadge(coupon)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setShowModal(true);
                          }}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="Edit Coupon"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openAssignUsersModal(coupon)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="Assign Users"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openUsageHistoryModal(coupon)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="Usage History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-700 transition-colors duration-200"
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
                className="mt-4 inline-flex items-center gap-2 text-sm text-[#013365] hover:text-[#013365] font-medium dark:text-blue-400"
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
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#013365]/10 to-[#013365]/20 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#013365] p-2">
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
            <form id="addCouponForm" onSubmit={handleAddCoupon} className="flex-1 overflow-y-auto p-6">
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono uppercase focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="SUMMER2025"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    onChange={(e) => {
                      const newType = e.target.value as "percentage" | "fixed";
                      setFormData({ 
                        ...formData, 
                        discountType: newType,
                        // Reset input fields when switching types
                        discountValueInput: newType === "fixed" ? formData.discountValueInput : "0",
                        maxDiscountAmountInput: newType === "percentage" ? formData.maxDiscountAmountInput : ""
                      });
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value - Show only for Fixed type */}
                {formData.discountType === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Value (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={formData.discountValueInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ 
                          ...formData, 
                          discountValueInput: value,
                          discountValue: value === '' || value === '-' ? 0 : (parseFloat(value) || 0)
                        });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value === '' || value === '-' || isNaN(Number(value)) || Number(value) < 0) {
                          setFormData({ 
                            ...formData, 
                            discountValueInput: '0',
                            discountValue: 0
                          });
                        } else {
                          const numValue = Number(value);
                          // Validate discount is less than min order amount
                          if (formData.minOrderAmount && numValue >= formData.minOrderAmount) {
                            setErrors({ ...errors, discountValue: "Discount amount must be less than minimum order amount" });
                          }
                          setFormData({ 
                            ...formData, 
                            discountValueInput: numValue.toString(),
                            discountValue: numValue
                          });
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="100"
                    />
                    {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                  </div>
                )}

                {/* Discount Value - Show only for Percentage type */}
                {formData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Percentage (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={formData.discountValueInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' || value === '-' ? 0 : (parseFloat(value) || 0);
                        // Validate percentage cannot exceed 100
                        if (numValue > 100) {
                          setErrors({ ...errors, discountValue: "Percentage discount cannot exceed 100%" });
                        } else {
                          setErrors({ ...errors, discountValue: "" });
                        }
                        setFormData({ 
                          ...formData, 
                          discountValueInput: value,
                          discountValue: numValue > 100 ? 100 : numValue
                        });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value === '' || value === '-' || isNaN(Number(value)) || Number(value) < 0) {
                          setFormData({ 
                            ...formData, 
                            discountValueInput: '0',
                            discountValue: 0
                          });
                        } else {
                          const numValue = Number(value);
                          if (numValue > 100) {
                            setFormData({ 
                              ...formData, 
                              discountValueInput: '100',
                              discountValue: 100
                            });
                            setErrors({ ...errors, discountValue: "Percentage discount cannot exceed 100%" });
                          } else {
                            setFormData({ 
                              ...formData, 
                              discountValueInput: numValue.toString(),
                              discountValue: numValue
                            });
                            setErrors({ ...errors, discountValue: "" });
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="10"
                    />
                    {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                  </div>
                )}

                {/* Max Discount Amount - Show only for Percentage type */}
                {formData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Discount (₹) <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.maxDiscountAmountInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ 
                          ...formData, 
                          maxDiscountAmountInput: value,
                          maxDiscountAmount: value === '' ? undefined : (parseFloat(value) || undefined)
                        });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value === '' || value === '-' || isNaN(Number(value)) || Number(value) < 0) {
                          setFormData({ 
                            ...formData, 
                            maxDiscountAmountInput: '',
                            maxDiscountAmount: undefined
                          });
                        } else {
                          const numValue = Number(value);
                          // Validate max discount is less than min order amount
                          if (formData.minOrderAmount && numValue >= formData.minOrderAmount) {
                            setErrors({ ...errors, maxDiscountAmount: "Max discount amount must be less than minimum order amount" });
                          }
                          setFormData({ 
                            ...formData, 
                            maxDiscountAmountInput: numValue.toString(),
                            maxDiscountAmount: numValue
                          });
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="500"
                    />
                    {errors.maxDiscountAmount && <p className="mt-1 text-xs text-red-500">{errors.maxDiscountAmount}</p>}
                  </div>
                )}

                {/* Min Order Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount || ""}
                    onChange={(e) => {
                      const newMinOrder = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, minOrderAmount: newMinOrder });
                      // Clear errors when min order amount changes
                      if (errors.discountValue || errors.maxDiscountAmount) {
                        setErrors({ ...errors, discountValue: "", maxDiscountAmount: "" });
                      }
                    }}
                    onBlur={() => {
                      // Re-validate discount values when min order amount changes
                      if (formData.discountType === "fixed" && formData.discountValue && formData.minOrderAmount) {
                        if (formData.discountValue >= formData.minOrderAmount) {
                          setErrors({ ...errors, discountValue: "Discount amount must be less than minimum order amount" });
                        }
                      }
                      if (formData.discountType === "percentage" && formData.maxDiscountAmount && formData.minOrderAmount) {
                        if (formData.maxDiscountAmount >= formData.minOrderAmount) {
                          setErrors({ ...errors, maxDiscountAmount: "Max discount amount must be less than minimum order amount" });
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="h-5 w-5 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active (Coupon will be available immediately)
                  </label>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="addCouponForm"
                disabled={formLoading}
                className="rounded-lg bg-[#013365] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#013365]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {formLoading ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#013365]/10 to-[#013365]/20 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#013365] p-2">
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
            <form id="editCouponForm" onSubmit={handleEditCoupon} className="flex-1 overflow-y-auto p-6">
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.couponName && <p className="mt-1 text-xs text-red-500">{errors.couponName}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    onChange={(e) => {
                      const newType = e.target.value as "percentage" | "fixed";
                      setEditFormData({ 
                        ...editFormData, 
                        discountType: newType,
                        // Reset input fields when switching types
                        discountValueInput: newType === "fixed" ? editFormData.discountValueInput : editFormData.discountValueInput,
                        maxDiscountAmountInput: newType === "percentage" ? editFormData.maxDiscountAmountInput : ""
                      });
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value - Show only for Fixed type */}
                {editFormData.discountType === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Value (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={editFormData.discountValueInput || editFormData.discountValue.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditFormData({ 
                          ...editFormData, 
                          discountValueInput: value,
                          discountValue: value === '' || value === '-' ? 0 : (parseFloat(value) || 0)
                        });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value === '' || value === '-' || isNaN(Number(value)) || Number(value) < 0) {
                          setEditFormData({ 
                            ...editFormData, 
                            discountValueInput: '0',
                            discountValue: 0
                          });
                        } else {
                          const numValue = Number(value);
                          if (editFormData.minOrderAmount && numValue >= editFormData.minOrderAmount) {
                            setErrors({ ...errors, discountValue: "Discount amount must be less than minimum order amount" });
                          }
                          setEditFormData({ 
                            ...editFormData, 
                            discountValueInput: numValue.toString(),
                            discountValue: numValue
                          });
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="100"
                    />
                    {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                  </div>
                )}

                {/* Discount Percentage - Show only for Percentage type */}
                {editFormData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Percentage (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={editFormData.discountValueInput || editFormData.discountValue.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' || value === '-' ? 0 : (parseFloat(value) || 0);
                        // Validate percentage cannot exceed 100
                        if (numValue > 100) {
                          setErrors({ ...errors, discountValue: "Percentage discount cannot exceed 100%" });
                        } else {
                          setErrors({ ...errors, discountValue: "" });
                        }
                        setEditFormData({ 
                          ...editFormData, 
                          discountValueInput: value,
                          discountValue: numValue > 100 ? 100 : numValue
                        });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value === '' || value === '-' || isNaN(Number(value)) || Number(value) < 0) {
                          setEditFormData({ 
                            ...editFormData, 
                            discountValueInput: '0',
                            discountValue: 0
                          });
                        } else {
                          const numValue = Number(value);
                          if (numValue > 100) {
                            setEditFormData({ 
                              ...editFormData, 
                              discountValueInput: '100',
                              discountValue: 100
                            });
                            setErrors({ ...errors, discountValue: "Percentage discount cannot exceed 100%" });
                          } else {
                            setEditFormData({ 
                              ...editFormData, 
                              discountValueInput: numValue.toString(),
                              discountValue: numValue
                            });
                            setErrors({ ...errors, discountValue: "" });
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="10"
                    />
                    {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                  </div>
                )}

                {/* Max Discount Amount - Show only for Percentage type */}
                {editFormData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Discount (₹) <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editFormData.maxDiscountAmountInput || (editFormData.maxDiscountAmount ? editFormData.maxDiscountAmount.toString() : "")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditFormData({ 
                          ...editFormData, 
                          maxDiscountAmountInput: value,
                          maxDiscountAmount: value === '' ? undefined : (parseFloat(value) || undefined)
                        });
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value === '' || value === '-' || isNaN(Number(value)) || Number(value) < 0) {
                          setEditFormData({ 
                            ...editFormData, 
                            maxDiscountAmountInput: '',
                            maxDiscountAmount: undefined
                          });
                        } else {
                          const numValue = Number(value);
                          if (editFormData.minOrderAmount && numValue >= editFormData.minOrderAmount) {
                            setErrors({ ...errors, maxDiscountAmount: "Max discount amount must be less than minimum order amount" });
                          }
                          setEditFormData({ 
                            ...editFormData, 
                            maxDiscountAmountInput: numValue.toString(),
                            maxDiscountAmount: numValue
                          });
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="500"
                    />
                    {errors.maxDiscountAmount && <p className="mt-1 text-xs text-red-500">{errors.maxDiscountAmount}</p>}
                  </div>
                )}

                {/* Min Order Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.minOrderAmount || ""}
                    onChange={(e) => {
                      const newMinOrder = parseFloat(e.target.value) || 0;
                      setEditFormData({ ...editFormData, minOrderAmount: newMinOrder });
                      // Clear errors when min order amount changes
                      if (errors.discountValue || errors.maxDiscountAmount) {
                        setErrors({ ...errors, discountValue: "", maxDiscountAmount: "" });
                      }
                    }}
                    onBlur={() => {
                      // Re-validate discount values when min order amount changes
                      if (editFormData.discountType === "fixed" && editFormData.discountValue && editFormData.minOrderAmount) {
                        if (editFormData.discountValue >= editFormData.minOrderAmount) {
                          setErrors({ ...errors, discountValue: "Discount amount must be less than minimum order amount" });
                        }
                      }
                      if (editFormData.discountType === "percentage" && editFormData.maxDiscountAmount && editFormData.minOrderAmount) {
                        if (editFormData.maxDiscountAmount >= editFormData.minOrderAmount) {
                          setErrors({ ...errors, maxDiscountAmount: "Max discount amount must be less than minimum order amount" });
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#013365] focus:ring-2 focus:ring-[#013365]/20 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-5 w-5 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
                  />
                  <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editCouponForm"
                disabled={formLoading}
                className="rounded-lg bg-[#013365] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#013365]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {formLoading ? "Updating..." : "Update Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Coupon Details Modal */}
      {showModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#013365]/10 to-[#013365]/20 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#013365] p-2">
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
                  {getStatusBadge(selectedCoupon)}
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
                    <label className="block text-xs font-medium text-[#013365] dark:text-blue-300 mb-1">Discount Type</label>
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
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[#013365] font-semibold text-xs dark:bg-blue-900/30 dark:text-blue-400">
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
                <Users className="h-5 w-5 text-[#013365] dark:text-blue-400" />
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
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-[#013365] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      fetchUsers();
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-[#013365] dark:text-blue-400">{selectedUserIds.length}</span> of{" "}
                    <span className="font-semibold">{users.length}</span> users selected
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllUsers}
                      className="text-sm text-[#013365] hover:text-[#013365] font-medium dark:text-blue-400"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      type="button"
                      onClick={deselectAllUsers}
                      className="text-sm text-[#013365] hover:text-[#013365] font-medium dark:text-blue-400"
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
                        className="h-4 w-4 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
                      />
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#013365] font-semibold text-sm dark:bg-blue-900/30 dark:text-blue-400">
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
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
                className="rounded-lg bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#013365]/10 to-[#013365]/20 px-6 py-4 rounded-t-xl dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#013365] p-2">
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