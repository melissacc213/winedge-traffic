import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api';
import type { LoginPayload } from '../validator/auth';
import { userKeys } from './user';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginPayload) => authService.login(body),
    onSuccess: ({ token }) => {
      localStorage.setItem('token', token);

      queryClient.resetQueries({
        queryKey: userKeys.self(),
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(userKeys.self(), null);
      queryClient.invalidateQueries({
        queryKey: userKeys.self(),
      });

      localStorage.removeItem('token');
    },
  });
}