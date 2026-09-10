import { http } from "./http";
import { Tournament } from "@/lib/types";

export interface CreateTournamentDto {
  name: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  totalArenas?: string | number;
}

export interface UpdateTournamentDto extends Partial<CreateTournamentDto> {
  status?: "ONGOING" | "UPCOMING" | "COMPLETED";
}

export const tournamentsApi = {
  list: (): Promise<Tournament[]> => {
    return http.get<Tournament[]>("/api/tournaments");
  },

  create: (data: CreateTournamentDto): Promise<Tournament> => {
    return http.post<Tournament>("/api/tournaments", data);
  },

  update: (id: string, data: UpdateTournamentDto): Promise<Tournament> => {
    return http.patch<Tournament>(`/api/tournaments/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return http.delete<{ success: boolean }>(`/api/tournaments/${id}`);
  },
};
