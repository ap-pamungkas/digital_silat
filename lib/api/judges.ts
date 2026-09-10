import { http } from "./http";
import { Judge, ConnectionStatus } from "@/lib/types";

export interface UpdateJudgeStatusDto {
  status?: ConnectionStatus;
  batteryLevel?: number;
  pingMs?: number;
}

export const judgesApi = {
  list: (): Promise<Judge[]> => {
    return http.get<Judge[]>("/api/judges");
  },

  updateStatus: (id: string, data: UpdateJudgeStatusDto): Promise<Judge> => {
    return http.patch<Judge>(`/api/judges/${id}`, data);
  },
};
