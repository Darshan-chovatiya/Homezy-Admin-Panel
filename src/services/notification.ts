import Swal from 'sweetalert2';

const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL as string;

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
}

export interface User {
  _id: string;
  name: string;
  emailId: string;
  mobileNo: string;
  isActive: boolean;
  userImage?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  isActive: boolean;
  userImage?: string;
}

export interface NotificationData {
  title: string;
  message: string;
  recipientType: 'users' | 'vendors' | 'specific_users' | 'specific_vendors';
  specificUsers?: string[];
  specificVendors?: string[];
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

class NotificationService {
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

  // Get Users or Vendors
  async getUsersOrVendors(type: 'users' | 'vendors', params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<User | Vendor>>> {
    return this.request(`/getUsersOrVendors`, { type, ...params }, 'POST', false, true);
  }

  // Send Notification
  async sendNotification(notificationData: NotificationData): Promise<ApiResponse<any>> {
    return this.request('/notifications/create', notificationData, 'POST', true, true);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
