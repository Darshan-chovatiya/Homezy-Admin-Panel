import Swal from 'sweetalert2';

const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL as string;

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
  isActive?: boolean;
  isApproved?: boolean;
  city?: string;
  category?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
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
    category: any;
    subcategory: any;
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
    verificationStatus?: string;
    rejectionReason?: string;
  };
  weeklySlots?: {
    [key: string]: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
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

export interface CreateVendorFormData {
  // Personal Info
  name: string;
  email: string;
  phone: string;
  image?: File;

  // Business Details
  businessName: string;
  businessDescription: string;
  businessLogo?: File;
  businessBanner?: File;

  // Professional Info
  professionalInfo: {
    experience: number;
    skills: string[];
    certifications?: Array<{
      name: string;
      issuingAuthority: string;
      year: number;
      certificateImage: string;
    }>;
    bio: string;
  };

  // Services
  services: Array<{
    category: string;
    subcategory: string;
    basePrice: number;
    priceType: 'fixed' | 'hourly' | 'sqft';
    description: string;
    duration: number;
    isActive: boolean;
  }>;

  // Business Address
  businessAddress: {
    address: string;
    pincode: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };

  // Verification
  verification: {
    aadhaarNumber: string;
    aadhaarFront?: File;
    aadhaarBack?: File;
    panNumber: string;
    panImage?: File;
    policeVerification?: File;
  };

  // Bank Details
  bankDetails: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
  };

  // Availability
  availability: {
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };

  isActive?: boolean;
  isApproved?: boolean;
}

