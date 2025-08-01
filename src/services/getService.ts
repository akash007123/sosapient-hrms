// API service for making HTTP requests to the backend
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

class GetService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('hrms_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // GET request
  async getCall(endpoint: string, params?: Record<string, any>): Promise<ApiResponse> {
    try {
      const url = new URL(`${API_BASE_URL}/${endpoint}`);
      
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  // POST request
  async addCall(endpoint: string, action: string, formData: FormData): Promise<ApiResponse> {
    try {
      // Add action to form data
      formData.append('action', action);

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          ...(this.getAuthHeaders() as any),
          // Remove Content-Type for FormData
          'Content-Type': undefined,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  // PUT request
  async updateCall(endpoint: string, id: string | number, formData: FormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          ...(this.getAuthHeaders() as any),
          'Content-Type': undefined,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  // DELETE request
  async deleteCall(endpoint: string, action: string, id: string | number): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('action', action);

      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          ...(this.getAuthHeaders() as any),
          'Content-Type': undefined,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  // PATCH request for status updates
  async patchCall(endpoint: string, id: string | number, data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  }
}

export const getService = new GetService(); 