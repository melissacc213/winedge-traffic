import type { User, UsersList } from '../../lib/validator/user';

// Mock users data
export const MOCK_USERS: User[] = [
  {
    active: true,
    created_at: "2024-01-15T08:00:00Z",
    email: "admin@winedge.com",
    id: "1",
    last_login: "2024-12-25T09:15:00Z",
    role: "admin",
    updated_at: "2024-12-20T14:30:00Z",
    username: "admin",
  },
  {
    active: true,
    created_at: "2024-02-10T10:00:00Z",
    email: "john.operator@winedge.com",
    id: "2",
    last_login: "2024-12-24T18:45:00Z",
    role: "Operator",
    updated_at: "2024-12-15T16:20:00Z",
    username: "john.operator",
  },
  {
    active: true,
    created_at: "2024-02-15T11:30:00Z",
    email: "jane.smith@winedge.com",
    id: "3",
    last_login: "2024-12-23T15:30:00Z",
    role: "Operator",
    updated_at: "2024-11-28T09:10:00Z",
    username: "jane.smith",
  },
  {
    active: false,
    created_at: "2024-03-01T09:00:00Z",
    email: "robert.williams@winedge.com",
    id: "4",
    last_login: "2024-10-14T17:20:00Z",
    role: "Operator",
    updated_at: "2024-10-15T11:45:00Z",
    username: "robert.williams",
  },
  {
    active: true,
    created_at: "2024-03-12T14:20:00Z",
    email: "emily.johnson@winedge.com",
    id: "5",
    last_login: null,
    role: "Operator",
    updated_at: "2024-12-22T10:30:00Z",
    username: "emily.johnson",
  },
  {
    active: false,
    created_at: "2024-03-20T13:45:00Z",
    email: "michael.brown@winedge.com",
    id: "6",
    last_login: "2024-09-28T14:10:00Z",
    role: "admin",
    updated_at: "2024-09-30T15:20:00Z",
    username: "michael.brown",
  },
  {
    active: true,
    created_at: "2024-04-05T10:15:00Z",
    email: "sarah.davis@winedge.com",
    id: "7",
    last_login: "2024-12-25T08:30:00Z",
    role: "Operator",
    updated_at: "2024-12-20T09:00:00Z",
    username: "sarah.davis",
  },
  {
    active: true,
    created_at: "2024-04-18T16:30:00Z",
    email: "david.wilson@winedge.com",
    id: "8",
    last_login: "2024-12-24T11:20:00Z",
    role: "Operator",
    updated_at: "2024-12-18T14:45:00Z",
    username: "david.wilson",
  },
  {
    active: true,
    created_at: "2024-05-02T08:45:00Z",
    email: "lisa.anderson@winedge.com",
    id: "9",
    last_login: "2024-12-25T07:45:00Z",
    role: "Operator",
    updated_at: "2024-12-19T16:10:00Z",
    username: "lisa.anderson",
  },
  {
    active: true,
    created_at: "2024-05-15T12:00:00Z",
    email: "james.taylor@winedge.com",
    id: "10",
    last_login: "2024-12-24T16:00:00Z",
    role: "admin",
    updated_at: "2024-12-21T13:30:00Z",
    username: "james.taylor",
  },
  {
    active: true,
    created_at: "2024-05-20T09:30:00Z",
    email: "patricia.martin@winedge.com",
    id: "11",
    last_login: "2024-12-23T14:20:00Z",
    role: "Operator",
    updated_at: "2024-12-20T11:15:00Z",
    username: "patricia.martin",
  },
  {
    active: true,
    created_at: "2024-06-01T14:00:00Z",
    email: "christopher.garcia@winedge.com",
    id: "12",
    last_login: "2024-12-25T09:00:00Z",
    role: "Operator",
    updated_at: "2024-12-19T10:45:00Z",
    username: "christopher.garcia",
  },
  {
    active: false,
    created_at: "2024-06-10T11:45:00Z",
    email: "linda.martinez@winedge.com",
    id: "13",
    last_login: "2024-11-28T16:45:00Z",
    role: "admin",
    updated_at: "2024-11-30T15:30:00Z",
    username: "linda.martinez",
  },
  {
    active: true,
    created_at: "2024-06-15T08:20:00Z",
    email: "daniel.rodriguez@winedge.com",
    id: "14",
    last_login: "2024-12-24T17:30:00Z",
    role: "Operator",
    updated_at: "2024-12-22T14:00:00Z",
    username: "daniel.rodriguez",
  },
  {
    active: true,
    created_at: "2024-06-25T13:10:00Z",
    email: "nancy.lewis@winedge.com",
    id: "15",
    last_login: null,
    role: "Operator",
    updated_at: "2024-12-18T09:50:00Z",
    username: "nancy.lewis",
  },
  {
    active: true,
    created_at: "2024-07-05T10:30:00Z",
    email: "matthew.lee@winedge.com",
    id: "16",
    last_login: "2024-12-25T10:15:00Z",
    role: "Operator",
    updated_at: "2024-12-21T16:20:00Z",
    username: "matthew.lee",
  },
  {
    active: true,
    created_at: "2024-07-12T15:45:00Z",
    email: "karen.walker@winedge.com",
    id: "17",
    last_login: "2024-12-25T08:00:00Z",
    role: "admin",
    updated_at: "2024-12-23T11:30:00Z",
    username: "karen.walker",
  },
  {
    active: false,
    created_at: "2024-07-20T09:00:00Z",
    email: "paul.hall@winedge.com",
    id: "18",
    last_login: "2024-10-20T13:40:00Z",
    role: "Operator",
    updated_at: "2024-10-25T14:15:00Z",
    username: "paul.hall",
  },
  {
    active: true,
    created_at: "2024-07-28T12:20:00Z",
    email: "betty.allen@winedge.com",
    id: "19",
    last_login: "2024-12-25T07:30:00Z",
    role: "Operator",
    updated_at: "2024-12-24T10:00:00Z",
    username: "betty.allen",
  },
  {
    active: true,
    created_at: "2024-08-05T14:30:00Z",
    email: "kevin.young@winedge.com",
    id: "20",
    last_login: "2024-12-24T14:20:00Z",
    role: "Operator",
    updated_at: "2024-12-20T15:45:00Z",
    username: "kevin.young",
  },
  {
    active: true,
    created_at: "2024-08-10T08:45:00Z",
    email: "sandra.hernandez@winedge.com",
    id: "21",
    last_login: "2024-12-25T11:00:00Z",
    role: "admin",
    updated_at: "2024-12-22T09:30:00Z",
    username: "sandra.hernandez",
  },
  {
    active: true,
    created_at: "2024-08-18T11:00:00Z",
    email: "brian.king@winedge.com",
    id: "22",
    last_login: "2024-12-24T15:45:00Z",
    role: "Operator",
    updated_at: "2024-12-19T13:15:00Z",
    username: "brian.king",
  },
  {
    active: false,
    created_at: "2024-08-25T16:15:00Z",
    email: "donna.wright@winedge.com",
    id: "23",
    last_login: "2024-11-08T09:20:00Z",
    role: "Operator",
    updated_at: "2024-11-10T10:30:00Z",
    username: "donna.wright",
  },
  {
    active: true,
    created_at: "2024-09-02T10:00:00Z",
    email: "george.lopez@winedge.com",
    id: "24",
    last_login: "2024-12-25T09:30:00Z",
    role: "Operator",
    updated_at: "2024-12-23T14:40:00Z",
    username: "george.lopez",
  },
  {
    active: true,
    created_at: "2024-09-10T13:30:00Z",
    email: "carol.hill@winedge.com",
    id: "25",
    last_login: "2024-12-24T16:30:00Z",
    role: "admin",
    updated_at: "2024-12-21T11:20:00Z",
    username: "carol.hill",
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
export function getMockUser(id: string): User | undefined {
  return MOCK_USERS.find(user => user.id === id);
}

// Helper function to create a new user
export function createMockUser(data: any): User {
  const newUser: User = {
    active: true,
    created_at: new Date().toISOString(),
    email: data.email,
    id: String(Math.max(...MOCK_USERS.map(u => parseInt(u.id))) + 1),
    last_login: null,
    role: data.role,
    updated_at: new Date().toISOString(),
    username: data.username,
  };
  
  MOCK_USERS.push(newUser);
  return newUser;
}

// Helper function to update a user
export function updateMockUser(id: string, data: any): User | undefined {
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
export function deleteMockUser(id: string): boolean {
  const userIndex = MOCK_USERS.findIndex(u => u.id === id);
  if (userIndex === -1) return false;
  
  MOCK_USERS.splice(userIndex, 1);
  return true;
}