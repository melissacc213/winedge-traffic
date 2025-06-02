import { createMockKey, deleteMockKey,getMockKey, getMockKeys, updateMockKey } from '../../mocks/data/keys';
import { USE_MOCK_API } from '../config/mock-config';
import type { 
  CreateLicenseRequest, 
  License, 
  LicensesList, 
  UpdateLicenseRequest} from '../validator/license';
import { 
  createLicenseSchema, 
  licenseSchema, 
  licensesListSchema, 
  updateLicenseSchema} from '../validator/license';
import { clients } from './index';

const api = clients.v1.private;

export const settingsService = {
  // Key management (licenses)
  keys: {
    // Upload a new key/license
    create: async (data: CreateLicenseRequest & { file: File }): Promise<License> => {
      if (USE_MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockKey = createMockKey({
          file_name: data.file.name,
          is_default: data.is_default,
          name: data.name,
        });
        
        return licenseSchema.parse(mockKey);
      }
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('file', data.file);
      formData.append('is_default', String(data.is_default));

      const response = await api.post('/key', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return licenseSchema.parse(response.data);
    },

    
    
// Delete a key/license
delete: async (id: number): Promise<void> => {
      if (USE_MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const success = deleteMockKey(id);
        if (!success) {
          throw new Error('Key not found');
        }
        return;
      }
      
      await api.delete(`/key/${id}`);
    },

    
    

// Get a single key/license by ID
get: async (id: number): Promise<License> => {
      if (USE_MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const key = getMockKey(id);
        if (!key) {
          throw new Error('Key not found');
        }
        return licenseSchema.parse(key);
      }
      
      const response = await api.get(`/key/${id}`);
      return licenseSchema.parse(response.data);
    },

    
    
// Get all keys/licenses with pagination
list: async (params?: { page?: number; size?: number }): Promise<LicensesList> => {
      if (USE_MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return licensesListSchema.parse(getMockKeys(params?.page, params?.size));
      }
      
      const response = await api.get('/key', { params });
      return licensesListSchema.parse(response.data);
    },

    
    
// Set key/license as default
setDefault: async (id: number): Promise<License> => {
      return settingsService.keys.update(id, { is_default: true });
    },

    
    // Update a key/license
update: async (id: number, data: UpdateLicenseRequest): Promise<License> => {
      const validatedData = updateLicenseSchema.parse(data);
      
      if (USE_MOCK_API) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        const updatedKey = updateMockKey(id, validatedData);
        if (!updatedKey) {
          throw new Error('Key not found');
        }
        return licenseSchema.parse(updatedKey);
      }
      
      const response = await api.patch(`/key/${id}`, validatedData);
      return licenseSchema.parse(response.data);
    },
  },
};