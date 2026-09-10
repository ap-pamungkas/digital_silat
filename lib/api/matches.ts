import { http } from "./http";
import { Match, ScoreEvent, PenaltyRecord } from "@/lib/types";

export interface UpdateMatchScoreDto {
  redScore?: number;
  blueScore?: number;
  currentRound?: number;
  timeRemainingSeconds?: number;
  timerStatus?: string;
  status?: string;
  winner?: "RED" | "BLUE";
  winReason?: string;
  event?: ScoreEvent;
  penalty?: PenaltyRecord;
}

export const matchesApi = {
  list: (): Promise<Match[]> => {
    return http.get<Match[]>("/api/matches");
  },

  getById: (id: string): Promise<Match> => {
    return http.get<Match>(`/api/matches/${id}`);
  },

  update: (id: string, data: UpdateMatchScoreDto): Promise<Match> => {
    return http.patch<Match>(`/api/matches/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return http.delete<{ success: boolean }>(`/api/matches/${id}`);
  },
};
