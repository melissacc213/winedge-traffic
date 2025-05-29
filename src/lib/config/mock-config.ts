// Mock configuration - set to true to use mock data
// To disable mock mode and use real API, set this to false
export const USE_MOCK_API = true;

// Mock user for authentication
export const MOCK_USER = {
  id: "1",
  username: "admin",
  email: "admin@winedge.com",
  date_joined: "2024-01-01T00:00:00Z",
  is_superuser: true,
  is_owner: true,
  expiry_time: null,
};

// Mock credentials that will be accepted
export const MOCK_CREDENTIALS = [
  { email: "admin@winedge.com", password: "admin123" },
  { email: "user@winedge.com", password: "user123" },
  { email: "demo@winedge.com", password: "demo123" },
];