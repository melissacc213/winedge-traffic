// Mock handlers for API endpoints

// Mock user data
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    date_joined: "2025-01-01T00:00:00Z",
    is_superuser: true,
    is_owner: true,
    expiry_time: null,
  },
  {
    id: "2",
    username: "user",
    email: "user@example.com",
    password: "password123",
    date_joined: "2025-01-02T00:00:00Z",
    is_superuser: false,
    is_owner: false,
    expiry_time: null,
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
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Handle self endpoint
    if (url.includes("/api/v1/users/self") && init?.headers) {
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
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
        }
      }

      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle logout
    if (
      url.includes("/api/v1/auth/logout") &&
      init?.method === "POST" &&
      init?.headers
    ) {
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

    // Pass through all other requests
    return originalFetch(input, init);
  };

  console.log("Mock API handlers set up");
}
