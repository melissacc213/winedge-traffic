import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { licenseService } from '../api/license-service';
import type { CreateLicenseRequest, License, LicensesList,UpdateLicenseRequest } from '../validator/license';

// Mock data generation based on validator schema
const generateMockLicenses = (): License[] => {
  const licenseTypes = ['Production', 'Development', 'Testing', 'Enterprise', 'Trial', 'Partner', 'Staging', 'Demo'];
  const fileExtensions = ['.lic', '.key', '.pem', '.rsa', '.cert'];
  const uploaders = ['admin', 'john.developer', 'sarah.ops', 'mike.devops', 'emily.qa', 'david.admin', 'lisa.partner'];
  
  return Array.from({ length: 20 }, (_, i) => {
    const type = licenseTypes[i % licenseTypes.length];
    const year = 2024 + Math.floor(i / 8);
    const extension = fileExtensions[i % fileExtensions.length];
    const uploader = uploaders[i % uploaders.length];
    
    const uploadedDate = new Date();
    uploadedDate.setDate(uploadedDate.getDate() - Math.floor(Math.random() * 365));
    
    const expiresDate = new Date(uploadedDate);
    expiresDate.setFullYear(expiresDate.getFullYear() + 1);
    // 30% have no expiry
    const hasExpiry = Math.random() > 0.3;
    
    // Determine status
    let status: 'active' | 'expired' | 'invalid' = 'active';
    if (hasExpiry && expiresDate < new Date()) {
      status = 'expired';
    } else if (Math.random() < 0.1) { // 10% chance of invalid
      status = 'invalid';
    }
    
    return {
      expires_at: hasExpiry ? expiresDate.toISOString() : null,
      file_name: `winedge_${type.toLowerCase()}_${year}${extension}`,
      file_size: Math.floor(Math.random() * 4096) + 1024,
      
id: i + 1, 
      // 1KB to 5KB
is_default: i === 0, 
      name: `${type} License ${year}`,
      
status,
      
uploaded_at: uploadedDate.toISOString(),
      // First license is default
uploaded_by: uploader,
    };
  });
};

// Create a persistent mock data store
const mockLicenses = generateMockLicenses();

// Query keys
export const licenseKeys = {
  all: ['licenses'] as const,
  detail: (id: number) => [...licenseKeys.details(), id] as const,
  details: () => [...licenseKeys.all, 'detail'] as const,
  list: (params?: { page?: number; size?: number }) => [...licenseKeys.lists(), params] as const,
  lists: () => [...licenseKeys.all, 'list'] as const,
};

// Get licenses list with pagination
export function useLicenses(params?: { page?: number; size?: number }, useMockData = false) {
  return useQuery({
    queryFn: async () => {
      if (useMockData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const page = params?.page || 1;
        const size = params?.size || 10;
        const start = (page - 1) * size;
        const end = start + size;
        
        const paginatedLicenses = mockLicenses.slice(start, end);
        
        const result: LicensesList = {
          count: mockLicenses.length,
          next: end < mockLicenses.length ? `/api/v1/license?page=${page + 1}&size=${size}` : null,
          previous: page > 1 ? `/api/v1/license?page=${page - 1}&size=${size}` : null,
          results: paginatedLicenses,
        };
        
        return result;
      }
      
      return licenseService.getLicenses(params);
    },
    queryKey: licenseKeys.list(params),
  });
}

// Get single license details
export function useLicenseDetails(id: number, useMockData = false) {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const license = mockLicenses.find(l => l.id === id);
        if (!license) throw new Error('License not found');
        return license;
      }
      return licenseService.getLicense(id);
    },
    queryKey: licenseKeys.detail(id),
  });
}

// Upload license mutation
export function useUploadLicense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLicenseRequest & { file: File }) => 
      licenseService.uploadLicense(data),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to upload license',
        title: 'Error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      notifications.show({
        color: 'green',
        message: 'License uploaded successfully',
        title: 'Success',
      });
    },
  });
}

// Update license mutation
export function useUpdateLicense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLicenseRequest }) => 
      licenseService.updateLicense(id, data),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to update license',
        title: 'Error',
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      notifications.show({
        color: 'green',
        message: 'License updated successfully',
        title: 'Success',
      });
    },
  });
}

// Delete license mutation
export function useDeleteLicense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => licenseService.deleteLicense(id),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to delete license',
        title: 'Error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      notifications.show({
        color: 'green',
        message: 'License deleted successfully',
        title: 'Success',
      });
    },
  });
}

// Set default license mutation
export function useSetDefaultLicense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => licenseService.setDefaultLicense(id),
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        message: error.response?.data?.message || 'Failed to set default license',
        title: 'Error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      notifications.show({
        color: 'green',
        message: 'Default license updated successfully',
        title: 'Success',
      });
    },
  });
}