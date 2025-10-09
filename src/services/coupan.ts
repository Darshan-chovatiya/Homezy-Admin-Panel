import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  discountType?: 'percentage' | 'fixed';
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface User {
  _id: string;
  name: string;
  emailId: string;
  mobileNo: string;
  isActive: boolean;
}

export interface Coupon {
  _id: string;
  couponCode: string;
  couponName: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  usageLimitPerUser: number;
  totalUsageLimit?: number;
  currentUsageCount: number;
  assignedUsers?: User[];
  createdBy: {
    _id: string;
    name: string;
    emailId: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  actualUsageCount?: number;
}

export interface CreateCouponFormData {
  couponCode?: string;
  couponName: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimitPerUser?: number;
  totalUsageLimit?: number;
  isActive?: boolean;
}

export interface UpdateCouponFormData {
  couponId: string;
  couponName?: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimitPerUser?: number;
  totalUsageLimit?: number;
  isActive?: boolean;
}

export interface CouponUsage {
  _id: string;
  couponId: {
    _id: string;
    couponCode: string;
    couponName: string;
  };
  userId: {
    _id: string;
    name: string;
    emailId: string;
    mobileNo: string;
  };
  orderId: {
    _id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
  };
  discountAmount: number;
  status: 'applied' | 'cancelled';
  usedAt: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  topCoupons: Array<{
    _id: string;
    usageCount: number;
    totalDiscount: number;
    couponDetails: Coupon;
  }>;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============================================
// COUPON SERVICE CLASS
// ============================================

class CouponService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  private showSuccessAlert(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonColor: '#3b82f6',
      timer: 3000,
      timerProgressBar: true,
    });
  }

  private showErrorAlert(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      confirmButtonColor: '#ef4444',
    });
  }

  private async request<T>(
    endpoint: string,
    body: any = {},
    method: string = 'POST',
    showSuccessAlert: boolean = false,
    showErrorAlert: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        if (showErrorAlert && data.message) {
          this.showErrorAlert(data.message);
        }
        throw new Error(data.message);
      }

      if (showSuccessAlert && data.message) {
        this.showSuccessAlert(data.message);
      }

      return data;
    } catch (error: any) {
      if (showErrorAlert && error.message) {
        this.showErrorAlert(error.message);
      }
      throw error;
    }
  }

  // ============================================
  // COUPON APIs
  // ============================================

  async createCoupon(couponData: CreateCouponFormData): Promise<ApiResponse<Coupon>> {
    return this.request<Coupon>('/coupons/create', couponData, 'POST', true, true);
  }

  async getAllCoupons(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Coupon>>> {
    return this.request<PaginatedResponse<Coupon>>('/coupons/list', params || {}, 'POST', false, true);
  }

  async getCouponById(couponId: string): Promise<ApiResponse<Coupon>> {
    return this.request<Coupon>('/coupons/get', { couponId }, 'POST', false, true);
  }

  async updateCoupon(updateData: UpdateCouponFormData): Promise<ApiResponse<Coupon>> {
    return this.request<Coupon>('/coupons/update', updateData, 'POST', true, true);
  }

  async deleteCoupon(couponId: string): Promise<ApiResponse> {
    return this.request('/coupons/delete', { couponId }, 'POST', true, true);
  }

  async assignCouponToUsers(couponId: string, userIds: string[]): Promise<ApiResponse<Coupon>> {
    return this.request<Coupon>('/coupons/assign', { couponId, userIds }, 'POST', true, true);
  }

  async getCouponUsageHistory(couponId: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<CouponUsage>>> {
    return this.request<PaginatedResponse<CouponUsage>>('/coupons/usage-history', { couponId, ...params }, 'POST', false, true);
  }

  async getCouponStats(): Promise<ApiResponse<CouponStats>> {
    return this.request<CouponStats>('/coupons/stats', {}, 'POST', false, true);
  }

  // ============================================
  // USER APIs
  // ============================================

  async getAllUsers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.request<PaginatedResponse<User>>('/users/list', params || {}, 'POST', false, true);
  }
}

export const couponService = new CouponService();
export default couponService;