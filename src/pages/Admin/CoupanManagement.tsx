import { useState, useEffect } from "react";
import { Gift, Edit, Trash2, Eye, Plus, Users, History } from "lucide-react";
import { couponService, Coupon, CreateCouponFormData, UpdateCouponFormData, CouponUsage, CouponStats, PaginationParams } from '../../services/coupan';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

interface SelectOption {
  _id: string;
  name: string;
  emailId?: string;
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDiscountType, setFilterDiscountType] = useState<"all" | "percentage" | "fixed">("all");
  const [filterApplicableFor, setFilterApplicableFor] = useState<
    "all" | "specific_users" | "specific_categories" | "specific_subcategories" | "first_order"
  >("all");
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
  // const [totalDocs, setTotalDocs] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [subcategories, setSubcategories] = useState<SelectOption[]>([]);

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
    applicableFor: "all",
    assignedUsers: [],
    applicableCategories: [],
    applicableSubcategories: [],
    isActive: true,
  });

  // Form state for editing coupon
  const [editFormData, setEditFormData] = useState<UpdateCouponFormData>({
    couponId: "",
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
    applicableFor: "all",
    assignedUsers: [],
    applicableCategories: [],
    applicableSubcategories: [],
    isActive: true,
  });

  // Form state for assigning users
  const [assignUsersForm, setAssignUsersForm] = useState<string[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch users, categories, and subcategories
  const fetchSelectOptions = async () => {
    try {
      const usersResponse = await fetch('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      const categoriesResponse = await fetch('/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      const subcategoriesResponse = await fetch('/api/subcategories', { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setUsers((await usersResponse.json()).data || []);
      setCategories((await categoriesResponse.json()).data || []);
      setSubcategories((await subcategoriesResponse.json()).data || []);
    } catch (error) {
      console.error("Error fetching select options:", error);
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
        applicableFor: filterApplicableFor !== "all" ? filterApplicableFor : undefined,
        isActive: filterStatus === "all" ? undefined : filterStatus === "active",
        startDate: filterStartDate ? filterStartDate.toISOString().split('T')[0] : undefined,
        endDate: filterEndDate ? filterEndDate.toISOString().split('T')[0] : undefined,
      };
      const response = await couponService.getAllCoupons(params);
      setCoupons(response.data.docs);
      setTotalPages(response.data.totalPages);
      // setTotalDocs(response.data.totalDocs);

      const statsResponse = await couponService.getCouponStats();
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectOptions();
    fetchCoupons();
  }, [currentPage, searchTerm, filterDiscountType, filterApplicableFor, filterStatus, filterStartDate, filterEndDate]);

  // Validate form
  const validateForm = (data: CreateCouponFormData | UpdateCouponFormData) => {
    const newErrors: { [key: string]: string } = {};
    if (!data.couponName) newErrors.couponName = "Coupon name is required";
    if (data.discountValue <= 0) newErrors.discountValue = "Discount value must be greater than 0";
    if (data.discountType === "percentage" && data.discountValue > 100)
      newErrors.discountValue = "Percentage discount cannot exceed 100";
    if (!data.startDate) newErrors.startDate = "Start date is required";
    if (!data.endDate) newErrors.endDate = "End date is required";
    if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate))
      newErrors.endDate = "End date must be after start date";
    if (data.minOrderAmount && data.minOrderAmount < 0)
      newErrors.minOrderAmount = "Minimum order amount cannot be negative";
    if (data.maxDiscountAmount && data.maxDiscountAmount < 0)
      newErrors.maxDiscountAmount = "Maximum discount amount cannot be negative";
    if (data.usageLimitPerUser && data.usageLimitPerUser < 1)
      newErrors.usageLimitPerUser = "Usage limit per user must be at least 1";
    if (data.totalUsageLimit && data.totalUsageLimit < 0)
      newErrors.totalUsageLimit = "Total usage limit cannot be negative";
    if (data.applicableFor === "specific_users" && (!data.assignedUsers || data.assignedUsers.length === 0))
      newErrors.assignedUsers = "Please assign users for specific users coupon";
    if (data.applicableFor === "specific_categories" && (!data.applicableCategories || data.applicableCategories.length === 0))
      newErrors.applicableCategories = "Please select categories for specific categories coupon";
    if (data.applicableFor === "specific_subcategories" && (!data.applicableSubcategories || data.applicableSubcategories.length === 0))
      newErrors.applicableSubcategories = "Please select subcategories for specific subcategories coupon";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle add coupon
  const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity() || !validateForm(formData)) {
      form.reportValidity();
      return;
    }

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
        applicableFor: "all",
        assignedUsers: [],
        applicableCategories: [],
        applicableSubcategories: [],
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
      couponCode: coupon.couponCode,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderAmount: coupon.minOrderAmount,
      startDate: coupon.startDate.split("T")[0],
      endDate: coupon.endDate.split("T")[0],
      usageLimitPerUser: coupon.usageLimitPerUser,
      totalUsageLimit: coupon.totalUsageLimit,
      applicableFor: coupon.applicableFor,
      assignedUsers: coupon.assignedUsers?.map(user => user._id) || [],
      applicableCategories: coupon.applicableCategories?.map(cat => cat._id) || [],
      applicableSubcategories: coupon.applicableSubcategories?.map(subcat => subcat._id) || [],
      isActive: coupon.isActive,
    });
    setShowEditModal(true);
  };

  // Handle edit coupon
  const handleEditCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity() || !validateForm(editFormData)) {
      form.reportValidity();
      return;
    }

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

  // Handle delete with confirmation
  const handleDelete = async (couponId: string) => {
    const result = await Swal.fire({
      title: "Delete coupon?",
      text: "This action will soft delete the coupon.",
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

  // Handle assign users
  const handleAssignUsers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCoupon || assignUsersForm.length === 0) return;

    setFormLoading(true);
    try {
      await couponService.assignCouponToUsers(selectedCoupon._id, assignUsersForm);
      setShowAssignUsersModal(false);
      setAssignUsersForm([]);
      fetchCoupons();
    } catch (error) {
      console.error("Error assigning users:", error);
    } finally {
      setFormLoading(false);
    }
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Coupon Management</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Total Coupons: <span className="font-semibold">{stats?.totalCoupons || 0}</span> | Active: <span className="font-semibold">{stats?.activeCoupons || 0}</span> | Expired: <span className="font-semibold">{stats?.expiredCoupons || 0}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:border-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Coupon
        </button>
      </div>

     {/* Filters */}
<div className="mb-6 space-y-4">
  {/* Search Bar - Full Width on Top */}
  <div className="relative">
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      type="text"
      placeholder="Search coupons by code or name..."
      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

  {/* All Other Filters in One Row */}
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
    <select
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      value={filterDiscountType}
      onChange={(e) => {
        setFilterDiscountType(e.target.value as any);
        setCurrentPage(1);
      }}
    >
      <option value="all">All Discount Types</option>
      <option value="percentage">Percentage</option>
      <option value="fixed">Fixed</option>
    </select>
    <select
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      value={filterApplicableFor}
      onChange={(e) => {
        setFilterApplicableFor(e.target.value as any);
        setCurrentPage(1);
      }}
    >
      <option value="all">All Applicability</option>
      <option value="all">All Users</option>
      <option value="specific_users">Specific Users</option>
      <option value="specific_categories">Specific Categories</option>
      <option value="specific_subcategories">Specific Subcategories</option>
      <option value="first_order">First Order</option>
    </select>
    <select
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
    <div>
      <DatePicker
        selected={filterStartDate}
        onChange={(date: Date | null) => {
          setFilterStartDate(date);
          setCurrentPage(1);
        }}
        placeholderText="Select start date"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        dateFormat="yyyy-MM-dd"
      />
    </div>
    <div>
      <DatePicker
        selected={filterEndDate}
        onChange={(date: Date | null) => {
          setFilterEndDate(date);
          setCurrentPage(1);
        }}
        placeholderText="Select end date"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        dateFormat="yyyy-MM-dd"
      />
    </div>
  </div>
</div>

      {/* Loading State */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading coupons...</p>
        </div>
      ) : (
        <>
          {/* Coupons Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Coupon</th>
                  <th scope="col" className="px-6 py-3">Discount</th>
                  <th scope="col" className="px-6 py-3">Validity</th>
                  <th scope="col" className="px-6 py-3">Usage</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                          <Gift className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{coupon.couponName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{coupon.couponCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      {coupon.maxDiscountAmount && ` (Max: ₹${coupon.maxDiscountAmount})`}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(coupon.startDate).toLocaleDateString("en-IN")} -{" "}
                      {new Date(coupon.endDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.actualUsageCount || 0}/{coupon.totalUsageLimit || "∞"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(coupon.isActive)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setShowModal(true);
                          }}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700"
                          title="Edit Coupon"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setAssignUsersForm(coupon.assignedUsers?.map(user => user._id) || []);
                            setShowAssignUsersModal(true);
                          }}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700"
                          title="Assign Users"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openUsageHistoryModal(coupon)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700"
                          title="Usage History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 border border-red-300 dark:border-red-700"
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
            <div className="py-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">No coupons found.</div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing page <span className="font-semibold">{currentPage}</span> of{" "}
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
        </>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Coupon</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCoupon} className="flex-1 overflow-y-auto p-6" id="add-coupon-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coupon Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.couponName}
                    onChange={(e) => setFormData({ ...formData, couponName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter coupon name"
                  />
                  {errors.couponName && <p className="mt-1 text-xs text-red-500">{errors.couponName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter coupon code (leave blank to auto-generate)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter coupon description"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter discount value"
                  />
                  {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Discount Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || undefined })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter max discount amount"
                  />
                  {errors.maxDiscountAmount && <p className="mt-1 text-xs text-red-500">{errors.maxDiscountAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderAmount || ""}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter minimum order amount"
                  />
                  {errors.minOrderAmount && <p className="mt-1 text-xs text-red-500">{errors.minOrderAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.startDate ? new Date(formData.startDate) : null}
                    onChange={(date: Date | null) => setFormData({ ...formData, startDate: date ? date.toISOString().split('T')[0] : "" })}
                    placeholderText="Select start date"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.endDate ? new Date(formData.endDate) : null}
                    onChange={(date: Date | null) => setFormData({ ...formData, endDate: date ? date.toISOString().split('T')[0] : "" })}
                    placeholderText="Select end date"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimitPerUser}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter usage limit per user"
                  />
                  {errors.usageLimitPerUser && <p className="mt-1 text-xs text-red-500">{errors.usageLimitPerUser}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Usage Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalUsageLimit || ""}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: parseInt(e.target.value) || undefined })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter total usage limit (0 for unlimited)"
                  />
                  {errors.totalUsageLimit && <p className="mt-1 text-xs text-red-500">{errors.totalUsageLimit}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicable For</label>
                  <select
                    value={formData.applicableFor}
                    onChange={(e) => setFormData({ ...formData, applicableFor: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="specific_users">Specific Users</option>
                    <option value="specific_categories">Specific Categories</option>
                    <option value="specific_subcategories">Specific Subcategories</option>
                    <option value="first_order">First Order</option>
                  </select>
                </div>
                {formData.applicableFor === "specific_users" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Users</label>
                    <select
                      multiple
                      value={formData.assignedUsers}
                      onChange={(e) => setFormData({ ...formData, assignedUsers: Array.from(e.target.selectedOptions, option => option.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name} ({user.emailId})</option>
                      ))}
                    </select>
                    {errors.assignedUsers && <p className="mt-1 text-xs text-red-500">{errors.assignedUsers}</p>}
                  </div>
                )}
                {formData.applicableFor === "specific_categories" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicable Categories</label>
                    <select
                      multiple
                      value={formData.applicableCategories}
                      onChange={(e) => setFormData({ ...formData, applicableCategories: Array.from(e.target.selectedOptions, option => option.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.applicableCategories && <p className="mt-1 text-xs text-red-500">{errors.applicableCategories}</p>}
                  </div>
                )}
                {formData.applicableFor === "specific_subcategories" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicable Subcategories</label>
                    <select
                      multiple
                      value={formData.applicableSubcategories}
                      onChange={(e) => setFormData({ ...formData, applicableSubcategories: Array.from(e.target.selectedOptions, option => option.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {subcategories.map(subcategory => (
                        <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
                      ))}
                    </select>
                    {errors.applicableSubcategories && <p className="mt-1 text-xs text-red-500">{errors.applicableSubcategories}</p>}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
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
                  {formLoading ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Coupon</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditCoupon} className="flex-1 overflow-y-auto p-6" id="edit-coupon-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coupon Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.couponName}
                    onChange={(e) => setEditFormData({ ...editFormData, couponName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter coupon name"
                  />
                  {errors.couponName && <p className="mt-1 text-xs text-red-500">{errors.couponName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
                  <input
                    type="text"
                    value={editFormData.couponCode}
                    onChange={(e) => setEditFormData({ ...editFormData, couponCode: e.target.value.toUpperCase() })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter coupon code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter coupon description"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editFormData.discountType}
                    onChange={(e) => setEditFormData({ ...editFormData, discountType: e.target.value as "percentage" | "fixed" })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editFormData.discountValue}
                    onChange={(e) => setEditFormData({ ...editFormData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter discount value"
                  />
                  {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Discount Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.maxDiscountAmount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, maxDiscountAmount: parseFloat(e.target.value) || undefined })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter max discount amount"
                  />
                  {errors.maxDiscountAmount && <p className="mt-1 text-xs text-red-500">{errors.maxDiscountAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Order Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.minOrderAmount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter minimum order amount"
                  />
                  {errors.minOrderAmount && <p className="mt-1 text-xs text-red-500">{errors.minOrderAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={editFormData.startDate ? new Date(editFormData.startDate) : null}
                    onChange={(date: Date | null) => setEditFormData({ ...editFormData, startDate: date ? date.toISOString().split('T')[0] : "" })}
                    placeholderText="Select start date"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={editFormData.endDate ? new Date(editFormData.endDate) : null}
                    onChange={(date: Date | null) => setEditFormData({ ...editFormData, endDate: date ? date.toISOString().split('T')[0] : "" })}
                    placeholderText="Select end date"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.usageLimitPerUser}
                    onChange={(e) => setEditFormData({ ...editFormData, usageLimitPerUser: parseInt(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter usage limit per user"
                  />
                  {errors.usageLimitPerUser && <p className="mt-1 text-xs text-red-500">{errors.usageLimitPerUser}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Usage Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.totalUsageLimit || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, totalUsageLimit: parseInt(e.target.value) || undefined })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter total usage limit (0 for unlimited)"
                  />
                  {errors.totalUsageLimit && <p className="mt-1 text-xs text-red-500">{errors.totalUsageLimit}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicable For</label>
                  <select
                    value={editFormData.applicableFor}
                    onChange={(e) => setEditFormData({ ...editFormData, applicableFor: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="specific_users">Specific Users</option>
                    <option value="specific_categories">Specific Categories</option>
                    <option value="specific_subcategories">Specific Subcategories</option>
                    <option value="first_order">First Order</option>
                  </select>
                </div>
                {editFormData.applicableFor === "specific_users" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign Users</label>
                    <select
                      multiple
                      value={editFormData.assignedUsers}
                      onChange={(e) => setEditFormData({ ...editFormData, assignedUsers: Array.from(e.target.selectedOptions, option => option.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name} ({user.emailId})</option>
                      ))}
                    </select>
                    {errors.assignedUsers && <p className="mt-1 text-xs text-red-500">{errors.assignedUsers}</p>}
                  </div>
                )}
                {editFormData.applicableFor === "specific_categories" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicable Categories</label>
                    <select
                      multiple
                      value={editFormData.applicableCategories}
                      onChange={(e) => setEditFormData({ ...editFormData, applicableCategories: Array.from(e.target.selectedOptions, option => option.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.applicableCategories && <p className="mt-1 text-xs text-red-500">{errors.applicableCategories}</p>}
                  </div>
                )}
                {editFormData.applicableFor === "specific_subcategories" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicable Subcategories</label>
                    <select
                      multiple
                      value={editFormData.applicableSubcategories}
                      onChange={(e) => setEditFormData({ ...editFormData, applicableSubcategories: Array.from(e.target.selectedOptions, option => option.value) })}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {subcategories.map(subcategory => (
                        <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
                      ))}
                    </select>
                    {errors.applicableSubcategories && <p className="mt-1 text-xs text-red-500">{errors.applicableSubcategories}</p>}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
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
                  {formLoading ? "Updating..." : "Update Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Detail Modal */}
      {showModal && selectedCoupon && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coupon Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{selectedCoupon.couponName}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{selectedCoupon.couponCode}</div>
                    <div className="mt-1">{getStatusBadge(selectedCoupon.isActive)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCoupon.description || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Discount</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedCoupon.discountType === "percentage" ? `${selectedCoupon.discountValue}%` : `₹${selectedCoupon.discountValue}`}
                      {selectedCoupon.maxDiscountAmount && ` (Max: ₹${selectedCoupon.maxDiscountAmount})`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Minimum Order Amount</label>
                    <p className="text-sm text-gray-900 dark:text-white">₹{selectedCoupon.minOrderAmount || 0}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Validity</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedCoupon.startDate).toLocaleDateString("en-IN")} -{" "}
                      {new Date(selectedCoupon.endDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Usage</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedCoupon.actualUsageCount || 0}/{selectedCoupon.totalUsageLimit || "∞"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Usage Limit Per User</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCoupon.usageLimitPerUser}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Applicable For</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedCoupon.applicableFor === "all" ? "All Users" :
                       selectedCoupon.applicableFor === "specific_users" ? "Specific Users" :
                       selectedCoupon.applicableFor === "specific_categories" ? "Specific Categories" :
                       selectedCoupon.applicableFor === "specific_subcategories" ? "Specific Subcategories" : "First Order"}
                    </p>
                  </div>
                  {selectedCoupon.assignedUsers && selectedCoupon.assignedUsers.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Assigned Users</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedCoupon.assignedUsers.map(user => user.name).join(", ")}
                      </p>
                    </div>
                  )}
                  {selectedCoupon.applicableCategories && selectedCoupon.applicableCategories.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Applicable Categories</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedCoupon.applicableCategories.map(cat => cat.name).join(", ")}
                      </p>
                    </div>
                  )}
                  {selectedCoupon.applicableSubcategories && selectedCoupon.applicableSubcategories.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Applicable Subcategories</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedCoupon.applicableSubcategories.map(subcat => subcat.name).join(", ")}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Created By</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedCoupon.createdBy.name} ({selectedCoupon.createdBy.emailId})</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Created At</label>
                    <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedCoupon.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
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

      {/* Assign Users Modal */}
      {showAssignUsersModal && selectedCoupon && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Users to Coupon</h3>
              <button
                onClick={() => setShowAssignUsersModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAssignUsers} className="flex-1 overflow-y-auto p-6" id="assign-users-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Users</label>
                  <select
                    multiple
                    value={assignUsersForm}
                    onChange={(e) => setAssignUsersForm(Array.from(e.target.selectedOptions, option => option.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.name} ({user.emailId})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignUsersModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={formLoading || assignUsersForm.length === 0}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {formLoading ? "Assigning..." : "Assign Users"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageHistoryModal && selectedCoupon && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coupon Usage History</h3>
              <button
                onClick={() => setShowUsageHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {usageHistory.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">No usage history found.</div>
              ) : (
                <div className="space-y-4">
                  {usageHistory.map(usage => (
                    <div key={usage._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>User:</strong> {usage.userId.name} ({usage.userId.emailId})
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Order:</strong> {usage.orderId._id} (₹{usage.orderId.totalPrice})
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Discount:</strong> ₹{usage.discountAmount}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Status:</strong> {usage.status}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>Used At:</strong> {new Date(usage.usedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page <span className="font-semibold">{usageHistoryPage}</span> of{" "}
                <span className="font-semibold">{usageHistoryTotalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setUsageHistoryPage(prev => Math.max(1, prev - 1));
                    fetchUsageHistory(selectedCoupon._id);
                  }}
                  disabled={usageHistoryPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setUsageHistoryPage(prev => Math.min(usageHistoryTotalPages, prev + 1));
                    fetchUsageHistory(selectedCoupon._id);
                  }}
                  disabled={usageHistoryPage === usageHistoryTotalPages}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}