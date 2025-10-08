import Swal from 'sweetalert2';

const API_BASE_URL = 'https://homezy.itfuturz.in/api/admin';

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

export interface AddressComponent {
  pincode: string;
  houseBuildingNo: string;
  streetLocality: string;
  landmark: string;
  city: string;
  state: string;
  fullAddress: string;
}

export interface Preferences {
  notifications: boolean;
  smsAlerts: boolean;
  emailUpdates: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  mobileNo: string;
  emailId: string;
  userImage: string;
  isActive: boolean;
  deviceId: string;
  isVerified: boolean;
  gender: 'male' | 'female' | 'other' | '';
  fcm: string;
  isDeleted: boolean;
  latitude: number | null;
  longitude: number | null;
  otp: string;
  dateOfBirth: Date | null;
  referralCode: string;
  walletBalance: number;
  addressComponent: AddressComponent;
  preferences: Preferences;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  mobileNo: string;
  emailId?: string;
}

export interface UpdateCustomerData {
  customerId: string;
  name?: string;
  mobileNo?: string;
  emailId?: string;
  userImage?: string;
  isActive?: boolean;
  isVerified?: boolean;
  gender?: 'male' | 'female' | 'other';
  latitude?: number | null;
  longitude?: number | null;
  dateOfBirth?: Date | null;
  walletBalance?: number;
  addressComponent?: Partial<AddressComponent>;
  preferences?: Partial<Preferences>;
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

// Customer Service Class
class CustomerService {
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

  // Create Customer
  async createCustomer(customerData: CreateCustomerData): Promise<ApiResponse<Customer>> {
    return this.request('/customer/createCustomer', customerData, 'POST', true, true);
  }

  // Get All Customers
  async getAllCustomers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    return this.request('/customer/getAllCustomers', params || {}, 'POST', false, true);
  }

  // Get Customer by ID
  async getCustomerById(customerId: string): Promise<ApiResponse<Customer>> {
    return this.request(`/customer/getCustomerById/${customerId}`, {}, 'POST', false, true);
  }

  // Update Customer
  async updateCustomer(updateData: UpdateCustomerData): Promise<ApiResponse<Customer>> {
    return this.request('/customer/updateCustomer', updateData, 'POST', true, true);
  }

  // Delete Customer
  async deleteCustomer(customerId: string): Promise<ApiResponse> {
    return this.request('/customer/deleteCustomer', { customerId }, 'POST', true, true);
  }
}

export const customerService = new CustomerService();
export default customerService;
