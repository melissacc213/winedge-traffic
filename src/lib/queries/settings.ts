import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../api/settings-service';
import type { CreateLicenseRequest, UpdateLicenseRequest } from '../validator/license';
import { notifications } from '@mantine/notifications';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  keys: () => [...settingsKeys.all, 'keys'] as const,
  keysList: () => [...settingsKeys.keys(), 'list'] as const,
  keysDetail: (id: number) => [...settingsKeys.keys(), 'detail', id] as const,
};

// Get keys/licenses list with pagination
export function useKeys(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: settingsKeys.keysList(),
    queryFn: () => settingsService.keys.list(params),
  });
}

// Get single key/license details
export function useKeyDetails(id: number) {
  return useQuery({
    queryKey: settingsKeys.keysDetail(id),
    queryFn: () => settingsService.keys.get(id),
    enabled: !!id,
  });
}

// Upload key/license mutation
export function useCreateKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLicenseRequest & { file: File }) => 
      settingsService.keys.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        title: 'Success',
        message: 'Key uploaded successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to upload key',
        color: 'red',
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        title: 'Success',
        message: 'Key updated successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update key',
        color: 'red',
      });
    },
  });
}

// Delete key/license mutation
export function useDeleteKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => settingsService.keys.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        title: 'Success',
        message: 'Key deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete key',
        color: 'red',
      });
    },
  });
}

// Set default key/license mutation
export function useSetDefaultKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => settingsService.keys.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.keysList() });
      notifications.show({
        title: 'Success',
        message: 'Default key updated successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to set default key',
        color: 'red',
      });
    },
  });
}