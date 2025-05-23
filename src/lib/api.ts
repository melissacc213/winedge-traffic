import { loginResponseSchema } from './validator/auth';
import type { LoginPayload } from './validator/auth';
import axios, { type AxiosRequestConfig } from 'axios';
import { selfSchema } from './validator/user';
import { modelService } from './api/model-service';

export function createPrivateClient() {
  const client = axios.create();

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

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
    const { data } = await clients.v1.public.post('/auth/login', body, config);
    return loginResponseSchema.parse(data);
  },
  async logout(config?: AxiosRequestConfig<unknown>) {
    await clients.v1.private.post('/auth/logout', undefined, config);
    return localStorage.getItem('token');
  },
};

export const userService = {
  async getSelf(config?: AxiosRequestConfig<unknown>) {
    const { data } = await clients.v1.private.get('/users/self', config);
    return selfSchema.parse(data);
  },
};

// Export the model service from the module
export { modelService } from './api/model-service';