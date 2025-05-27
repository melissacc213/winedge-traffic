import { clients } from './index';
import type { 
  CreateUserRequest, 
  UpdateUserRequest, 
  User, 
  UsersList 
} from '../validator/user';
import { 
  createUserSchema, 
  updateUserSchema, 
  userSchema, 
  usersListSchema 
} from '../validator/user';
import { getMockUsers, getMockUser, createMockUser, updateMockUser } from '../../mocks/data/users';

const api = clients.v1.private;
const USE_MOCK_DATA = true; // Toggle this to switch between mock and real API

export const userService = {
  // Create a new user
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const validatedData = createUserSchema.parse(data);
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return createMockUser(validatedData);
    }
    const response = await api.post('/user', validatedData);
    return userSchema.parse(response.data);
  },

  // Get all users with pagination
  getUsers: async (params?: { page?: number; size?: number }): Promise<UsersList> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return getMockUsers(params?.page || 1, params?.size || 10);
    }
    const response = await api.get('/user', { params });
    return usersListSchema.parse(response.data);
  },

  // Get a single user by ID
  getUser: async (id: number): Promise<User> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = getMockUser(id);
      if (!user) throw new Error('User not found');
      return user;
    }
    const response = await api.get(`/user/${id}`);
    return userSchema.parse(response.data);
  },

  // Update a user
  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const validatedData = updateUserSchema.parse(data);
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const user = updateMockUser(id, validatedData);
      if (!user) throw new Error('User not found');
      return user;
    }
    const response = await api.patch(`/user/${id}`, validatedData);
    return userSchema.parse(response.data);
  },

  // Toggle user active status
  toggleUserStatus: async (id: number, active: boolean): Promise<User> => {
    return userService.updateUser(id, { active });
  },

  // Change user role
  changeUserRole: async (id: number, role: UpdateUserRequest['role']): Promise<User> => {
    return userService.updateUser(id, { role });
  },
};