import { http } from "./http";

export interface JudgeSessionAccess {
  judgeNumber: number;
  judgeName: string;
  accessCode: string;
}

export interface VerifyJudgeSessionDto {
  matchId?: string;
  judgeNumber?: number;
  accessCode: string;
}

export interface VerifyJudgeSessionResultDto {
  success: boolean;
  matchId: string;
  judgeNumber: number;
  judgeName: string;
  matchNumber?: string;
  arenaName?: string;
}

export interface JudgeDeviceSessionDto {
  matchId: string;
  judgeId: string;
  judgeNumber: number;
  judgeName: string;
}

export const judgeSessionsApi = {
  listByMatch: (matchId: string): Promise<JudgeSessionAccess[]> => {
    return http.get<JudgeSessionAccess[]>(`/api/matches/${matchId}/judge-sessions`);
  },

  regenerate: (matchId: string): Promise<JudgeSessionAccess[]> => {
    return http.post<JudgeSessionAccess[]>(`/api/matches/${matchId}/judge-sessions`);
  },

  verify: async (data: VerifyJudgeSessionDto): Promise<VerifyJudgeSessionResultDto> => {
    const res = await http.post<VerifyJudgeSessionResultDto | { data: VerifyJudgeSessionResultDto }>("/api/judge-sessions/verify", data);
    if ("data" in res && res.data && typeof res.data === "object" && "matchId" in res.data) {
      return res.data as VerifyJudgeSessionResultDto;
    }
    return res as VerifyJudgeSessionResultDto;
  },

  me: async (): Promise<JudgeDeviceSessionDto> => {
    const res = await http.get<JudgeDeviceSessionDto | { data: JudgeDeviceSessionDto }>("/api/judge-sessions/me");
    if ("data" in res && res.data && typeof res.data === "object" && "matchId" in res.data) {
      return res.data as JudgeDeviceSessionDto;
    }
    return res as JudgeDeviceSessionDto;
  },

  heartbeat: async (): Promise<{ success: boolean; lastActiveAt: string }> => {
    const res = await http.post<{ success: boolean; lastActiveAt: string } | { data: { success: boolean; lastActiveAt: string } }>("/api/judge-sessions/heartbeat");
    if ("data" in res && res.data && typeof res.data === "object") {
      return res.data as { success: boolean; lastActiveAt: string };
    }
    return res as { success: boolean; lastActiveAt: string };
  },
};