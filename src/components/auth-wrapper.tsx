import { useSelf } from '@/lib/queries/user';
import { Center, Loader } from '@mantine/core';
import { Navigate, Outlet } from 'react-router-dom';

export function AuthOutlet() {
  const { data: self, isSuccess: isSelfSuccess, isError: isSelfError, isLoading: isSelfLoading } = useSelf();

  if (isSelfLoading) {
    return (
      <Center className="fixed inset-0">
        <Loader size="xl" />
      </Center>
    );
  }

  if (isSelfError || !self) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}