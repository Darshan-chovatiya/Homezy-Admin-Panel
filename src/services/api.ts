const API_BASE_URL = 'http://localhost:5000/api/admin';


// Types
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Admin {
  _id?: string;
  name?: string;
  emailId?: string;
  email?: string; // optional convenience for frontend forms
  role?: 'admin' | 'super_admin';
  profileImage?: string;
  lastLogin?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


// API Service Class
class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
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

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<string>> {
  const response = await this.request<string>('/signin', {
    body: JSON.stringify({ emailId: email, password }),
  });

  if (response.data) {
    this.token = String(response.data);
    localStorage.setItem('authToken', this.token);
  }

  return response;
}


  async register(adminData: Partial<Admin> & { password: string }): Promise<ApiResponse<Admin>> {
    const payload = {
      name: adminData.name,
      emailId: adminData.emailId || adminData.email,
      password: adminData.password,
    };
    return this.request<Admin>('/createAdmin', {
      body: JSON.stringify(payload),
    });
  }

  async logout(): Promise<ApiResponse> {
    // Backend does not have logout route; clear locally for now
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return { status: 200, message: 'Logged out', data: null } as unknown as ApiResponse;
  }

// Profile
async getProfile(id?: string): Promise<ApiResponse<{ admin: Admin }>> {
    // Not implemented on backend yet; placeholder for future use
    throw new Error('getProfile not implemented on backend');
  }

  async updateProfile(profileData: { name?: string; email?: string; id?: string }): Promise<ApiResponse<{ admin: Admin }>> {
    // Not implemented on backend yet; placeholder for future use
    throw new Error('updateProfile not implemented on backend');
  }

}

export const apiService = new ApiService();
export default apiService;

