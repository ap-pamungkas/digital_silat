// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import OperatorLiveScoringPage from "./page";
import { Match } from "@/lib/types";

const mockParams = { matchId: "cmutwmzit000f04jgufj58pfj" };
vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/judge/JudgeSessionManager", () => ({
  JudgeSessionManager: () => <div data-testid="judge-session-manager">Judge Session Manager</div>,
}));

const state = vi.hoisted(() => ({
  matches: [] as Match[],
  isLoading: false,
  activeMatch: { id: "NO_MATCH" } as unknown as Match,
  setActiveMatchId: vi.fn(),
  refreshMatches: vi.fn(),
}));

vi.mock("@/hooks", () => ({
  useToast: () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
  }),
  useScoring: () => ({
    matches: state.matches,
    isLoading: state.isLoading,
    activeMatch: state.activeMatch,
    setActiveMatchId: state.setActiveMatchId,
    submitScore: vi.fn(),
    applyPenalty: vi.fn(),
    toggleTimer: vi.fn(),
    resetTimer: vi.fn(),
    setRound: vi.fn(),
    nextRound: vi.fn(),
    endMatch: vi.fn(),
    verifyEvent: vi.fn(),
    rejectEvent: vi.fn(),
    refreshMatches: state.refreshMatches,
    realtimeStatus: "CONNECTED",
    minJudgesRequired: 3,
  }),
}));

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: "cmutwmzit000f04jgufj58pfj",
    matchNumber: "MATCH #TEST-01",
    arenaId: "ARENA-01",
    arenaDbId: "cmutwgfb2000b04jgq5r57b09",
    arenaName: "GELANGGANG 1",
    tournamentId: "TOUR-2026-002",
    tournamentName: "TEST OPERATOR",
    category: "TANDING - KELAS C PUTRA",
    stage: "BABAK PENYISIHAN",
    redAthlete: {
      id: "A1",
      name: "TEST MERAH",
      contingent: "KONTINGEN UJI",
      gender: "PUTRA",
      weightClass: "KELAS C (55-60 kg)",
    },
    blueAthlete: {
      id: "A2",
      name: "TEST BIRU",
      contingent: "KONTINGEN UJI",
      gender: "PUTRA",
      weightClass: "KELAS C (55-60 kg)",
    },
    redScore: 1,
    blueScore: 1,
    currentRound: 2,
    totalRounds: 3,
    timeRemainingSeconds: 120,
    roundDurationSeconds: 120,
    timerStatus: "READY",
    status: "PAUSED",
    scheduledTime: "23:00 WIB",
    scheduledDate: "2026-10-04",
    redPenalties: [],
    bluePenalties: [],
    events: [],
    totalJudges: 4,
    minJudgesRequired: 3,
    ...overrides,
  };
}

describe("Operator Live Scoring Page Deep Link", () => {
  it("renders loading skeleton without error flash when data is loading", () => {
    state.matches = [];
    state.isLoading = true;

    render(<OperatorLiveScoringPage />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Memuat data pertandingan");
    expect(screen.queryByText("Pertandingan Tidak Ditemukan")).not.toBeInTheDocument();
  });

  it("renders friendly not-found screen when match is truly not in database", () => {
    state.matches = [];
    state.isLoading = false;

    render(<OperatorLiveScoringPage />);
    expect(screen.getByText("Pertandingan Tidak Ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Muat Ulang Data")).toBeInTheDocument();
    expect(screen.getByText("Ke Daftar Pertandingan")).toBeInTheDocument();
  });

  it("renders full operator panel with Meja Putusan Skor and score board when match is loaded", () => {
    state.matches = [makeMatch()];
    state.isLoading = false;

    render(<OperatorLiveScoringPage />);
    expect(screen.getByText(/TEST MERAH vs TEST BIRU/)).toBeInTheDocument();
    expect(screen.getByText("Meja Putusan Skor Petugas Gelanggang")).toBeInTheDocument();
    expect(screen.getByText("Kontrol Otoritas Operator Wasit")).toBeInTheDocument();
    expect(screen.getByText("Log Masukan Poin Juri")).toBeInTheDocument();
    expect(screen.queryByText("Pertandingan Tidak Ditemukan")).not.toBeInTheDocument();
  });
});
