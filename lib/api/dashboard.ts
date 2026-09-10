import { http } from "./http";
import { Tournament, Arena, Match } from "@/lib/types";

export interface DashboardResponse {
  tournament: Tournament;
  stats: {
    totalAthletes: number;
    totalMatches: number;
    finishedMatches: number;
    totalArenas: number;
    matchesToday: number;
  };
  arenas: Arena[];
  matches: Match[];
}

export const dashboardApi = {
  getOverview: (): Promise<DashboardResponse> => {
    return http.get<DashboardResponse>("/api/dashboard");
  },
};
