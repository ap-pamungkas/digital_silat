import { http } from "./http";
import { Corner, Match, MatchStatus, MatchWinReason, ScoreEvent, PenaltyRecord, ScoringAction, TimerStatus } from "@/lib/types";

export type MatchTimerAction = "START" | "PAUSE" | "RESET" | "NEXT_ROUND" | "SET_ROUND";

export interface MatchTimerSnapshot {
  matchId: string;
  currentRound: number;
  timeRemainingSeconds: number;
  timerStatus: TimerStatus;
  status: MatchStatus;
}

export interface MatchScoringSnapshot {
  matchId: string;
  redScore: number;
  blueScore: number;
  events: ScoreEvent[];
  redPenalties: PenaltyRecord[];
  bluePenalties: PenaltyRecord[];
}

export interface SubmitScoreEventResult {
  snapshot: MatchScoringSnapshot;
  agreedJudges: number[];
}

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

export interface UpdateMatchScheduleDto {
  arenaId: string;
  matchNumber: string;
  redAthleteId: string;
  blueAthleteId: string;
  stage: "PENYISIHAN" | "PEREMPAT_FINAL" | "SEMI_FINAL" | "FINAL" | "PEREBUTAN_JUARA_3";
  scheduledDate: string;
  scheduledTime: string;
}

export interface UpdateMatchStatusDto {
  matchId: string;
  status: "SCHEDULED" | "READY" | "LIVE" | "PAUSED" | "FINISHED" | "CANCELLED";
  winnerCorner?: Corner;
  winReason?: MatchWinReason;
}

export const matchesApi = {
  list: (): Promise<Match[]> => {
    return http.get<Match[]>("/api/matches");
  },

  getById: (id: string): Promise<Match> => {
    return http.get<Match>(`/api/matches/${id}`);
  },

  getTimer: (id: string): Promise<MatchTimerSnapshot> => {
    return http.get<MatchTimerSnapshot>(`/api/matches/${id}/timer`);
  },

  updateTimer: (
    id: string,
    action: MatchTimerAction,
    round?: number
  ): Promise<MatchTimerSnapshot> => {
    return http.patch<MatchTimerSnapshot>(`/api/matches/${id}/timer`, { action, round });
  },

  getScoringSnapshot: (id: string): Promise<MatchScoringSnapshot> => {
    return http.get<MatchScoringSnapshot>(`/api/matches/${id}/score-events`);
  },

  submitScoreEvent: (
    id: string,
    data: { corner: Corner; action: ScoringAction; points: number; judgeNumber: number }
  ): Promise<SubmitScoreEventResult> => {
    return http.post<SubmitScoreEventResult>(`/api/matches/${id}/score-events`, data);
  },

  decideScoreEvent: (
    matchId: string,
    eventId: string,
    decision: "VERIFY" | "REJECT"
  ): Promise<MatchScoringSnapshot> => {
    return http.patch<MatchScoringSnapshot>(
      `/api/matches/${matchId}/score-events/${eventId}`,
      { decision }
    );
  },

  update: (id: string, data: UpdateMatchScoreDto): Promise<Match> => {
    return http.patch<Match>(`/api/matches/${id}`, data);
  },

  updateSchedule: (id: string, data: UpdateMatchScheduleDto): Promise<{ success: boolean }> => {
    return http.patch<{ success: boolean }>(`/api/matches/${id}`, data);
  },

  updateStatus: (data: UpdateMatchStatusDto): Promise<{ success: boolean }> => {
    return http.patch<{ success: boolean }>("/api/matches", data);
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return http.delete<{ success: boolean }>(`/api/matches/${id}`);
  },
};
