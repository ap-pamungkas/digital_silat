export type Corner = "RED" | "BLUE";

export type MatchStatus = "UPCOMING" | "SCHEDULED" | "READY" | "LIVE" | "PAUSED" | "FINISHED" | "CANCELLED";

export type TimerStatus = "READY" | "RUNNING" | "PAUSED" | "WARNING" | "FINISHED";

export type ConnectionStatus = "ONLINE" | "SYNCING" | "RECONNECTING" | "OFFLINE";

export type ScoringAction = "PUKULAN" | "TENDANGAN" | "JATUHAN" | "TANGKISAN_PUKULAN" | "TANGKISAN_TENDANGAN" | "HUKUMAN";

export type PenaltyType = 
  | "TEGURAN_1" // -1
  | "TEGURAN_2" // -2
  | "PERINGATAN_1" // -5
  | "PERINGATAN_2" // -10
  | "DISKUALIFIKASI";

export interface Athlete {
  id: string;
  name: string;
  contingent: string; // e.g., "JAWA TENGAH", "JAWA BARAT"
  contingentCode?: string; // e.g., "JTG", "JBR"
  gender: "PUTRA" | "PUTRI";
  weightClass: string; // e.g., "KELAS A (45-50 kg)"
  avatarUrl?: string;
  seed?: number;
}

export interface Judge {
  id: string; // e.g., "JURI_1"
  judgeNumber: number; // 1 to 5
  name: string;
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
  status: "VERIFIED" | "PENDING" | "REJECTED";
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
  scheduledTime: string;
  redPenalties: PenaltyRecord[];
  bluePenalties: PenaltyRecord[];
  events: ScoreEvent[];
}

export interface Arena {
  id: string; // e.g., "ARENA_1"
  name: string; // e.g., "GELANGGANG 1"
  currentMatchId?: string;
  status: "ACTIVE" | "IDLE" | "MAINTENANCE";
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
  status: "ONGOING" | "UPCOMING" | "COMPLETED";
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
  status: "UPCOMING",
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

