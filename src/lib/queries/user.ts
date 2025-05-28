import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api';
import { userService as userManagementService } from '../api/user-service';
import type { CreateUserRequest, UpdateUserRequest, User, UsersList } from '../validator/user';
import { notifications } from '@mantine/notifications';
import { USE_MOCK_DATA } from '../config/mock-data';

// Mock data generation based on validator schema
const generateMockUsers = (): User[] => {
  const roles: Array<'Admin' | 'Operator' | 'Viewer'> = ['Admin', 'Operator', 'Viewer'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
  
  return Array.from({ length: 25 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const role = roles[i % 3];
    const active = i === 0 || Math.random() > 0.2; // 80% active, but first user always active
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
    
    const updatedDate = new Date(createdDate);
    updatedDate.setDate(updatedDate.getDate() + Math.floor(Math.random() * 30));
    
    const lastLoginDate = active ? new Date() : null;
    if (lastLoginDate) {
      lastLoginDate.setHours(lastLoginDate.getHours() - Math.floor(Math.random() * 720)); // Random within last 30 days
    }
    
    return {
      id: i + 1,
      username,
      email: `${username}@winedge.com`,
      role,
      active,
      created_at: createdDate.toISOString(),
      updated_at: updatedDate.toISOString(),
      last_login: lastLoginDate?.toISOString() || null,
    };
  });
};

// Create a persistent mock data store
const mockUsers = generateMockUsers();

export const userKeys = {
  all: ['user'] as const,
  self: () => [...userKeys.all, 'self'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: { page?: number; size?: number }) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export function useSelf() {
  return useQuery({
    queryKey: userKeys.self(),
    queryFn: ({ signal }) => userService.getSelf({ signal }),
    retry: 1,
  });
}

export function useSuspenseSelf() {
  return useSuspenseQuery({
    queryKey: userKeys.self(),
    queryFn: ({ signal }) => userService.getSelf({ signal }),
    retry: 1,
  });
}

// Get users list with pagination
export function useUsers(params?: { page?: number; size?: number }, useMockData = USE_MOCK_DATA.users) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      if (useMockData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const page = params?.page || 1;
        const size = params?.size || 10;
        const start = (page - 1) * size;
        const end = start + size;
        
        const paginatedUsers = mockUsers.slice(start, end);
        
        const result: UsersList = {
          count: mockUsers.length,
          next: end < mockUsers.length ? `/api/v1/user?page=${page + 1}&size=${size}` : null,
          previous: page > 1 ? `/api/v1/user?page=${page - 1}&size=${size}` : null,
          results: paginatedUsers,
        };
        
        return result;
      }
      
      return userManagementService.getUsers(params);
    },
  });
}

// Get single user details
export function useUserDetails(id: number, useMockData = USE_MOCK_DATA.users) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const user = mockUsers.find(u => u.id === id);
        if (!user) throw new Error('User not found');
        return user;
      }
      return userManagementService.getUser(id);
    },
    enabled: !!id,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userManagementService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create user',
        color: 'red',
      });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => 
      userManagementService.updateUser(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update user',
        color: 'red',
      });
    },
  });
}

// Toggle user status mutation
export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => 
      userManagementService.toggleUserStatus(id, active),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      notifications.show({
        title: 'Success',
        message: `User ${variables.active ? 'activated' : 'deactivated'} successfully`,
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update user status',
        color: 'red',
      });
    },
  });
}