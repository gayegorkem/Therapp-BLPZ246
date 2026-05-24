import { useMutation } from '@tanstack/react-query';
import { reportsApi, type CreateReportPayload } from '@/api/reports.api';

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportsApi.create(payload),
  });
}
