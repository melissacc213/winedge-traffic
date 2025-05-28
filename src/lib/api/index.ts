import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

// Create axios clients
const createClient = (baseURL: string, useAuth = true) => {
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor for auth if required
  if (useAuth) {
    client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Add response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle auth errors
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        // Redirect to login page if needed
        // window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// API clients
export const clients = {
  v1: {
    public: createClient(`${API_URL}/v1`, false),
    private: createClient(`${API_URL}/v1`),
  },
};

// Default API client export for convenience
export const api = clients.v1.private;

// Generic API error handler
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function handleApiError(error: any): never {
  if (axios.isAxiosError(error) && error.response) {
    throw new ApiError(
      error.response.data?.message || 'API request failed',
      error.response.status,
      error.response.data
    );
  }
  throw error;
}