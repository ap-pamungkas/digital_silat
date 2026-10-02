import { http } from "./http";

export interface JudgeSessionAccess {
  judgeNumber: number;
  judgeName: string;
  accessCode: string;
}

export interface VerifyJudgeSessionDto {
  matchId: string;
  judgeNumber: number;
  accessCode: string;
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

  verify: (data: VerifyJudgeSessionDto): Promise<{ success: boolean }> => {
    return http.post<{ success: boolean }>("/api/judge-sessions/verify", data);
  },

  me: (): Promise<JudgeDeviceSessionDto> => {
    return http.get<JudgeDeviceSessionDto>("/api/judge-sessions/me");
  },
};