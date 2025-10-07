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

// Request Options Interface
interface RequestOptions {
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

// Customer Service Class
class CustomerService {
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

  // Create Customer
  async createCustomer(customerData: CreateCustomerData): Promise<ApiResponse<Customer>> {
    return this.request('/customer/createCustomer', customerData, 'POST', {
      showSuccessAlert: true,
      showErrorAlert: true,
      successMessage: 'Customer created successfully!',
      errorMessage: 'Failed to create customer'
    });
  }

  // Get All Customers (No alerts for read operations by default)
  async getAllCustomers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    return this.request('/customer/getAllCustomers', params || {}, 'POST', {
      showSuccessAlert: false,
      showErrorAlert: true,
      errorMessage: 'Failed to fetch customers'
    });
  }

  // Get Customer by ID
  async getCustomerById(customerId: string): Promise<ApiResponse<Customer>> {
    return this.request(`/customer/getCustomerById/${customerId}`, {}, 'POST', {
      showSuccessAlert: false,
      showErrorAlert: true,
      errorMessage: 'Failed to fetch customer details'
    });
  }

  // Update Customer
  async updateCustomer(updateData: UpdateCustomerData): Promise<ApiResponse<Customer>> {
    return this.request('/customer/updateCustomer', updateData, 'POST', {
      showSuccessAlert: true,
      showErrorAlert: true,
      successMessage: 'Customer updated successfully!',
      errorMessage: 'Failed to update customer'
    });
  }

  // Delete Customer
  async deleteCustomer(customerId: string): Promise<ApiResponse> {
    return this.request('/customer/deleteCustomer', { customerId }, 'POST', {
      showSuccessAlert: true,
      showErrorAlert: true,
      successMessage: 'Customer deleted successfully!',
      errorMessage: 'Failed to delete customer'
    });
  }
}

export const customerService = new CustomerService();
export default customerService;