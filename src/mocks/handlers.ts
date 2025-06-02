// Mock handlers for API endpoints
import {
  deleteMockLicense,
  getMockLicense,
  getMockLicenses,
  updateMockLicense,
  uploadMockLicense,
} from "./data/licenses";
import {
  createMockUser,
  deleteMockUser,
  getMockUser,
  getMockUsers,
  updateMockUser,
} from "./data/users";

// Mock user data for authentication
const mockUsers = [
  {
    date_joined: "2025-01-01T00:00:00Z",
    email: "admin@example.com",
    expiry_time: null,
    id: "1",
    is_owner: true,
    is_superuser: true,
    password: "admin123",
    username: "admin",
  },
  {
    date_joined: "2025-01-02T00:00:00Z",
    email: "user@example.com",
    expiry_time: null,
    id: "2",
    is_owner: false,
    is_superuser: false,
    password: "password123",
    username: "user",
  },
];

// Store for active tokens
const activeTokens = new Map<string, string>();

// Generate a random token
function generateToken() {
  return (
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2)
  );
}

// Helper function to simulate network delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to parse URL search params
function parseSearchParams(url: string) {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Helper function to check authorization
function checkAuth(headers: Headers | Record<string, string>): string | null {
  const authHeader =
    headers instanceof Headers
      ? headers.get("Authorization")
      : headers["Authorization"] || headers["authorization"];

  if (!authHeader) return null;

  const token = authHeader.replace("Token ", "");
  return activeTokens.get(token) || null;
}

export async function setupMocks() {
  // Mock the login endpoint
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    // Handle login API
    if (url.includes("/api/v1/auth/login") && init?.method === "POST") {
      await delay(300);
      const body = JSON.parse(init.body as string);
      const { email, password } = body;

      // Find the user
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        const token = generateToken();
        activeTokens.set(token, user.id);
        return new Response(JSON.stringify({ token }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }
    }

    // Handle self endpoint
    if (url.includes("/api/v1/users/self") && init?.headers) {
      await delay(200);
      const headers =
        (init.headers as Headers) ||
        new Headers(init.headers as Record<string, string>);
      const authHeader = headers.get("Authorization");

      if (authHeader) {
        const token = authHeader.replace("Token ", "");
        const userId = activeTokens.get(token);

        if (userId) {
          const user = mockUsers.find((u) => u.id === userId);
          if (user) {
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            return new Response(JSON.stringify(userWithoutPassword), {
              headers: { "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      }

      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Handle logout
    if (
      url.includes("/api/v1/auth/logout") &&
      init?.method === "POST" &&
      init?.headers
    ) {
      await delay(100);
      const headers =
        (init.headers as Headers) ||
        new Headers(init.headers as Record<string, string>);
      const authHeader = headers.get("Authorization");

      if (authHeader) {
        const token = authHeader.replace("Token ", "");
        activeTokens.delete(token);
      }

      return new Response(null, { status: 200 });
    }

    // ===== USER MANAGEMENT ENDPOINTS =====

    // Get users list
    if (
      url.includes("/api/v1/user") &&
      !url.match(/\/user\/\d+/) &&
      init?.method === "GET"
    ) {
      await delay(500);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const params = parseSearchParams(url);
      const page = parseInt(params.page || "1");
      const size = parseInt(params.size || "10");

      const result = getMockUsers(page, size);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get single user
    if (url.match(/\/api\/v1\/user\/(\d+)$/) && init?.method === "GET") {
      await delay(300);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const match = url.match(/\/user\/(\d+)$/);
      const id = parseInt(match![1]);
      const user = getMockUser(id);

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          headers: { "Content-Type": "application/json" },
          status: 404,
        });
      }

      return new Response(JSON.stringify(user), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create user
    if (url.includes("/api/v1/user") && init?.method === "POST") {
      await delay(800);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      try {
        const body = JSON.parse(init.body as string);
        const newUser = createMockUser(body);
        return new Response(JSON.stringify(newUser), {
          headers: { "Content-Type": "application/json" },
          status: 201,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request data" }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Update user
    if (url.match(/\/api\/v1\/user\/(\d+)$/) && init?.method === "PATCH") {
      await delay(600);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const match = url.match(/\/user\/(\d+)$/);
      const id = parseInt(match![1]);

      try {
        const body = JSON.parse(init.body as string);
        const updatedUser = updateMockUser(id, body);

        if (!updatedUser) {
          return new Response(JSON.stringify({ error: "User not found" }), {
            headers: { "Content-Type": "application/json" },
            status: 404,
          });
        }

        return new Response(JSON.stringify(updatedUser), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request data" }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Delete user
    if (url.match(/\/api\/v1\/user\/(\d+)$/) && init?.method === "DELETE") {
      await delay(500);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const match = url.match(/\/user\/(\d+)$/);
      const id = parseInt(match![1]);
      const success = deleteMockUser(id);

      if (!success) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          headers: { "Content-Type": "application/json" },
          status: 404,
        });
      }

      return new Response(null, { status: 204 });
    }

    // ===== LICENSE MANAGEMENT ENDPOINTS =====

    // Get licenses list
    if (
      url.includes("/api/v1/key") &&
      !url.match(/\/key\/\d+/) &&
      init?.method === "GET"
    ) {
      await delay(500);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const params = parseSearchParams(url);
      const page = parseInt(params.page || "1");
      const size = parseInt(params.size || "10");

      const result = getMockLicenses(page, size);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get single license
    if (url.match(/\/api\/v1\/key\/(\d+)$/) && init?.method === "GET") {
      await delay(300);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const match = url.match(/\/key\/(\d+)$/);
      const id = parseInt(match![1]);
      const license = getMockLicense(id);

      if (!license) {
        return new Response(JSON.stringify({ error: "License not found" }), {
          headers: { "Content-Type": "application/json" },
          status: 404,
        });
      }

      return new Response(JSON.stringify(license), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Upload license (multipart form data)
    if (url.includes("/api/v1/key") && init?.method === "POST") {
      await delay(1000);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      try {
        // For multipart form data, we'll simulate parsing
        const formData = init.body as FormData;
        const name = formData.get("name") as string;
        const file = formData.get("file") as File;
        const is_default = formData.get("is_default") === "true";

        if (!name || !file) {
          return new Response(
            JSON.stringify({ error: "Name and file are required" }),
            {
              headers: { "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        const newLicense = uploadMockLicense({
          file,
          is_default,
          name,
        });

        return new Response(JSON.stringify(newLicense), {
          headers: { "Content-Type": "application/json" },
          status: 201,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request data" }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Update license
    if (url.match(/\/api\/v1\/key\/(\d+)$/) && init?.method === "PATCH") {
      await delay(600);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const match = url.match(/\/key\/(\d+)$/);
      const id = parseInt(match![1]);

      try {
        const body = JSON.parse(init.body as string);
        const updatedLicense = updateMockLicense(id, body);

        if (!updatedLicense) {
          return new Response(JSON.stringify({ error: "License not found" }), {
            headers: { "Content-Type": "application/json" },
            status: 404,
          });
        }

        return new Response(JSON.stringify(updatedLicense), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request data" }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Delete license
    if (url.match(/\/api\/v1\/key\/(\d+)$/) && init?.method === "DELETE") {
      await delay(500);
      const userId = checkAuth(init.headers as any);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }

      const match = url.match(/\/key\/(\d+)$/);
      const id = parseInt(match![1]);
      const success = deleteMockLicense(id);

      if (!success) {
        return new Response(JSON.stringify({ error: "License not found" }), {
          headers: { "Content-Type": "application/json" },
          status: 404,
        });
      }

      return new Response(null, { status: 204 });
    }

    // Pass through all other requests
    return originalFetch(input, init);
  };
}
