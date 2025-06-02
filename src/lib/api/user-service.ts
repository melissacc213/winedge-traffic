import { USE_MOCK_DATA } from '../config/mock-config';
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
import { api } from './index';

export const userService = {
  
  // Change user role
changeUserRole: async (id: string, role: UpdateUserRequest['role']): Promise<User> => {
    return userService.updateUser(id, { role });
  },

  
  


// Create a new user
createUser: async (data: CreateUserRequest): Promise<User> => {
    const validatedData = createUserSchema.parse(data);
    const response = await api.post('/user', validatedData);
    return userSchema.parse(response.data);
  },

  
  



// Delete a user
deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/user/${id}`);
  },

  
  


// Get a single user by ID
getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/user/${id}`);
    return userSchema.parse(response.data);
  },

  
  

// Get all users with pagination
getUsers: async (params?: { page?: number; size?: number | 'all' }): Promise<UsersList> => {
    const response = await api.get('/user', { params });
    return usersListSchema.parse(response.data);
  },

  
  

// Toggle user active status
toggleUserStatus: async (id: string, active: boolean): Promise<User> => {
    return userService.updateUser(id, { active });
  },

  
  
// Update a user
updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const validatedData = updateUserSchema.parse(data);
    const response = await api.patch(`/user/${id}`, validatedData);
    return userSchema.parse(response.data);
  },
};