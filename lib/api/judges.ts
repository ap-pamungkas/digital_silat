import { http } from "./http";
import { ConnectionStatus, Judge } from "@/lib/types";

export interface CreateJudgeDto {
  arenaId: string;
  judgeNumber: number;
  name: string;
  licenseNumber?: string;
}

export interface UpdateJudgeDto {
  name?: string;
  licenseNumber?: string;
  status?: ConnectionStatus;
  pingMs?: number;
  batteryLevel?: number;
}

export const judgesApi = {
  list: (): Promise<Judge[]> => {
    return http.get<Judge[]>("/api/judges");
  },

  create: (data: CreateJudgeDto): Promise<Judge> => {
    return http.post<Judge>("/api/judges", data);
  },

  update: (id: string, data: UpdateJudgeDto): Promise<Judge> => {
    return http.patch<Judge>(`/api/judges/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return http.delete<{ success: boolean }>(`/api/judges/${id}`);
  },
};
