// Mock configuration - set to true to use mock data
// To disable mock mode and use real API, set this to false
export const USE_MOCK_API = true;
export const USE_MOCK_DATA = USE_MOCK_API; // Alias for backward compatibility

// Mock user for authentication
export const MOCK_USER = {
  date_joined: "2024-01-01T00:00:00Z",
  email: "admin@winedge.com",
  expiry_time: null,
  id: "1",
  is_owner: true,
  is_superuser: true,
  username: "admin",
};

// Mock credentials that will be accepted
export const MOCK_CREDENTIALS = [
  { email: "admin@winedge.com", password: "admin123" },
  { email: "user@winedge.com", password: "user123" },
  { email: "demo@winedge.com", password: "demo123" },
];