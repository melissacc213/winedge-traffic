import type { License, LicensesList } from '../../lib/validator/license';

// Mock licenses data
export const MOCK_LICENSES: License[] = [
  {
    expires_at: "2026-01-01T23:59:59Z",
    file_name: "winedge_prod_2025_enterprise.lic",
    file_size: 4096,
    id: 1,
    is_default: true,
    name: "Production License 2025",
    status: "active",
    uploaded_at: "2025-01-01T00:00:00Z",
    uploaded_by: "admin",
  },
  {
    expires_at: "2025-03-31T23:59:59Z",
    file_name: "winedge_dev_q1_2025.lic",
    file_size: 2048,
    id: 2,
    is_default: false,
    name: "Development License Q1-2025",
    status: "active",
    uploaded_at: "2024-12-28T14:15:00Z",
    uploaded_by: "john.developer",
  },
  {
    expires_at: "2024-12-30T23:59:59Z",
    file_name: "winedge_trial_extended_90d.lic",
    file_size: 1536,
    id: 3,
    is_default: false,
    name: "Trial License - Extended",
    status: "expired",
    uploaded_at: "2024-10-01T09:00:00Z",
    uploaded_by: "sales.team",
  },
  {
    expires_at: "2026-12-31T23:59:59Z",
    file_name: "winedge_enterprise_2026_unlimited.lic",
    file_size: 5120,
    id: 4,
    is_default: false,
    name: "Enterprise License 2026",
    status: "active",
    uploaded_at: "2024-12-20T16:45:00Z",
    uploaded_by: "admin",
  },
  {
    expires_at: null,
    file_name: "winedge_partner_premium.lic",
    file_size: 3584,
    id: 5,
    is_default: false,
    name: "Partner License - Unlimited",
    status: "active",
    uploaded_at: "2024-06-15T11:20:00Z",
    uploaded_by: "partner.admin",
  },
  {
    expires_at: "2025-06-15T23:59:59Z",
    file_name: "winedge_staging_2025.lic",
    file_size: 2560,
    id: 6,
    is_default: false,
    name: "Staging Environment 2025",
    status: "active",
    uploaded_at: "2024-12-15T08:30:00Z",
    uploaded_by: "devops.team",
  },
  {
    expires_at: "2024-11-30T23:59:59Z",
    file_name: "winedge_demo_tradeshow_2024.lic",
    file_size: 1792,
    id: 7,
    is_default: false,
    name: "Demo License - Trade Show",
    status: "expired",
    uploaded_at: "2024-11-01T13:00:00Z",
    uploaded_by: "marketing.dept",
  },
  {
    expires_at: "2025-09-01T23:59:59Z",
    file_name: "winedge_backup_emergency.lic",
    file_size: 3072,
    id: 8,
    is_default: false,
    name: "Emergency Backup License",
    status: "active",
    uploaded_at: "2024-09-01T10:00:00Z",
    uploaded_by: "admin",
  },
  {
    expires_at: "2025-02-15T23:59:59Z",
    file_name: "winedge_poc_acme_corp.lic",
    file_size: 2304,
    id: 9,
    is_default: false,
    name: "Customer POC License",
    status: "active",
    uploaded_at: "2024-11-15T15:30:00Z",
    uploaded_by: "sales.engineer",
  },
  {
    expires_at: "2025-03-01T23:59:59Z",
    file_name: "winedge_qa_testing.lic",
    file_size: 1920,
    id: 10,
    is_default: false,
    name: "Testing License - QA",
    status: "active",
    uploaded_at: "2024-12-01T09:45:00Z",
    uploaded_by: "qa.lead",
  },
  {
    expires_at: "2025-07-20T23:59:59Z",
    file_name: "winedge_regional_asia.lic",
    file_size: 2816,
    id: 11,
    is_default: false,
    name: "Regional Office License",
    status: "active",
    uploaded_at: "2024-07-20T04:00:00Z",
    uploaded_by: "regional.admin",
  },
  {
    expires_at: "2024-01-01T23:59:59Z",
    file_name: "winedge_legacy_2023.lic",
    file_size: 1664,
    id: 12,
    is_default: false,
    name: "Legacy System License",
    status: "expired",
    uploaded_at: "2023-01-01T00:00:00Z",
    uploaded_by: "legacy.support",
  },
  {
    expires_at: "2025-08-15T23:59:59Z",
    file_name: "winedge_research_edu.lic",
    file_size: 2176,
    id: 13,
    is_default: false,
    name: "Research Lab License",
    status: "active",
    uploaded_at: "2024-08-15T10:30:00Z",
    uploaded_by: "edu.admin",
  },
  {
    expires_at: "2025-01-31T23:59:59Z",
    file_name: "winedge_beta_v2.5.lic",
    file_size: 1408,
    id: 14,
    is_default: false,
    name: "Beta Testing License",
    status: "active",
    uploaded_at: "2024-12-10T14:00:00Z",
    uploaded_by: "beta.coordinator",
  },
  {
    expires_at: "2025-12-05T23:59:59Z",
    file_name: "winedge_gov_contract_2025.lic",
    file_size: 4608,
    id: 15,
    is_default: false,
    name: "Government Contract License",
    status: "active",
    uploaded_at: "2024-12-05T09:15:00Z",
    uploaded_by: "gov.liaison",
  },
  {
    expires_at: "2025-10-20T23:59:59Z",
    file_name: "winedge_dr_site.lic",
    file_size: 3328,
    id: 16,
    is_default: false,
    name: "Disaster Recovery License",
    status: "active",
    uploaded_at: "2024-10-20T06:00:00Z",
    uploaded_by: "dr.admin",
  },
  {
    expires_at: "2025-01-19T23:59:59Z",
    file_name: "winedge_eval_60d_trial.lic",
    file_size: 1280,
    id: 17,
    is_default: false,
    name: "Evaluation License - 60 Day",
    status: "active",
    uploaded_at: "2024-11-20T12:30:00Z",
    uploaded_by: "trial.admin",
  },
  {
    expires_at: "2024-09-30T23:59:59Z",
    file_name: "winedge_event_summit2024.lic",
    file_size: 1920,
    id: 18,
    is_default: false,
    name: "Special Event License",
    status: "expired",
    uploaded_at: "2024-09-15T08:00:00Z",
    uploaded_by: "event.manager",
  },
  {
    expires_at: "2025-11-01T23:59:59Z",
    file_name: "winedge_cloud_aws_prod.lic",
    file_size: 2688,
    id: 19,
    is_default: false,
    name: "Cloud Instance License",
    status: "active",
    uploaded_at: "2024-11-01T00:00:00Z",
    uploaded_by: "cloud.ops",
  },
  {
    expires_at: "2025-01-20T23:59:59Z",
    file_name: "winedge_temp_extension_30d.lic",
    file_size: 1152,
    id: 20,
    is_default: false,
    name: "Temporary Extension License",
    status: "active",
    uploaded_at: "2024-12-20T16:00:00Z",
    uploaded_by: "support.team",
  },
  {
    expires_at: "2025-05-10T23:59:59Z",
    file_name: "winedge_training_lab.lic",
    file_size: 2432,
    id: 21,
    is_default: false,
    name: "Training Environment License",
    status: "active",
    uploaded_at: "2024-05-10T11:45:00Z",
    uploaded_by: "training.dept",
  },
  {
    expires_at: "2025-07-01T23:59:59Z",
    file_name: "winedge_nonprofit_special.lic",
    file_size: 1792,
    id: 22,
    is_default: false,
    name: "Non-Profit Organization License",
    status: "active",
    uploaded_at: "2024-07-01T14:20:00Z",
    uploaded_by: "nonprofit.admin",
  },
  {
    expires_at: "2025-12-01T23:59:59Z",
    file_name: "winedge_ha_cluster.lic",
    file_size: 3840,
    id: 23,
    is_default: false,
    name: "High Availability License",
    status: "active",
    uploaded_at: "2024-12-01T05:30:00Z",
    uploaded_by: "ha.admin",
  },
  {
    expires_at: "2025-10-15T23:59:59Z",
    file_name: "winedge_mobile_unlimited.lic",
    file_size: 2048,
    id: 24,
    is_default: false,
    name: "Mobile App License",
    status: "active",
    uploaded_at: "2024-10-15T13:15:00Z",
    uploaded_by: "mobile.team",
  },
  {
    expires_at: "2025-02-28T23:59:59Z",
    file_name: "winedge_compliance_audit.lic",
    file_size: 2944,
    id: 25,
    is_default: false,
    name: "Compliance Testing License",
    status: "active",
    uploaded_at: "2024-11-30T09:00:00Z",
    uploaded_by: "compliance.officer",
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
    expires_at: null,
    file_name: data.file.name,
    file_size: data.file.size,
    id: Math.max(...MOCK_LICENSES.map(l => l.id)) + 1,
    is_default: data.is_default,
    
name: data.name, 
    
// Would be extracted from the license file in real implementation
status: "active",
    
// In real app, this would come from auth context
uploaded_at: new Date().toISOString(), 
    uploaded_by: "current_user",
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