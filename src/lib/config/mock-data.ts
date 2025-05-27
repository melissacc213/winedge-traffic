// Configuration for mock data usage
// Set to true to use mock data throughout the application
// Set to false to use real API endpoints

export const USE_MOCK_DATA = {
  users: true,
  licenses: true,
  tasks: false,
  models: false,
  recipes: false,
} as const;

// You can also use an environment variable to control this globally
// export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';