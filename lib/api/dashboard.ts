import { http } from "./http";
import { Tournament, Arena, Match } from "@/lib/types";

export interface DashboardResponse {
  tournament: Tournament | null;
  stats: {
    totalAthletes: number;
    totalMatches: number;
    finishedMatches: number;
    totalArenas: number;
    matchesToday: number;
  };
  arenas: Arena[];
  matches: Match[];
  activeMatch: Match | null;
  auditLogs: {
    id: string;
    action: string;
    details: string | null;
    matchId: string | null;
    createdAt: string;
  }[];
}

export const dashboardApi = {
  getOverview: (): Promise<DashboardResponse> => {
    return http.get<DashboardResponse>("/api/dashboard");
  },
};
