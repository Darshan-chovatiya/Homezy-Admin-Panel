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

// Customer Service Class
class CustomerService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    body: any = {},
    method: string = 'POST'
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Create Customer
  async createCustomer(customerData: CreateCustomerData): Promise<ApiResponse<Customer>> {
    return this.request('/customer/createCustomer', customerData);
  }

  // Get All Customers
  async getAllCustomers(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    return this.request('/customer/getAllCustomers', params || {});
  }

  // Get Customer by ID
  async getCustomerById(customerId: string): Promise<ApiResponse<Customer>> {
    return this.request(`/customer/getCustomerById/${customerId}`, {});
  }

  // Update Customer
  async updateCustomer(updateData: UpdateCustomerData): Promise<ApiResponse<Customer>> {
    return this.request('/customer/updateCustomer', updateData);
  }

  // Delete Customer
  async deleteCustomer(customerId: string): Promise<ApiResponse> {
    return this.request('/customer/deleteCustomer', { customerId });
  }
}

export const customerService = new CustomerService();
export default customerService;