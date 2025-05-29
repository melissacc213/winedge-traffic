import { clients } from './index';
import type { 
  CreateLicenseRequest, 
  UpdateLicenseRequest, 
  License, 
  LicensesList 
} from '../validator/license';
import { 
  createLicenseSchema, 
  updateLicenseSchema, 
  licenseSchema, 
  licensesListSchema 
} from '../validator/license';
import { getMockLicenses, getMockLicense, uploadMockLicense, updateMockLicense, deleteMockLicense } from '../../mocks/data/licenses';

const api = clients.v1.private;
const USE_MOCK_DATA = false; // Toggle this to switch between mock and real API

export const licenseService = {
  // Upload a new license
  uploadLicense: async (data: CreateLicenseRequest & { file: File }): Promise<License> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return uploadMockLicense(data);
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

  // Get all licenses with pagination
  getLicenses: async (params?: { page?: number; size?: number }): Promise<LicensesList> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getMockLicenses(params?.page || 1, params?.size || 10);
    }
    const response = await api.get('/key', { params });
    return licensesListSchema.parse(response.data);
  },

  // Get a single license by ID
  getLicense: async (id: number): Promise<License> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const license = getMockLicense(id);
      if (!license) throw new Error('License not found');
      return license;
    }
    const response = await api.get(`/key/${id}`);
    return licenseSchema.parse(response.data);
  },

  // Update a license
  updateLicense: async (id: number, data: UpdateLicenseRequest): Promise<License> => {
    const validatedData = updateLicenseSchema.parse(data);
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const license = updateMockLicense(id, validatedData);
      if (!license) throw new Error('License not found');
      return license;
    }
    const response = await api.patch(`/key/${id}`, validatedData);
    return licenseSchema.parse(response.data);
  },

  // Delete a license
  deleteLicense: async (id: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = deleteMockLicense(id);
      if (!success) throw new Error('License not found');
      return;
    }
    await api.delete(`/key/${id}`);
  },

  // Set license as default
  setDefaultLicense: async (id: number): Promise<License> => {
    return licenseService.updateLicense(id, { is_default: true });
  },
};