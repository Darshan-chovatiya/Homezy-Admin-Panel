import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// Types & Interfaces
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  otp?: string;
  businessName: string;
  businessDescription?: string;
  businessLogo?: string;
  businessBanner?: string;
  professionalInfo?: {
    experience: number;
    skills: string[];
    certifications: Array<{
      name: string;
      issuingAuthority: string;
      year: number;
      certificateImage: string;
    }>;
    bio: string;
  };
  services?: Array<{
    category: string;
    subcategory: string;
    basePrice: number;
    priceType: 'fixed' | 'hourly' | 'sqft';
    description: string;
    duration: number;
    isActive: boolean;
  }>;
  businessAddress?: {
    address: string;
    pincode: string;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
  };
  verification?: {
    isVerified: boolean;
    aadhaarNumber: string;
    aadhaarFront: string;
    aadhaarBack: string;
    panNumber: string;
    panImage: string;
    policeVerification: string;
    verifiedAt: Date | null;
  };
  overallRating: number;
  totalRatings: number;
  completedJobs: number;
  responseRate: number;
  availability?: {
    isOnline: boolean;
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
  bankDetails?: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
  };
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessDescription?: string;
}

export interface UpdateVendorData {
  vendorId: string;
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  businessDescription?: string;
  businessLogo?: string;
  businessBanner?: string;
  isActive?: boolean;
  isApproved?: boolean;
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

// Vendor Service Class
class VendorService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Success Alert Helper
  private showSuccessAlert(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonColor: '#3b82f6',
      timer: 3000,
      timerProgressBar: true
    });
  }

  // Error Alert Helper
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

      // Handle error
      if (!response.ok) {
        if (showErrorAlert && data.message) {
          this.showErrorAlert(data.message);
        }
        throw new Error(data.message);
      }

      // Handle success
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

  // Create Vendor
  async createVendor(vendorData: CreateVendorData): Promise<ApiResponse<Vendor>> {
    return this.request('/vendor/createVendor', vendorData, 'POST', true, true);
  }

  // Get All Vendors
  async getAllVendors(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    return this.request('/vendor/getAllVendors', params || {}, 'POST', false, true);
  }

  // Get Vendor by ID
  async getVendorById(vendorId: string): Promise<ApiResponse<Vendor>> {
    return this.request(`/vendor/getVendorById/${vendorId}`, {}, 'POST', false, true);
  }

  // Update Vendor
  async updateVendor(updateData: UpdateVendorData): Promise<ApiResponse<Vendor>> {
    return this.request('/vendor/updateVendor', updateData, 'POST', true, true);
  }

  // Delete Vendor
  async deleteVendor(vendorId: string): Promise<ApiResponse> {
    return this.request('/vendor/deleteVendor', { vendorId }, 'POST', true, true);
  }
}

export const vendorService = new VendorService();
export default vendorService;
