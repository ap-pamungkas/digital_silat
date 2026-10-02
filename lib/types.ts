import {
  ArenaStatus as PrismaArenaStatus,
  ConnectionStatus as PrismaConnectionStatus,
  Corner as PrismaCorner,
  Gender as PrismaGender,
  MatchStage as PrismaMatchStage,
  MatchStatus as PrismaMatchStatus,
  PenaltyType as PrismaPenaltyType,
  ScoreEventStatus as PrismaScoreEventStatus,
  ScoringAction as PrismaScoringAction,
  TimerStatus as PrismaTimerStatus,
  TournamentStatus as PrismaTournamentStatus,
  WinReason as PrismaWinReason,
} from "@/lib/generated/prisma/enums";

export type Corner = `${PrismaCorner}`;
export type Gender = `${PrismaGender}`;
export type MatchStatus = `${PrismaMatchStatus}`;
export type TournamentStatus = `${PrismaTournamentStatus}`;
export type TimerStatus = `${PrismaTimerStatus}`;
export type ConnectionStatus = `${PrismaConnectionStatus}`;
export type ScoringAction = `${PrismaScoringAction}`;
export type MatchStage = `${PrismaMatchStage}`;
export type PenaltyType = `${PrismaPenaltyType}`;
export type ScoreEventStatus = `${PrismaScoreEventStatus}`;
export type ArenaStatus = `${PrismaArenaStatus}`;
export type MatchWinReason = `${PrismaWinReason}`;

export const MATCH_STATUSES: readonly MatchStatus[] = Object.values(PrismaMatchStatus);
export const MATCH_STAGES: readonly MatchStage[] = Object.values(PrismaMatchStage);
export const TOURNAMENT_STATUSES: readonly TournamentStatus[] = Object.values(PrismaTournamentStatus);
export const SCORE_EVENT_STATUSES: readonly ScoreEventStatus[] = Object.values(PrismaScoreEventStatus);
export const PENALTY_TYPES: readonly PenaltyType[] = Object.values(PrismaPenaltyType);
export const SCORING_ACTIONS: readonly ScoringAction[] = Object.values(PrismaScoringAction);
export const CORNERS: readonly Corner[] = Object.values(PrismaCorner);

export const MATCH_STAGE_LABELS: Record<MatchStage, string> = {
  PENYISIHAN: "Babak Penyisihan",
  PEREMPAT_FINAL: "Perempat Final",
  SEMI_FINAL: "Semi Final",
  FINAL: "Babak Final",
  PEREBUTAN_JUARA_3: "Perebutan Juara 3",
};

export type MatchTimerAction = "START" | "PAUSE" | "RESET" | "NEXT_ROUND" | "SET_ROUND";

export const MATCH_TIMER_ACTIONS: readonly MatchTimerAction[] = [
  "START",
  "PAUSE",
  "RESET",
  "NEXT_ROUND",
  "SET_ROUND",
];

export interface Athlete {
  id: string;
  name: string;
  contingent: string; // e.g., "JAWA TENGAH", "JAWA BARAT"
  contingentCode?: string; // e.g., "JTG", "JBR"
  gender: Gender;
  weightClass: string; // e.g., "KELAS A (45-50 kg)"
  avatarUrl?: string;
  seed?: number;
}

export interface Judge {
  id: string; // e.g., "JURI_1"
  judgeNumber: number; // 1 to 5
  name: string;
  licenseNumber?: string;
  arenaId: string;
  status: ConnectionStatus;
  batteryLevel?: number; // 0 to 100
  pingMs?: number;
  lastActive: string;
  device?: string;
}

export interface ScoreEvent {
  id: string;
  matchId: string;
  judgeId: string;
  judgeNumber: number;
  corner: Corner;
  action: ScoringAction;
  points: number;
  round: number;
  matchTime: string; // e.g., "01:25"
  timestamp: number;
  verified: boolean;
  status: ScoreEventStatus;
  judgesAgreed?: number[];
}

export interface PenaltyRecord {
  id: string;
  matchId: string;
  corner: Corner;
  type: PenaltyType;
  pointsDeducted: number;
  round: number;
  timestamp: number;
  refereeNote?: string;
}

export interface Match {
  id: string;
  matchNumber: string; // e.g., "MATCH #023"
  arenaId: string;
  arenaName: string; // e.g., "GELANGGANG 1"
  tournamentId: string;
  tournamentName: string;
  category: string; // e.g., "TANDING - KELAS A PUTRA"
  stage: string; // e.g., "BABAK FINAL"
  redAthlete: Athlete;
  blueAthlete: Athlete;
  redScore: number;
  blueScore: number;
  currentRound: number;
  totalRounds: number;
  timeRemainingSeconds: number;
  roundDurationSeconds: number;
  timerStatus: TimerStatus;
  status: MatchStatus;
  winner?: Corner;
  winReason?: string; // e.g., "MENANG ANGKA", "DISKUALIFIKASI", "W.O."
  scheduledDate?: string;
  scheduledTime: string;
  redPenalties: PenaltyRecord[];
  bluePenalties: PenaltyRecord[];
  events: ScoreEvent[];
}

export interface Arena {
  id: string; // e.g., "ARENA_1"
  name: string; // e.g., "GELANGGANG 1"
  currentMatchId?: string;
  status: ArenaStatus;
  connectedJudgesCount: number;
  totalJudgesCount: number;
  displayConnected: boolean;
  obsConnected: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  totalArenas: number;
  totalMatches: number;
  totalAthletes: number;
}

export const DEFAULT_MATCH: Match = {
  id: "NO_MATCH",
  matchNumber: "MATCH #---",
  arenaId: "ARENA-01",
  arenaName: "GELANGGANG 1",
  tournamentId: "",
  tournamentName: "Pencak Silat Digital Scoring",
  category: "TANDING",
  stage: "PENYISIHAN",
  redAthlete: {
    id: "RED",
    name: "Pesilat Merah",
    contingent: "Kontingen Merah",
    gender: "PUTRA",
    weightClass: "KELAS A",
  },
  blueAthlete: {
    id: "BLUE",
    name: "Pesilat Biru",
    contingent: "Kontingen Biru",
    gender: "PUTRA",
    weightClass: "KELAS A",
  },
  redScore: 0,
  blueScore: 0,
  currentRound: 1,
  totalRounds: 3,
  timeRemainingSeconds: 120,
  roundDurationSeconds: 120,
  timerStatus: "READY",
  status: "SCHEDULED",
  scheduledTime: "10:00 WIB",
  redPenalties: [],
  bluePenalties: [],
  events: [],
};

export const DEFAULT_TOURNAMENT: Tournament = {
  id: "TOUR-DEFAULT",
  name: "Turnamen Pencak Silat",
  location: "Gelanggang Olahraga",
  startDate: "Hari Ini",
  endDate: "Selesai",
  status: "ONGOING",
  totalArenas: 1,
  totalMatches: 0,
  totalAthletes: 0,
};

