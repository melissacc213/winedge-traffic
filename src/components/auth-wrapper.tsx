import { Navigate, Outlet } from 'react-router-dom';

import { useSelf } from '@/lib/queries/user';

import { AppLoader } from './ui/app-loader';

export function AuthOutlet() {
  const { data: self, isError: isSelfError, isLoading: isSelfLoading } = useSelf();

  if (isSelfLoading) {
    return <AppLoader />;
  }

  if (isSelfError || !self) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}