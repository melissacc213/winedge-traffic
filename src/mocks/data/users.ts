import type { User, UsersList } from '../../lib/validator/user';

// Mock users data
export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@winedge.com",
    role: "Admin",
    active: true,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-12-20T14:30:00Z",
    last_login: "2024-12-25T09:15:00Z",
  },
  {
    id: 2,
    username: "john.operator",
    email: "john.operator@winedge.com",
    role: "Operator",
    active: true,
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-12-15T16:20:00Z",
    last_login: "2024-12-24T18:45:00Z",
  },
  {
    id: 3,
    username: "jane.smith",
    email: "jane.smith@winedge.com",
    role: "Viewer",
    active: true,
    created_at: "2024-02-15T11:30:00Z",
    updated_at: "2024-11-28T09:10:00Z",
    last_login: "2024-12-23T15:30:00Z",
  },
  {
    id: 4,
    username: "robert.williams",
    email: "robert.williams@winedge.com",
    role: "Operator",
    active: false,
    created_at: "2024-03-01T09:00:00Z",
    updated_at: "2024-10-15T11:45:00Z",
    last_login: "2024-10-14T17:20:00Z",
  },
  {
    id: 5,
    username: "emily.johnson",
    email: "emily.johnson@winedge.com",
    role: "Viewer",
    active: true,
    created_at: "2024-03-12T14:20:00Z",
    updated_at: "2024-12-22T10:30:00Z",
    last_login: null,
  },
  {
    id: 6,
    username: "michael.brown",
    email: "michael.brown@winedge.com",
    role: "Admin",
    active: false,
    created_at: "2024-03-20T13:45:00Z",
    updated_at: "2024-09-30T15:20:00Z",
    last_login: "2024-09-28T14:10:00Z",
  },
  {
    id: 7,
    username: "sarah.davis",
    email: "sarah.davis@winedge.com",
    role: "Operator",
    active: true,
    created_at: "2024-04-05T10:15:00Z",
    updated_at: "2024-12-20T09:00:00Z",
    last_login: "2024-12-25T08:30:00Z",
  },
  {
    id: 8,
    username: "david.wilson",
    email: "david.wilson@winedge.com",
    role: "Viewer",
    active: true,
    created_at: "2024-04-18T16:30:00Z",
    updated_at: "2024-12-18T14:45:00Z",
    last_login: "2024-12-24T11:20:00Z",
  },
  {
    id: 9,
    username: "lisa.anderson",
    email: "lisa.anderson@winedge.com",
    role: "Operator",
    active: true,
    created_at: "2024-05-02T08:45:00Z",
    updated_at: "2024-12-19T16:10:00Z",
    last_login: "2024-12-25T07:45:00Z",
  },
  {
    id: 10,
    username: "james.taylor",
    email: "james.taylor@winedge.com",
    role: "Admin",
    active: true,
    created_at: "2024-05-15T12:00:00Z",
    updated_at: "2024-12-21T13:30:00Z",
    last_login: "2024-12-24T16:00:00Z",
  },
];

// Helper function to get paginated users
export function getMockUsers(page: number = 1, size: number = 10): UsersList {
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedUsers = MOCK_USERS.slice(startIndex, endIndex);
  
  return {
    count: MOCK_USERS.length,
    next: endIndex < MOCK_USERS.length ? `/api/v1/user?page=${page + 1}&size=${size}` : null,
    previous: page > 1 ? `/api/v1/user?page=${page - 1}&size=${size}` : null,
    results: paginatedUsers,
  };
}

// Helper function to get a single user
export function getMockUser(id: number): User | undefined {
  return MOCK_USERS.find(user => user.id === id);
}

// Helper function to create a new user
export function createMockUser(data: any): User {
  const newUser: User = {
    id: Math.max(...MOCK_USERS.map(u => u.id)) + 1,
    username: data.username,
    email: data.email,
    role: data.role,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null,
  };
  
  MOCK_USERS.push(newUser);
  return newUser;
}

// Helper function to update a user
export function updateMockUser(id: number, data: any): User | undefined {
  const userIndex = MOCK_USERS.findIndex(u => u.id === id);
  if (userIndex === -1) return undefined;
  
  MOCK_USERS[userIndex] = {
    ...MOCK_USERS[userIndex],
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  return MOCK_USERS[userIndex];
}

// Helper function to delete a user
export function deleteMockUser(id: number): boolean {
  const userIndex = MOCK_USERS.findIndex(u => u.id === id);
  if (userIndex === -1) return false;
  
  MOCK_USERS.splice(userIndex, 1);
  return true;
}