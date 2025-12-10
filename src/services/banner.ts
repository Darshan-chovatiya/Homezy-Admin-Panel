import Swal from 'sweetalert2';
import { IMAGE_BASE_URL } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Types & Interfaces
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface Banner {
  _id: string;
  image: string;
  link: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface CreateBannerData {
  link: string;
  image?: File;
}

export interface UpdateBannerData {
  bannerId: string;
  link?: string;
  image?: File;
  isActive?: boolean;
}

// Banner Service Class
class BannerService {
  token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

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

    // Get fresh token from localStorage for each request
    const currentToken = localStorage.getItem('authToken');

    const config: RequestInit = {
      method,
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

  // Resolve image URL
  resolveImageUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('blob:')) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${IMAGE_BASE_URL}${path}`;
    return `${IMAGE_BASE_URL}/${path}`;
  }

  // Create Banner
  async createBanner(bannerData: CreateBannerData): Promise<ApiResponse<Banner>> {
    const formData = new FormData();
    formData.append('link', bannerData.link);
    if (bannerData.image) {
      formData.append('image', bannerData.image);
    }
    return this.requestFormData('/banners/create', formData, true, true);
  }

  // Get All Banners
  async getAllBanners(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<Banner>>> {
    return this.request('/banners/list', params, 'POST', false, true);
  }

  // Get Banner by ID
  async getBannerById(bannerId: string): Promise<ApiResponse<Banner>> {
    return this.request(`/banners/get/${bannerId}`, {}, 'POST', false, true);
  }

  // Update Banner
  async updateBanner(updateData: UpdateBannerData): Promise<ApiResponse<Banner>> {
    // If image is provided, use FormData
    if (updateData.image) {
      const formData = new FormData();
      formData.append('bannerId', updateData.bannerId);
      if (updateData.link) {
        formData.append('link', updateData.link);
      }
      if (updateData.isActive !== undefined) {
        formData.append('isActive', String(updateData.isActive));
      }
      formData.append('image', updateData.image);
      return this.requestFormData('/banners/update', formData, true, true);
    }
    // Otherwise use JSON
    return this.request('/banners/update', updateData, 'POST', true, true);
  }

  // Delete Banner
  async deleteBanner(bannerId: string): Promise<ApiResponse> {
    return this.request('/banners/delete', { bannerId }, 'POST', true, true);
  }

  // Toggle Banner Status
  async toggleBannerStatus(bannerId: string, isActive: boolean): Promise<ApiResponse<Banner>> {
    return this.request('/banners/toggle', { bannerId, isActive }, 'POST', true, true);
  }
}

export const bannerService = new BannerService();
export default bannerService;

