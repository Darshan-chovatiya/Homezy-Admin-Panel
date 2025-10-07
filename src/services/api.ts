const API_BASE_URL = 'http://localhost:3200/api/admin';

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
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  profileImage?: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; admin: Admin }>> {
  const response = await this.request('/login', {
    body: JSON.stringify({ email, password }),
  }) as ApiResponse<{ token: string; admin: Admin }>; // ✅ assert type

  if (response.data.token) {
    this.token = response.data.token;
    localStorage.setItem('authToken', this.token);
    localStorage.setItem('user', JSON.stringify(response.data.admin));
  }

  return response;
}


  async register(adminData: Partial<Admin> & { password: string }): Promise<ApiResponse<{ admin: Admin }>> {
    return this.request('/register', {
      body: JSON.stringify(adminData),
    });
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/logout');
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return response;
  }

// Profile
async getProfile(id?: string): Promise<ApiResponse<{ admin: Admin }>> {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(id ? { id } : {})
    });
  }

  async updateProfile(profileData: { name?: string; email?: string; id?: string }): Promise<ApiResponse<{ admin: Admin }>> {
    return this.request('/profile/update', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

}

export const apiService = new ApiService();
export default apiService;

