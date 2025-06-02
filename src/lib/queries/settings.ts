import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { settingsService } from '../api/settings-service';
import type { CreateLicenseRequest, UpdateLicenseRequest } from '../validator/license';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  keys: () => [...settingsKeys.all, 'keys'] as const,
  keysDetail: (id: number) => [...settingsKeys.keys(), 'detail', id] as const,
  keysList: () => [...settingsKeys.keys(), 'list'] as const,
};

// Get keys/licenses list with pagination
export function useKeys(params?: { page?: number; size?: number }) {
  return useQuery({
    queryFn: () => settingsService.keys.list(params),
    queryKey: settingsKeys.keysList(),
  });
}

// Get single key/license details
export function useKeyDetails(id: number) {
  return useQuery({
    enabled: !!id,
    queryFn: () => settingsService.keys.get(id),
    queryKey: settingsKeys.keysDetail(id),
  });
}

// Upload key/license mutation
export function useCreateKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLicenseRequest & { file: File }) => 
      settingsService.keys.create(data),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to upload key',
        title: 'Error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        color: 'green',
        message: 'Key uploaded successfully',
        title: 'Success',
      });
    },
  });
}

// Update key/license mutation
export function useUpdateKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLicenseRequest }) => 
      settingsService.keys.update(id, data),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to update key',
        title: 'Error',
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        color: 'green',
        message: 'Key updated successfully',
        title: 'Success',
      });
    },
  });
}

// Delete key/license mutation
export function useDeleteKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => settingsService.keys.delete(id),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to delete key',
        title: 'Error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        color: 'green',
        message: 'Key deleted successfully',
        title: 'Success',
      });
    },
  });
}

// Set default key/license mutation
export function useSetDefaultKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => settingsService.keys.setDefault(id),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to set default key',
        title: 'Error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        color: 'green',
        message: 'Default key updated successfully',
        title: 'Success',
      });
    },
  });
}