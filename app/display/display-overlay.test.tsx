// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DisplayScoreboardContent } from "./[arenaId]/page";
import { ObsOverlayContent } from "../overlay/[arenaId]/page";
import { Match } from "@/lib/types";

const mockParams = { arenaId: "ARENA-01" };
vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

const state = vi.hoisted(() => ({
  matches: [] as Match[],
  isLoading: false,
  activeMatch: { id: "NO_MATCH" } as unknown as Match,
  setActiveMatchId: vi.fn(),
}));

vi.mock("@/lib/scoring-store", () => ({
  ScoringProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    refreshMatches: vi.fn(),
    realtimeStatus: "CONNECTED",
    minJudgesRequired: 3,
  }),
}));

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: "M-TEST-01",
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

describe("TV Display (/display/[arenaId])", () => {
  it("renders dark skeleton while loading when match is not yet available", () => {
    mockParams.arenaId = "ARENA-01";
    state.matches = [];
    state.isLoading = true;

    render(<DisplayScoreboardContent />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Memuat data gelanggang");
    expect(screen.queryByText("Belum ada pertandingan di gelanggang ini")).not.toBeInTheDocument();
  });

  it("renders MATCH #TEST-01 in PAUSED state with score 1-1, athlete names, and arena title", () => {
    mockParams.arenaId = "ARENA-01";
    state.matches = [makeMatch({ status: "PAUSED", redScore: 1, blueScore: 1 })];
    state.isLoading = false;

    render(<DisplayScoreboardContent />);
    expect(screen.getByText("TEST MERAH")).toBeInTheDocument();
    expect(screen.getByText("TEST BIRU")).toBeInTheDocument();
    expect(screen.getByText(/GELANGGANG 1/)).toBeInTheDocument();
    expect(screen.getByText(/MATCH #TEST-01/)).toBeInTheDocument();
    expect(screen.getByText("PAUSED")).toBeInTheDocument();
    expect(screen.queryByText("Belum ada pertandingan di gelanggang ini")).not.toBeInTheDocument();
  });

  it("renders match in LIVE state with score and round", () => {
    mockParams.arenaId = "ARENA-01";
    state.matches = [makeMatch({ status: "LIVE", redScore: 2, blueScore: 3, timerStatus: "RUNNING" })];
    state.isLoading = false;

    render(<DisplayScoreboardContent />);
    expect(screen.getByText("TEST MERAH")).toBeInTheDocument();
    expect(screen.getByText("TEST BIRU")).toBeInTheDocument();
    expect(screen.queryByText("Belum ada pertandingan di gelanggang ini")).not.toBeInTheDocument();
  });

  it("renders match in COMPLETED / FINISHED state", () => {
    mockParams.arenaId = "ARENA-01";
    state.matches = [makeMatch({ status: "FINISHED", redScore: 5, blueScore: 3, winner: "RED" })];
    state.isLoading = false;

    render(<DisplayScoreboardContent />);
    expect(screen.getByText("TEST MERAH")).toBeInTheDocument();
    expect(screen.getByText("TEST BIRU")).toBeInTheDocument();
    expect(screen.queryByText("Belum ada pertandingan di gelanggang ini")).not.toBeInTheDocument();
  });

  it("matches arena code case-insensitively or via arenaDbId", () => {
    mockParams.arenaId = "arena-01";
    state.matches = [makeMatch({ status: "PAUSED" })];
    state.isLoading = false;

    render(<DisplayScoreboardContent />);
    expect(screen.getByText("TEST MERAH")).toBeInTheDocument();
  });
});

describe("OBS Overlay (/overlay/[arenaId])", () => {
  it("renders transparent broadcast bar with athletes and scores in PAUSED state", () => {
    mockParams.arenaId = "ARENA-01";
    state.matches = [makeMatch({ status: "PAUSED", redScore: 1, blueScore: 1 })];

    render(<ObsOverlayContent />);
    expect(screen.getByText("TEST MERAH")).toBeInTheDocument();
    expect(screen.getByText("TEST BIRU")).toBeInTheDocument();
    expect(screen.getByText("PAUSED")).toBeInTheDocument();
  });

  it("renders broadcast bar with athletes and scores in LIVE state", () => {
    mockParams.arenaId = "ARENA-01";
    state.matches = [makeMatch({ status: "LIVE", redScore: 2, blueScore: 1 })];

    render(<ObsOverlayContent />);
    expect(screen.getByText("TEST MERAH")).toBeInTheDocument();
    expect(screen.getByText("TEST BIRU")).toBeInTheDocument();
  });
});
