import { http } from "./http";
import { Arena } from "@/lib/types";

export interface UpdateArenaDto {
  name?: string;
  status?: "ACTIVE" | "IDLE" | "MAINTENANCE";
  currentMatchId?: string;
}

export const arenasApi = {
  list: (): Promise<Arena[]> => {
    return http.get<Arena[]>("/api/arenas");
  },

  getById: (id: string): Promise<Arena> => {
    return http.get<Arena>(`/api/arenas/${id}`);
  },

  update: (id: string, data: UpdateArenaDto): Promise<Arena> => {
    return http.patch<Arena>(`/api/arenas/${id}`, data);
  },
};
