import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// Types & Interfaces
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  type: 'user' | 'vendor';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQData {
  question: string;
  answer: string;
  type: 'user' | 'vendor';
}

export interface UpdateFAQData {
  faqId: string;
  question?: string;
  answer?: string;
  type?: 'user' | 'vendor';
  isActive?: boolean;
}

// FAQ Service Class
class FAQService {
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

  // Create FAQ
  async createFAQ(faqData: CreateFAQData): Promise<ApiResponse<FAQ>> {
    return this.request('/faqs/create', faqData, 'POST', true, true);
  }

  // Get All FAQs
  async getAllFAQs(): Promise<ApiResponse<FAQ[]>> {
    return this.request('/faqs/list', {}, 'POST', false, true);
  }

  // Get FAQ by ID
  async getFAQById(faqId: string): Promise<ApiResponse<FAQ>> {
    return this.request('/faqs/get', { faqId }, 'POST', false, true);
  }

  // Update FAQ
  async updateFAQ(updateData: UpdateFAQData): Promise<ApiResponse<FAQ>> {
    return this.request('/faqs/update', updateData, 'POST', true, true);
  }

  // Delete FAQ
  async deleteFAQ(faqId: string): Promise<ApiResponse> {
    return this.request('/faqs/delete', { faqId }, 'POST', true, true);
  }
}

export const faqService = new FAQService();
export default faqService;
