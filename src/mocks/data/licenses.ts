import type { License, LicensesList } from '../../lib/validator/license';

// Mock licenses data
export const MOCK_LICENSES: License[] = [
  {
    id: 1,
    name: "Production License 2025",
    file_name: "winedge_prod_2025_enterprise.lic",
    file_size: 4096,
    is_default: true,
    uploaded_by: "admin",
    uploaded_at: "2025-01-01T00:00:00Z",
    expires_at: "2026-01-01T23:59:59Z",
    status: "active",
  },
  {
    id: 2,
    name: "Development License Q1-2025",
    file_name: "winedge_dev_q1_2025.lic",
    file_size: 2048,
    is_default: false,
    uploaded_by: "john.developer",
    uploaded_at: "2024-12-28T14:15:00Z",
    expires_at: "2025-03-31T23:59:59Z",
    status: "active",
  },
  {
    id: 3,
    name: "Trial License - Extended",
    file_name: "winedge_trial_extended_90d.lic",
    file_size: 1536,
    is_default: false,
    uploaded_by: "sales.team",
    uploaded_at: "2024-10-01T09:00:00Z",
    expires_at: "2024-12-30T23:59:59Z",
    status: "expired",
  },
  {
    id: 4,
    name: "Enterprise License 2026",
    file_name: "winedge_enterprise_2026_unlimited.lic",
    file_size: 5120,
    is_default: false,
    uploaded_by: "admin",
    uploaded_at: "2024-12-20T16:45:00Z",
    expires_at: "2026-12-31T23:59:59Z",
    status: "active",
  },
  {
    id: 5,
    name: "Partner License - Unlimited",
    file_name: "winedge_partner_premium.lic",
    file_size: 3584,
    is_default: false,
    uploaded_by: "partner.admin",
    uploaded_at: "2024-06-15T11:20:00Z",
    expires_at: null,
    status: "active",
  },
  {
    id: 6,
    name: "Staging Environment 2025",
    file_name: "winedge_staging_2025.lic",
    file_size: 2560,
    is_default: false,
    uploaded_by: "devops.team",
    uploaded_at: "2024-12-15T08:30:00Z",
    expires_at: "2025-06-15T23:59:59Z",
    status: "active",
  },
  {
    id: 7,
    name: "Demo License - Trade Show",
    file_name: "winedge_demo_tradeshow_2024.lic",
    file_size: 1792,
    is_default: false,
    uploaded_by: "marketing.dept",
    uploaded_at: "2024-11-01T13:00:00Z",
    expires_at: "2024-11-30T23:59:59Z",
    status: "expired",
  },
  {
    id: 8,
    name: "Emergency Backup License",
    file_name: "winedge_backup_emergency.lic",
    file_size: 3072,
    is_default: false,
    uploaded_by: "admin",
    uploaded_at: "2024-09-01T10:00:00Z",
    expires_at: "2025-09-01T23:59:59Z",
    status: "active",
  },
  {
    id: 9,
    name: "Customer POC License",
    file_name: "winedge_poc_acme_corp.lic",
    file_size: 2304,
    is_default: false,
    uploaded_by: "sales.engineer",
    uploaded_at: "2024-11-15T15:30:00Z",
    expires_at: "2025-02-15T23:59:59Z",
    status: "active",
  },
  {
    id: 10,
    name: "Testing License - QA",
    file_name: "winedge_qa_testing.lic",
    file_size: 1920,
    is_default: false,
    uploaded_by: "qa.lead",
    uploaded_at: "2024-12-01T09:45:00Z",
    expires_at: "2025-03-01T23:59:59Z",
    status: "active",
  },
  {
    id: 11,
    name: "Regional Office License",
    file_name: "winedge_regional_asia.lic",
    file_size: 2816,
    is_default: false,
    uploaded_by: "regional.admin",
    uploaded_at: "2024-07-20T04:00:00Z",
    expires_at: "2025-07-20T23:59:59Z",
    status: "active",
  },
  {
    id: 12,
    name: "Legacy System License",
    file_name: "winedge_legacy_2023.lic",
    file_size: 1664,
    is_default: false,
    uploaded_by: "legacy.support",
    uploaded_at: "2023-01-01T00:00:00Z",
    expires_at: "2024-01-01T23:59:59Z",
    status: "expired",
  },
];

// Helper function to get paginated licenses
export function getMockLicenses(page: number = 1, size: number = 10): LicensesList {
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedLicenses = MOCK_LICENSES.slice(startIndex, endIndex);
  
  return {
    count: MOCK_LICENSES.length,
    next: endIndex < MOCK_LICENSES.length ? `/api/v1/license?page=${page + 1}&size=${size}` : null,
    previous: page > 1 ? `/api/v1/license?page=${page - 1}&size=${size}` : null,
    results: paginatedLicenses,
  };
}

// Helper function to get a single license
export function getMockLicense(id: number): License | undefined {
  return MOCK_LICENSES.find(license => license.id === id);
}

// Helper function to upload a new license
export function uploadMockLicense(data: any): License {
  const newLicense: License = {
    id: Math.max(...MOCK_LICENSES.map(l => l.id)) + 1,
    name: data.name,
    file_name: data.file.name,
    file_size: data.file.size,
    is_default: data.is_default,
    uploaded_by: "current_user", // In real app, this would come from auth context
    uploaded_at: new Date().toISOString(),
    expires_at: null, // Would be extracted from the license file in real implementation
    status: "active",
  };
  
  // If setting as default, unset other defaults
  if (data.is_default) {
    MOCK_LICENSES.forEach(license => {
      license.is_default = false;
    });
  }
  
  MOCK_LICENSES.push(newLicense);
  return newLicense;
}

// Helper function to update a license
export function updateMockLicense(id: number, data: any): License | undefined {
  const licenseIndex = MOCK_LICENSES.findIndex(l => l.id === id);
  if (licenseIndex === -1) return undefined;
  
  // If setting as default, unset other defaults
  if (data.is_default) {
    MOCK_LICENSES.forEach(license => {
      license.is_default = false;
    });
  }
  
  MOCK_LICENSES[licenseIndex] = {
    ...MOCK_LICENSES[licenseIndex],
    ...data,
  };
  
  return MOCK_LICENSES[licenseIndex];
}

// Helper function to delete a license
export function deleteMockLicense(id: number): boolean {
  const licenseIndex = MOCK_LICENSES.findIndex(l => l.id === id);
  if (licenseIndex === -1) return false;
  
  MOCK_LICENSES.splice(licenseIndex, 1);
  return true;
}