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
}

export interface User {
  _id: string;
  name: string;
  emailId: string;
  mobileNo: string;
  isActive: boolean;
}

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  isActive: boolean;
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
  private token: string | null = null;

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

    const config: RequestInit = {
      method,
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