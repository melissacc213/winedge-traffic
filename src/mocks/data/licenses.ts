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
  {
    id: 13,
    name: "Research Lab License",
    file_name: "winedge_research_edu.lic",
    file_size: 2176,
    is_default: false,
    uploaded_by: "edu.admin",
    uploaded_at: "2024-08-15T10:30:00Z",
    expires_at: "2025-08-15T23:59:59Z",
    status: "active",
  },
  {
    id: 14,
    name: "Beta Testing License",
    file_name: "winedge_beta_v2.5.lic",
    file_size: 1408,
    is_default: false,
    uploaded_by: "beta.coordinator",
    uploaded_at: "2024-12-10T14:00:00Z",
    expires_at: "2025-01-31T23:59:59Z",
    status: "active",
  },
  {
    id: 15,
    name: "Government Contract License",
    file_name: "winedge_gov_contract_2025.lic",
    file_size: 4608,
    is_default: false,
    uploaded_by: "gov.liaison",
    uploaded_at: "2024-12-05T09:15:00Z",
    expires_at: "2025-12-05T23:59:59Z",
    status: "active",
  },
  {
    id: 16,
    name: "Disaster Recovery License",
    file_name: "winedge_dr_site.lic",
    file_size: 3328,
    is_default: false,
    uploaded_by: "dr.admin",
    uploaded_at: "2024-10-20T06:00:00Z",
    expires_at: "2025-10-20T23:59:59Z",
    status: "active",
  },
  {
    id: 17,
    name: "Evaluation License - 60 Day",
    file_name: "winedge_eval_60d_trial.lic",
    file_size: 1280,
    is_default: false,
    uploaded_by: "trial.admin",
    uploaded_at: "2024-11-20T12:30:00Z",
    expires_at: "2025-01-19T23:59:59Z",
    status: "active",
  },
  {
    id: 18,
    name: "Special Event License",
    file_name: "winedge_event_summit2024.lic",
    file_size: 1920,
    is_default: false,
    uploaded_by: "event.manager",
    uploaded_at: "2024-09-15T08:00:00Z",
    expires_at: "2024-09-30T23:59:59Z",
    status: "expired",
  },
  {
    id: 19,
    name: "Cloud Instance License",
    file_name: "winedge_cloud_aws_prod.lic",
    file_size: 2688,
    is_default: false,
    uploaded_by: "cloud.ops",
    uploaded_at: "2024-11-01T00:00:00Z",
    expires_at: "2025-11-01T23:59:59Z",
    status: "active",
  },
  {
    id: 20,
    name: "Temporary Extension License",
    file_name: "winedge_temp_extension_30d.lic",
    file_size: 1152,
    is_default: false,
    uploaded_by: "support.team",
    uploaded_at: "2024-12-20T16:00:00Z",
    expires_at: "2025-01-20T23:59:59Z",
    status: "active",
  },
  {
    id: 21,
    name: "Training Environment License",
    file_name: "winedge_training_lab.lic",
    file_size: 2432,
    is_default: false,
    uploaded_by: "training.dept",
    uploaded_at: "2024-05-10T11:45:00Z",
    expires_at: "2025-05-10T23:59:59Z",
    status: "active",
  },
  {
    id: 22,
    name: "Non-Profit Organization License",
    file_name: "winedge_nonprofit_special.lic",
    file_size: 1792,
    is_default: false,
    uploaded_by: "nonprofit.admin",
    uploaded_at: "2024-07-01T14:20:00Z",
    expires_at: "2025-07-01T23:59:59Z",
    status: "active",
  },
  {
    id: 23,
    name: "High Availability License",
    file_name: "winedge_ha_cluster.lic",
    file_size: 3840,
    is_default: false,
    uploaded_by: "ha.admin",
    uploaded_at: "2024-12-01T05:30:00Z",
    expires_at: "2025-12-01T23:59:59Z",
    status: "active",
  },
  {
    id: 24,
    name: "Mobile App License",
    file_name: "winedge_mobile_unlimited.lic",
    file_size: 2048,
    is_default: false,
    uploaded_by: "mobile.team",
    uploaded_at: "2024-10-15T13:15:00Z",
    expires_at: "2025-10-15T23:59:59Z",
    status: "active",
  },
  {
    id: 25,
    name: "Compliance Testing License",
    file_name: "winedge_compliance_audit.lic",
    file_size: 2944,
    is_default: false,
    uploaded_by: "compliance.officer",
    uploaded_at: "2024-11-30T09:00:00Z",
    expires_at: "2025-02-28T23:59:59Z",
    status: "active",
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