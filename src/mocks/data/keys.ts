import type { License } from '@/lib/validator/license';

// Mock keys/licenses data
export const mockKeys: License[] = [
  {
    id: 1,
    name: "Production License 2024",
    file_name: "winedge_prod_2024.lic",
    file_size: 2048,
    is_default: true,
    uploaded_by: "admin@winedge.com",
    uploaded_at: "2024-01-15T10:30:00Z",
    expires_at: "2025-01-15T10:30:00Z",
    status: "active",
  },
  {
    id: 2,
    name: "Development License 2024",
    file_name: "winedge_dev_2024.key",
    file_size: 1536,
    is_default: false,
    uploaded_by: "dev@winedge.com",
    uploaded_at: "2024-02-01T14:20:00Z",
    expires_at: "2025-02-01T14:20:00Z",
    status: "active",
  },
  {
    id: 3,
    name: "Testing License 2023",
    file_name: "winedge_test_2023.pem",
    file_size: 1024,
    is_default: false,
    uploaded_by: "qa@winedge.com",
    uploaded_at: "2023-06-10T09:15:00Z",
    expires_at: "2024-06-10T09:15:00Z",
    status: "expired",
  },
  {
    id: 4,
    name: "Enterprise License",
    file_name: "winedge_enterprise.cert",
    file_size: 4096,
    is_default: false,
    uploaded_by: "admin@winedge.com",
    uploaded_at: "2024-03-01T08:00:00Z",
    expires_at: null, // No expiry
    status: "active",
  },
  {
    id: 5,
    name: "Trial License 30 Days",
    file_name: "winedge_trial_30d.lic",
    file_size: 512,
    is_default: false,
    uploaded_by: "sales@winedge.com",
    uploaded_at: "2024-11-01T12:00:00Z",
    expires_at: "2024-12-01T12:00:00Z",
    status: "expired",
  },
];

// Helper functions for mock key operations
export function getMockKeys(page: number = 1, size: number = 10) {
  const start = (page - 1) * size;
  const end = start + size;
  const results = mockKeys.slice(start, end);
  
  return {
    count: mockKeys.length,
    next: end < mockKeys.length ? `/api/v1/key?page=${page + 1}&size=${size}` : null,
    previous: page > 1 ? `/api/v1/key?page=${page - 1}&size=${size}` : null,
    results,
  };
}

export function getMockKey(id: number) {
  return mockKeys.find(key => key.id === id);
}

export function createMockKey(data: { name: string; file_name: string; is_default: boolean }) {
  const newKey: License = {
    id: mockKeys.length + 1,
    name: data.name,
    file_name: data.file_name,
    file_size: Math.floor(Math.random() * 4096) + 512,
    is_default: data.is_default,
    uploaded_by: "admin@winedge.com",
    uploaded_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    status: "active",
  };
  
  // If setting as default, unset other defaults
  if (data.is_default) {
    mockKeys.forEach(key => {
      key.is_default = false;
    });
  }
  
  mockKeys.push(newKey);
  return newKey;
}

export function updateMockKey(id: number, data: { name?: string; is_default?: boolean }) {
  const keyIndex = mockKeys.findIndex(key => key.id === id);
  if (keyIndex === -1) return null;
  
  // If setting as default, unset other defaults
  if (data.is_default) {
    mockKeys.forEach(key => {
      key.is_default = false;
    });
  }
  
  mockKeys[keyIndex] = {
    ...mockKeys[keyIndex],
    ...data,
  };
  
  return mockKeys[keyIndex];
}

export function deleteMockKey(id: number) {
  const keyIndex = mockKeys.findIndex(key => key.id === id);
  if (keyIndex === -1) return false;
  
  mockKeys.splice(keyIndex, 1);
  return true;
}