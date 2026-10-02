import { http } from "./http";
import {
  Corner,
  Match,
  MatchStage,
  MatchStatus,
  MatchTimerAction,
  MatchWinReason,
  ScoreEvent,
  PenaltyRecord,
  ScoringAction,
  TimerStatus,
} from "@/lib/types";

export type { MatchTimerAction };

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

export interface SubmitScoreEventDto {
  corner: Corner;
  action: ScoringAction;
  points: number;
  judgeNumber: number;
}

export interface DecideScoreEventDto {
  decision: "VERIFY" | "REJECT";
}

export interface UpdateTimerDto {
  action: MatchTimerAction;
  round?: number;
}

export interface CreateMatchDto {
  tournamentId?: string;
  arenaId: string;
  categoryId?: string;
  categoryName?: string;
  matchNumber: string;
  stage?: MatchStage;
  redAthleteId: string;
  blueAthleteId: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface UpdateMatchScheduleDto {
  arenaId: string;
  matchNumber: string;
  redAthleteId: string;
  blueAthleteId: string;
  stage: MatchStage;
  scheduledDate: string;
  scheduledTime: string;
}

export interface UpdateMatchStatusDto {
  matchId: string;
  status: MatchStatus;
  winnerCorner?: Corner;
  winReason?: MatchWinReason;
}

export const matchesApi = {
  list: (): Promise<Match[]> => {
    return http.get<Match[]>("/api/matches");
  },

  create: (data: CreateMatchDto): Promise<unknown> => {
    return http.post<unknown>("/api/matches", data);
  },

getTimer: (id: string): Promise<MatchTimerSnapshot> => {
    return http.get<MatchTimerSnapshot>(`/api/matches/${id}/timer`);
  },

  updateTimer: (
    id: string,
    action: MatchTimerAction,
    round?: number
  ): Promise<MatchTimerSnapshot> => {
    const body: UpdateTimerDto = { action, round };
    return http.patch<MatchTimerSnapshot>(`/api/matches/${id}/timer`, body);
  },

  getScoringSnapshot: (id: string): Promise<MatchScoringSnapshot> => {
    return http.get<MatchScoringSnapshot>(`/api/matches/${id}/score-events`);
  },

  submitScoreEvent: (
    id: string,
    data: SubmitScoreEventDto
  ): Promise<SubmitScoreEventResult> => {
    return http.post<SubmitScoreEventResult>(`/api/matches/${id}/score-events`, data);
  },

  decideScoreEvent: (
    matchId: string,
    eventId: string,
    decision: DecideScoreEventDto["decision"]
  ): Promise<MatchScoringSnapshot> => {
    const body: DecideScoreEventDto = { decision };
    return http.patch<MatchScoringSnapshot>(
      `/api/matches/${matchId}/score-events/${eventId}`,
      body
    );
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
