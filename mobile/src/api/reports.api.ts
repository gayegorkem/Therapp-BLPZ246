import { apiClient } from './client';
import { endpoints } from './endpoints';

export type ReportTargetType = 0 | 1 | 2; // 0=post, 1=comment, 2=user
export type ReportReason = 0 | 1 | 2 | 3 | 4 | 5 | 99;

export type CreateReportPayload = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
};

export const reportsApi = {
  create: async (payload: CreateReportPayload) => {
    await apiClient.post(endpoints.reports.create, payload);
  },
};
