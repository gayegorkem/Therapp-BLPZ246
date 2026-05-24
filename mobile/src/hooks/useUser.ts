import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UpdateProfilePayload } from '@/api/users.api';
import { queryKeys } from './queryKeys';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: usersApi.me,
    staleTime: 60_000,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateMe(payload),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.users.me, data);
    },
  });
}

export function useDeleteMe() {
  return useMutation({
    mutationFn: () => usersApi.deleteMe(),
  });
}
