import { loginResponseSchema } from './validator/auth';
import type { LoginPayload } from './validator/auth';
import axios, { type AxiosRequestConfig } from 'axios';
import { selfSchema } from './validator/user';
import { modelService } from './api/model-service';
import { USE_MOCK_API, MOCK_USER, MOCK_CREDENTIALS } from './config/mock-config';

export function createPrivateClient() {
  const client = axios.create();

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('winedge-auth-token');

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  });

  return client;
}

export const clients = {
  v1: {
    public: axios.create({
      baseURL: '/api/v1',
    }),
    private: (() => {
      const client = createPrivateClient();
      client.defaults.baseURL = '/api/v1';
      return client;
    })(),
  },
};

export const authService = {
  async login(body: LoginPayload, config?: AxiosRequestConfig<unknown>) {
    if (USE_MOCK_API) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if credentials match any mock credentials
      const validCredentials = MOCK_CREDENTIALS.find(
        cred => cred.email === body.email && cred.password === body.password
      );
      
      if (!validCredentials) {
        throw new axios.AxiosError('Invalid email or password', 'ERR_BAD_REQUEST', undefined, undefined, {
          data: { message: 'Invalid email or password' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: config as any,
        } as any);
      }
      
      // Generate mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      return loginResponseSchema.parse({ token });
    }
    
    const { data } = await clients.v1.public.post('/auth/login', body, config);
    return loginResponseSchema.parse(data);
  },
  async logout(config?: AxiosRequestConfig<unknown>) {
    if (USE_MOCK_API) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    
    await clients.v1.private.post('/auth/logout', undefined, config);
    return;
  },
};

export const userService = {
  async getSelf(config?: AxiosRequestConfig<unknown>) {
    if (USE_MOCK_API) {
      // Check if user is authenticated (has token)
      const token = localStorage.getItem('winedge-auth-token');
      if (!token) {
        throw new axios.AxiosError('Unauthorized', 'ERR_UNAUTHORIZED', undefined, undefined, {
          data: { message: 'Unauthorized' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: config as any,
        } as any);
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return selfSchema.parse(MOCK_USER);
    }
    
    const { data } = await clients.v1.private.get('/users/self', config);
    return selfSchema.parse(data);
  },
};

// Export the model service from the module
export { modelService } from './api/model-service';
export { settingsService } from './api/settings-service';