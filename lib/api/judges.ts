import { http } from "./http";
import { Judge, ConnectionStatus } from "@/lib/types";

export interface UpdateJudgeStatusDto {
  status?: ConnectionStatus;
  batteryLevel?: number;
  pingMs?: number;
}

export interface CreateJudgeDto {
  arenaId: string;
  judgeNumber: number;
  name: string;
  licenseNumber?: string;
}

export interface UpdateJudgeDto extends Partial<CreateJudgeDto> {}

export const judgesApi = {
  list: (): Promise<Judge[]> => {
    return http.get<Judge[]>("/api/judges");
  },

  create: (data: CreateJudgeDto): Promise<Judge> => {
    return http.post<Judge>("/api/judges", data);
  },

  updateStatus: (id: string, data: UpdateJudgeStatusDto): Promise<Judge> => {
    return http.patch<Judge>(`/api/judges/${id}`, data);
  },

  update: (id: string, data: UpdateJudgeDto): Promise<Judge> => {
    return http.patch<Judge>(`/api/judges/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return http.delete<{ success: boolean }>(`/api/judges/${id}`);
  },
};
