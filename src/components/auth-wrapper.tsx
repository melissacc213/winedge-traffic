import { useSelf } from '@/lib/queries/user';
import { Center, Loader } from '@mantine/core';
import { Suspense, startTransition, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function AuthOutlet() {
  const { isSuccess: isSelfSuccess, isError: isSelfError } = useSelf();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [mockAuth, setMockAuth] = useState(false);

  useEffect(() => {
    // In development, auto-set mock user to bypass auth
    if (import.meta.env.DEV) {
      localStorage.setItem('token', 'mock-dev-token');
      localStorage.setItem('mock_user', JSON.stringify({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        date_joined: '2025-01-01T00:00:00Z',
        is_superuser: true,
        is_owner: true,
      }));
      setMockAuth(true);
    } else {
      // Check for mock auth token - this bypasses the API call
      const token = localStorage.getItem('token');
      const mockUser = localStorage.getItem('mock_user');
      
      if (token && mockUser) {
        setMockAuth(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isSelfError && !mockAuth) {
      startTransition(() => {
        setShouldNavigate(true);
      });
    }
  }, [isSelfError, mockAuth]);

  if (shouldNavigate) {
    return <Navigate to="/login" replace />;
  }

  // Either API auth succeeded or we have mock auth
  return (isSelfSuccess || mockAuth) ? (
    <Suspense
      fallback={
        <Center className="fixed inset-0">
          <Loader size="xl" />
        </Center>
      }
    >
      <Outlet />
    </Suspense>
  ) : (
    <Center className="fixed inset-0">
      <Loader size="xl" />
    </Center>
  );
}