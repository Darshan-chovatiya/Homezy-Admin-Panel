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
  businessDescription: string;
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

// Request Options Interface
interface RequestOptions {
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
  successMessage?: string;
  errorMessage?: string;
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
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      showSuccessAlert = false,
      showErrorAlert = true,
      successMessage,
      errorMessage
    } = options;

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
      const data = await response.json();
      
      if (!response.ok) {
        const errMsg = data.message || errorMessage || 'Request failed';
        if (showErrorAlert) {
          this.showErrorAlert(errMsg);
        }
        throw new Error(errMsg);
      }
      
      // Show success alert if enabled
      if (showSuccessAlert) {
        const msg = successMessage || data.message || 'Operation successful';
        this.showSuccessAlert(msg);
      }

      return data;
    } catch (error: any) {
      // Show error alert if not already shown
      if (showErrorAlert && error.message) {
        const errMsg = errorMessage || error.message || 'Something went wrong';
        this.showErrorAlert(errMsg);
      }
      throw error;
    }
  }

  // Create Vendor
  async createVendor(vendorData: CreateVendorData): Promise<ApiResponse<Vendor>> {
    return this.request('/vendor/createVendor', vendorData, 'POST', {
      showSuccessAlert: true,
      showErrorAlert: true,
      successMessage: 'Vendor created successfully!',
      errorMessage: 'Failed to create vendor'
    });
  }

  // Get All Vendors (No alerts for read operations by default)
  async getAllVendors(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    return this.request('/vendor/getAllVendors', params || {}, 'POST', {
      showSuccessAlert: false,
      showErrorAlert: true,
      errorMessage: 'Failed to fetch vendors'
    });
  }

  // Get Vendor by ID
  async getVendorById(vendorId: string): Promise<ApiResponse<Vendor>> {
    return this.request(`/vendor/getVendorById/${vendorId}`, {}, 'POST', {
      showSuccessAlert: false,
      showErrorAlert: true,
      errorMessage: 'Failed to fetch vendor details'
    });
  }

  // Update Vendor
  async updateVendor(updateData: UpdateVendorData): Promise<ApiResponse<Vendor>> {
    return this.request('/vendor/updateVendor', updateData, 'POST', {
      showSuccessAlert: true,
      showErrorAlert: true,
      successMessage: 'Vendor updated successfully!',
      errorMessage: 'Failed to update vendor'
    });
  }

  // Delete Vendor
  async deleteVendor(vendorId: string): Promise<ApiResponse> {
    return this.request('/vendor/deleteVendor', { vendorId }, 'POST', {
      showSuccessAlert: true,
      showErrorAlert: true,
      successMessage: 'Vendor deleted successfully!',
      errorMessage: 'Failed to delete vendor'
    });
  }
}

export const vendorService = new VendorService();
export default vendorService;