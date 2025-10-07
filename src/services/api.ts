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

export interface Subcategory {
  _id: string;
  name: string;
  description: string;
  image?: string;
  images?: string[];
  icon?: string;
  basePrice: number;
  priceType: 'fixed' | 'hourly' | 'sqft';
  duration: number; // in minutes
  isActive: boolean;
  displayOrder: number;
  requirements: string[];
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  popularServices: string[];
  createdAt: string;
  updatedAt: string;
  subCategories?: Subcategory[];
}

export interface ServiceWithSubcategories extends Service {
  subCategories: Subcategory[];
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

  // Service Management
  async getServices(params?: PaginationParams): Promise<ApiResponse<{ docs: Service[]; totalDocs: number; limit: number; page: number; totalPages: number }>> {
    return this.request('/services/list', {
      body: JSON.stringify({
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
      })
    });
  }

  async getService(id: string): Promise<ApiResponse<ServiceWithSubcategories>> {
    return this.request('/services/get', {
      body: JSON.stringify({ id })
    });
  }

  async createService(serviceData: {
    name: string;
    description?: string;
    image?: string;
    icon?: string;
    status?: 'active' | 'inactive';
    displayOrder?: number;
    popularServices?: string[];
    subCategories?: Array<{
      name: string;
      description?: string;
      image?: string;
      images?: string[];
      icon?: string;
      price?: number;
      priceType?: 'fixed' | 'hourly' | 'sqft';
      duration?: number;
      status?: 'active' | 'inactive';
      displayOrder?: number;
      requirements?: string[];
      tags?: string[];
    }>;
  }): Promise<ApiResponse<Service>> {
    return this.request('/services/create', {
      body: JSON.stringify(serviceData)
    });
  }

  async updateService(id: string, serviceData: {
    name?: string;
    description?: string;
    image?: string;
    icon?: string;
    status?: 'active' | 'inactive';
    displayOrder?: number;
    popularServices?: string[];
  }): Promise<ApiResponse<Service>> {
    return this.request('/services/update', {
      body: JSON.stringify({ id, ...serviceData })
    });
  }

  async deleteService(id: string): Promise<ApiResponse<boolean>> {
    return this.request('/services/delete', {
      body: JSON.stringify({ id })
    });
  }

  async updateServiceStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Service>> {
    return this.request('/services/status', {
      body: JSON.stringify({ id, status })
    });
  }

  // Subcategory Management
  async createSubcategory(serviceId: string, subcategoryData: {
    name: string;
    description?: string;
    image?: string;
    images?: string[];
    icon?: string;
    price?: number;
    priceType?: 'fixed' | 'hourly' | 'sqft';
    duration?: number;
    status?: 'active' | 'inactive';
    displayOrder?: number;
    requirements?: string[];
    tags?: string[];
  }): Promise<ApiResponse<Subcategory>> {
    return this.request('/subcategories/create', {
      body: JSON.stringify({ serviceId, ...subcategoryData })
    });
  }

  async updateSubcategory(id: string, subcategoryData: {
    name?: string;
    description?: string;
    image?: string;
    images?: string[];
    icon?: string;
    price?: number;
    basePrice?: number;
    priceType?: 'fixed' | 'hourly' | 'sqft';
    duration?: number;
    status?: 'active' | 'inactive';
    displayOrder?: number;
    requirements?: string[];
    tags?: string[];
  }): Promise<ApiResponse<Subcategory>> {
    return this.request('/subcategories/update', {
      body: JSON.stringify({ id, ...subcategoryData })
    });
  }

  async deleteSubcategory(id: string): Promise<ApiResponse<boolean>> {
    return this.request('/subcategories/delete', {
      body: JSON.stringify({ id })
    });
  }

  async updateSubcategoryStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Subcategory>> {
    return this.request('/subcategories/status', {
      body: JSON.stringify({ id, status })
    });
  }

}

export const apiService = new ApiService();
export default apiService;

