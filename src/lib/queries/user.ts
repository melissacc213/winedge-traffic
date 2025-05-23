import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { userService } from '../api';

export const userKeys = {
  all: ['user'] as const,
  self: () => [...userKeys.all, 'self'] as const,
};

export function useSelf() {
  return useQuery({
    queryKey: userKeys.self(),
    queryFn: ({ signal }) => userService.getSelf({ signal }),
    retry: 1,
  });
}

export function useSuspenseSelf() {
  return useSuspenseQuery({
    queryKey: userKeys.self(),
    queryFn: ({ signal }) => userService.getSelf({ signal }),
    retry: 1,
  });
}