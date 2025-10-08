const API_BASE_URL = 'http://localhost:5000/api/admin';
export const IMAGE_BASE_URL = 'http://localhost:5000';


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

export interface PaginatedResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
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

export interface Dispute {
  _id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  servicePartnerId: string;
  servicePartnerName: string;
  serviceId: string;
  serviceName: string;
  description: string;
  customerEvidence?: string[];
  servicePartnerEvidence?: string[];
  status: 'open' | 'closed' | 'inProgress' | 'reopen';
  resolution?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {

  customerId: string;
  servicePartnerId: string;
  serviceId: string;
  description: string;
}

export interface UpdateDisputeStatusRequest {
  status: 'open' | 'closed' | 'inProgress' | 'reopen';
  resolution?: string;
  refundAmount?: number;
}

export interface DisputeStats {
  openDisputes: number;
  inProgressDisputes: number;
  closedDisputes: number;
  reopenDisputes: number;
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

  private async requestForm<T>(endpoint: string, form: FormData): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const config: RequestInit = { method: 'POST', body: form, headers };
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  // Resolve relative paths from backend to absolute URLs
  resolveImageUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('blob:')) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${IMAGE_BASE_URL}${path}`;
    return `${IMAGE_BASE_URL}/${path}`;
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

  // Admin CRUD
  async getAdmins(params: PaginationParams): Promise<ApiResponse<PaginatedResult<Admin>>> {
    return this.request('/admins', {
      body: JSON.stringify(params)
    });
  }

  async createAdmin(admin: { name: string; emailId: string; password: string; isActive?: boolean }): Promise<ApiResponse<Admin>> {
    return this.request('/admins/create', {
      body: JSON.stringify(admin)
    });
  }

  async updateAdminBasic(payload: { id: string; name?: string; emailId?: string; isActive?: boolean }): Promise<ApiResponse<Admin>> {
    return this.request('/admins/update', {
      body: JSON.stringify(payload)
    });
  }

  async deleteAdmin(id: string): Promise<ApiResponse<boolean>> {
    return this.request('/admins/delete', {
      body: JSON.stringify({ id })
    });
  }

  async toggleAdminActive(id: string, isActive?: boolean): Promise<ApiResponse<Admin>> {
    return this.request('/admins/toggle', {
      body: JSON.stringify({ id, isActive })
    });
  }

  // Slots
  async getAvailableSlots(params: { subcategoryId: string; date: string }): Promise<ApiResponse<any>> {
    return this.request('/availableSlots', {
      body: JSON.stringify(params)
    });
  }

  async assignSlot(params: { slotId: string; subcategoryId: string; date: string }): Promise<ApiResponse<any>> {
    return this.request('/assignSlot', {
      body: JSON.stringify(params)
    });
  }

  async assignSlotByAdmin(params: { slotId: string; subcategoryId: string; date: string; vendorId: string }): Promise<ApiResponse<any>> {
    return this.request('/assignSlotByAdmin', {
      body: JSON.stringify(params)
    });
  }

  async updateSlotAvailability(params: { slotId: string; subcategoryId: string; date: string; isAvailable: boolean }): Promise<ApiResponse<any>> {
    return this.request('/updateSlotAvailability', {
      body: JSON.stringify(params)
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
    // If caller passed a File in image, use multipart
    const anyData = serviceData as any;
    if (anyData.image instanceof File) {
      const form = new FormData();
      form.append('name', serviceData.name);
      if (serviceData.description) form.append('description', serviceData.description);
      form.append('status', serviceData.status || 'active');
      form.append('image', anyData.image);
      if (serviceData.icon) form.append('icon', serviceData.icon);
      if (serviceData.displayOrder != null) form.append('displayOrder', String(serviceData.displayOrder));
      if (serviceData.popularServices) form.append('popularServices', JSON.stringify(serviceData.popularServices));
      return this.requestForm('/services/create', form);
    }
    return this.request('/services/create', { body: JSON.stringify(serviceData) });
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
    const anyData = serviceData as any;
    if (anyData.image instanceof File) {
      const form = new FormData();
      form.append('id', id);
      if (serviceData.name) form.append('name', serviceData.name);
      if (serviceData.description) form.append('description', serviceData.description);
      if (serviceData.status) form.append('status', serviceData.status);
      form.append('image', anyData.image);
      if (serviceData.icon) form.append('icon', serviceData.icon);
      if (serviceData.displayOrder != null) form.append('displayOrder', String(serviceData.displayOrder));
      if (serviceData.popularServices) form.append('popularServices', JSON.stringify(serviceData.popularServices));
      return this.requestForm('/services/update', form);
    }
    return this.request('/services/update', { body: JSON.stringify({ id, ...serviceData }) });
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
    const anyData = subcategoryData as any;
    const hasFile = anyData.image instanceof File || (Array.isArray(anyData.images) && anyData.images.some((f: any) => f instanceof File));
    if (hasFile) {
      const form = new FormData();
      form.append('serviceId', serviceId);
      form.append('name', subcategoryData.name);
      if (subcategoryData.description) form.append('description', subcategoryData.description);
      if (anyData.image instanceof File) form.append('image', anyData.image);
      if (Array.isArray(anyData.images)) anyData.images.forEach((f: any) => { if (f instanceof File) form.append('images', f); });
      if (subcategoryData.icon) form.append('icon', subcategoryData.icon);
      if (subcategoryData.price != null) form.append('price', String(subcategoryData.price));
      if (subcategoryData.priceType) form.append('priceType', subcategoryData.priceType);
      if (subcategoryData.duration != null) form.append('duration', String(subcategoryData.duration));
      if (subcategoryData.status) form.append('status', subcategoryData.status);
      if (subcategoryData.displayOrder != null) form.append('displayOrder', String(subcategoryData.displayOrder));
      if (subcategoryData.requirements) form.append('requirements', JSON.stringify(subcategoryData.requirements));
      if (subcategoryData.tags) form.append('tags', JSON.stringify(subcategoryData.tags));
      return this.requestForm('/subcategories/create', form);
    }
    return this.request('/subcategories/create', { body: JSON.stringify({ serviceId, ...subcategoryData }) });
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
    const anyData = subcategoryData as any;
    const hasFile = anyData.image instanceof File || (Array.isArray(anyData.images) && anyData.images.some((f: any) => f instanceof File));
    if (hasFile) {
      const form = new FormData();
      form.append('id', id);
      if (subcategoryData.name) form.append('name', subcategoryData.name);
      if (subcategoryData.description) form.append('description', subcategoryData.description);
      if (anyData.image instanceof File) form.append('image', anyData.image);
      if (Array.isArray(anyData.images)) anyData.images.forEach((f: any) => { if (f instanceof File) form.append('images', f); });
      // include existing images array (string paths) if provided
      if (Array.isArray(subcategoryData.images)) form.append('images', JSON.stringify(subcategoryData.images));
      if (subcategoryData.icon) form.append('icon', subcategoryData.icon);
      if (subcategoryData.price != null) form.append('price', String(subcategoryData.price));
      if (subcategoryData.basePrice != null) form.append('basePrice', String(subcategoryData.basePrice));
      if (subcategoryData.priceType) form.append('priceType', subcategoryData.priceType);
      if (subcategoryData.duration != null) form.append('duration', String(subcategoryData.duration));
      if (subcategoryData.status) form.append('status', subcategoryData.status);
      if (subcategoryData.displayOrder != null) form.append('displayOrder', String(subcategoryData.displayOrder));
      if (subcategoryData.requirements) form.append('requirements', JSON.stringify(subcategoryData.requirements));
      if (subcategoryData.tags) form.append('tags', JSON.stringify(subcategoryData.tags));
      return this.requestForm('/subcategories/update', form);
    }
    return this.request('/subcategories/update', { body: JSON.stringify({ id, ...subcategoryData }) });
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

  // Dispute Management
  async getAllDisputes(params?: {
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Dispute[]>> {
    return this.request('/disputes/list', {
      body: JSON.stringify(params || {}),
    });
  }

  async getDisputeById(id: string): Promise<ApiResponse<Dispute>> {
    return this.request('/disputes/get', {
      body: JSON.stringify({ id }),
    });
  }

  async createDispute(disputeData: CreateDisputeRequest): Promise<ApiResponse<Dispute>> {
    return this.request('/disputes/create', {
      body: JSON.stringify(disputeData),
    });
  }

  async updateDisputeStatus(
    id: string,
    statusData: UpdateDisputeStatusRequest
  ): Promise<ApiResponse<Dispute>> {
    return this.request('/disputes/updateStatus', {
      body: JSON.stringify({ id, ...statusData }),
    });
  }

  async deleteDispute(id: string): Promise<ApiResponse<void>> {
    return this.request('/disputes/delete', {
      body: JSON.stringify({ id }),
    });
  }

  async getDisputeStats(): Promise<ApiResponse<DisputeStats>> {
    return this.request('/disputes/stats', {
      body: JSON.stringify({}),
    });
  }

}

export const apiService = new ApiService();
export default apiService;