export interface UpdateVendorFormData {
  vendorId: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: File;
  businessName?: string;
  businessDescription?: string;
  businessLogo?: File;
  businessBanner?: File;
  professionalInfo: {
    experience?: number;
    skills: string[];
    certifications?: Array<{
      name: string;
      issuingAuthority: string;
      year: number;
      certificateImage: string;
    }>;
    bio?: string;
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
    address?: string;
    pincode?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  verification?: {
    isVerified?: boolean;
    aadhaarNumber?: string;
    aadhaarFront?: File;
    aadhaarBack?: File;
    panNumber?: string;
    panImage?: File;
    policeVerification?: File;
  };
  bankDetails?: {
    accountNumber?: string;
    accountHolderName?: string;
    ifscCode?: string;
    bankName?: string;
  };
  availability: {
    isOnline?: boolean;
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
  overallRating?: number;
  totalRatings?: number;
  completedJobs?: number;
  responseRate?: number;
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

// ============================================
// VENDOR SERVICE CLASS
// ============================================

class VendorService {
  // private token: string | null = null;

  constructor() {
    // this.token = localStorage.getItem('authToken');
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

  // Generic Request Method for JSON
  private async request<T>(
    endpoint: string,
    body: any = {},
    method: string = 'POST',
    showSuccessAlert: boolean = false,
    showErrorAlert: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get fresh token from localStorage for each request
    const currentToken = localStorage.getItem('authToken');

    const config: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
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

  // Generic Request Method for FormData (File Upload)
  private async requestFormData<T>(
    endpoint: string,
    formData: FormData,
    showSuccessAlert: boolean = false,
    showErrorAlert: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get fresh token from localStorage for each request
    const currentToken = localStorage.getItem('authToken');

    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        // Don't set Content-Type for FormData - browser will set it automatically with boundary
      },
      body: formData,
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

  // Helper: Convert CreateVendorFormData to FormData
  private createVendorFormData(vendorData: CreateVendorFormData): FormData {
    const formData = new FormData();

    // Personal Info
    formData.append('name', vendorData.name);
    formData.append('email', vendorData.email);
    formData.append('phone', vendorData.phone);
    if (vendorData.image) formData.append('image', vendorData.image);

    // Business Details
    formData.append('businessName', vendorData.businessName);
    formData.append('businessDescription', vendorData.businessDescription);
    if (vendorData.businessLogo) formData.append('businessLogo', vendorData.businessLogo);
    if (vendorData.businessBanner) formData.append('businessBanner', vendorData.businessBanner);

    // Professional Info (JSON string)
    formData.append('professionalInfo', JSON.stringify(vendorData.professionalInfo));

    // Services (JSON string)
    formData.append('services', JSON.stringify(vendorData.services));

    // Business Address (JSON string)
    formData.append('businessAddress', JSON.stringify(vendorData.businessAddress));

    // Verification Documents
    const verification: any = {
      aadhaarNumber: vendorData.verification.aadhaarNumber,
      panNumber: vendorData.verification.panNumber,
    };
    formData.append('verification', JSON.stringify(verification));

    if (vendorData.verification.aadhaarFront) {
      formData.append('aadhaarFront', vendorData.verification.aadhaarFront);
    }
    if (vendorData.verification.aadhaarBack) {
      formData.append('aadhaarBack', vendorData.verification.aadhaarBack);
    }
    if (vendorData.verification.panImage) {
      formData.append('panImage', vendorData.verification.panImage);
    }
    if (vendorData.verification.policeVerification) {
      formData.append('policeVerification', vendorData.verification.policeVerification);
    }

    // Bank Details (JSON string)
    formData.append('bankDetails', JSON.stringify(vendorData.bankDetails));

    // Availability (JSON string)
    if (vendorData.availability) {
      formData.append('availability', JSON.stringify(vendorData.availability));
    }

    // Status
    if (vendorData.isActive !== undefined) {
      formData.append('isActive', String(vendorData.isActive));
    }
    if (vendorData.isApproved !== undefined) {
      formData.append('isApproved', String(vendorData.isApproved));
    }

    return formData;
  }

  // Helper: Convert UpdateVendorFormData to FormData
  private updateVendorFormData(updateData: UpdateVendorFormData): FormData {
    const formData = new FormData();

    formData.append('vendorId', updateData.vendorId);

    // Personal Info
    if (updateData.name) formData.append('name', updateData.name);
    if (updateData.email) formData.append('email', updateData.email);
    if (updateData.phone) formData.append('phone', updateData.phone);
    if (updateData.image) formData.append('image', updateData.image);

    // Business Details
    if (updateData.businessName) formData.append('businessName', updateData.businessName);
    if (updateData.businessDescription) formData.append('businessDescription', updateData.businessDescription);
    if (updateData.businessLogo) formData.append('businessLogo', updateData.businessLogo);
    if (updateData.businessBanner) formData.append('businessBanner', updateData.businessBanner);

    // Professional Info
    if (updateData.professionalInfo) {
      formData.append('professionalInfo', JSON.stringify(updateData.professionalInfo));
    }

    // Services
    if (updateData.services) {
      formData.append('services', JSON.stringify(updateData.services));
    }

    // Business Address
    if (updateData.businessAddress) {
      formData.append('businessAddress', JSON.stringify(updateData.businessAddress));
    }

    // Verification
    if (updateData.verification) {
      const verificationData: any = {};
      if (updateData.verification.isVerified !== undefined) {
        verificationData.isVerified = updateData.verification.isVerified;
      }
      if (updateData.verification.aadhaarNumber) {
        verificationData.aadhaarNumber = updateData.verification.aadhaarNumber;
      }
      if (updateData.verification.panNumber) {
        verificationData.panNumber = updateData.verification.panNumber;
      }

      if (Object.keys(verificationData).length > 0) {
        formData.append('verification', JSON.stringify(verificationData));
      }

      if (updateData.verification.aadhaarFront) {
        formData.append('aadhaarFront', updateData.verification.aadhaarFront);
      }
      if (updateData.verification.aadhaarBack) {
        formData.append('aadhaarBack', updateData.verification.aadhaarBack);
      }
      if (updateData.verification.panImage) {
        formData.append('panImage', updateData.verification.panImage);
      }
      if (updateData.verification.policeVerification) {
        formData.append('policeVerification', updateData.verification.policeVerification);
      }
    }

    // Bank Details
    if (updateData.bankDetails) {
      formData.append('bankDetails', JSON.stringify(updateData.bankDetails));
    }

    // Availability
    if (updateData.availability) {
      formData.append('availability', JSON.stringify(updateData.availability));
    }

    // Performance Metrics
    if (updateData.overallRating !== undefined) {
      formData.append('overallRating', String(updateData.overallRating));
    }
    if (updateData.totalRatings !== undefined) {
      formData.append('totalRatings', String(updateData.totalRatings));
    }
    if (updateData.completedJobs !== undefined) {
      formData.append('completedJobs', String(updateData.completedJobs));
    }
    if (updateData.responseRate !== undefined) {
      formData.append('responseRate', String(updateData.responseRate));
    }

    // Status
    if (updateData.isActive !== undefined) {
      formData.append('isActive', String(updateData.isActive));
    }
    if (updateData.isApproved !== undefined) {
      formData.append('isApproved', String(updateData.isApproved));
    }

    return formData;
  }

  // ============================================
  // VENDOR APIs
  // ============================================

  /**
   * Create Vendor with File Upload
   */
  async createVendor(vendorData: CreateVendorFormData): Promise<ApiResponse<Vendor>> {
    const formData = this.createVendorFormData(vendorData);
    return this.requestFormData<Vendor>('/vendor/createVendor', formData, true, true);
  }

  /**
   * Get All Vendors with Pagination & Filters
   */
  async getAllVendors(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    return this.request<PaginatedResponse<Vendor>>('/vendor/getAllVendors', params || {}, 'POST', false, true);
  }

  /**
   * Get Vendor by ID
   */
  async getVendorById(vendorId: string): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>(`/vendor/getVendorById/${vendorId}`, {}, 'POST', false, true);
  }

  /**
   * Update Vendor with File Upload
   */
  async updateVendor(updateData: any): Promise<ApiResponse<Vendor>> {
    const formData = this.updateVendorFormData(updateData);
    return this.requestFormData<Vendor>('/vendor/updateVendor', formData, true, true);
  }

  /**
   * Delete Vendor (Soft Delete)
   */
  async deleteVendor(vendorId: string): Promise<ApiResponse> {
    return this.request('/vendor/deleteVendor', { vendorId }, 'POST', true, true);
  }

  /**
   * Approve/Reject Vendor
   */
  async approveVendor(vendorId: string, isApproved: boolean): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>('/vendor/approveVendor', { vendorId, isApproved }, 'POST', true, true);
  }

  /**
   * Update Vendor Verification Status
   */
  async updateVerification(vendorId: string, isVerified: boolean): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>('/vendor/updateVerification', { vendorId, isVerified }, 'POST', true, true);
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const vendorService = new VendorService();
export default vendorService;