import { Corner, ScoringAction, ScoreEvent, Match, DEFAULT_MATCH } from "./lib/types";

interface TestResult {
  scenarioName: string;
  passed: boolean;
  expectedScore: { red: number; blue: number };
  actualScore: { red: number; blue: number };
  details: string;
}

class SilatOperatorDecidedEngineSimulator {
  private match: Match;

  constructor() {
    this.match = {
      ...DEFAULT_MATCH,
      id: "TEST-MATCH-002",
      redScore: 0,
      blueScore: 0,
      events: [],
      currentRound: 1,
    };
  }

  public getMatchState() {
    return this.match;
  }

  public resetScore() {
    this.match.redScore = 0;
    this.match.blueScore = 0;
    this.match.events = [];
  }

  // 1. Juri mengirim usulan skor (Tergantung putusan Petugas Gelanggang)
  public submitJudgeScore(
    judgeNumber: number,
    corner: Corner,
    action: ScoringAction,
    points: number,
    simulatedTimestamp: number
  ): string {
    const existingPendingIndex = this.match.events.findIndex(
      (e) =>
        e.status === "PENDING" &&
        e.round === this.match.currentRound &&
        e.corner === corner &&
        e.action === action &&
        simulatedTimestamp - e.timestamp <= 4000
    );

    if (existingPendingIndex >= 0) {
      const existingEvt = this.match.events[existingPendingIndex];
      const currentJudges = existingEvt.judgesAgreed || [existingEvt.judgeNumber];
      if (!currentJudges.includes(judgeNumber)) {
        this.match.events[existingPendingIndex] = {
          ...existingEvt,
          judgesAgreed: [...currentJudges, judgeNumber],
        };
      }
      return existingEvt.id;
    } else {
      const eventId = `EVT-${simulatedTimestamp}-${Math.random().toString(36).substring(2, 6)}`;
      const newEvent: ScoreEvent = {
        id: eventId,
        matchId: this.match.id,
        judgeId: `JURI-${judgeNumber}`,
        judgeNumber: judgeNumber,
        corner,
        action,
        points,
        round: this.match.currentRound,
        matchTime: "01:30",
        timestamp: simulatedTimestamp,
        verified: false,
        status: "PENDING",
        judgesAgreed: [judgeNumber],
      };
      this.match.events.unshift(newEvent);
      return eventId;
    }
  }

  // 2. Petugas Gelanggang Mengesahkan (Approve) Putusan Skor
  public operatorApproveEvent(eventId: string) {
    const targetEvt = this.match.events.find((e) => e.id === eventId);
    if (!targetEvt || targetEvt.status === "VERIFIED") return;

    targetEvt.status = "VERIFIED";
    targetEvt.verified = true;

    if (targetEvt.corner === "RED") {
      this.match.redScore += targetEvt.points;
    } else {
      this.match.blueScore += targetEvt.points;
    }
  }

  // 3. Petugas Gelanggang Menolak (Reject) Putusan Skor
  public operatorRejectEvent(eventId: string) {
    const targetEvt = this.match.events.find((e) => e.id === eventId);
    if (!targetEvt || targetEvt.status === "REJECTED") return;

    if (targetEvt.status === "VERIFIED") {
      if (targetEvt.corner === "RED") {
        this.match.redScore = Math.max(0, this.match.redScore - targetEvt.points);
      } else {
        this.match.blueScore = Math.max(0, this.match.blueScore - targetEvt.points);
      }
    }

    targetEvt.status = "REJECTED";
    targetEvt.verified = false;
  }
}

async function runOperatorDecisionFlowTests() {
  const engine = new SilatOperatorDecidedEngineSimulator();
  const results: TestResult[] = [];

  console.log("================================================================================");
  console.log("🥋 STARTING OPERATOR-DECIDED SCORING WORKFLOW VERIFICATION TEST");
  console.log("================================================================================\n");

  // TEST 1: Juri Mengirim Skor -> Masuk ke Antrean Pending (Skor Belum Bertambah)
  engine.resetScore();
  const evtId1 = engine.submitJudgeScore(1, "RED", "PUKULAN", 1, 1000);
  let state = engine.getMatchState();
  const t1_passed = state.redScore === 0 && state.events.length === 1 && state.events[0].status === "PENDING";

  results.push({
    scenarioName: "1. Juri Mengajukan Skor Pukulan (+1 Merah) -> Terkirim ke Meja Gelanggang",
    passed: t1_passed,
    expectedScore: { red: 0, blue: 0 },
    actualScore: { red: state.redScore, blue: state.blueScore },
    details: "Usulan skor terkirim ke meja operator dengan status PENDING. Nilai papan skor atlet belum bertambah.",
  });

  // TEST 2: Petugas Gelanggang Menyetujui (Approve) Skor -> Skor Resmi Bertambah & Tercatat
  engine.operatorApproveEvent(evtId1);
  state = engine.getMatchState();
  const t2_passed = state.redScore === 1 && state.events[0].status === "VERIFIED";

  results.push({
    scenarioName: "2. Petugas Gelanggang Mengesahkan (Approve) Skor -> Skor Bertambah di Sistem",
    passed: t2_passed,
    expectedScore: { red: 1, blue: 0 },
    actualScore: { red: state.redScore, blue: state.blueScore },
    details: "Petugas Gelanggang klik 'Sahkan'. Nilai Merah resmi menjadi 1 dan tampil ke layar scoreboard pemain.",
  });

  // TEST 3: Juri Mengajukan Tendangan (+2 Biru) -> Petugas Gelanggang Menolak (Reject)
  const evtId2 = engine.submitJudgeScore(2, "BLUE", "TENDANGAN", 2, 2000);
  engine.operatorRejectEvent(evtId2);
  state = engine.getMatchState();
  const t3_passed = state.blueScore === 0 && state.events[0].status === "REJECTED";

  results.push({
    scenarioName: "3. Juri Mengajukan Tendangan (+2 Biru) -> Petugas Gelanggang Menolak (Reject)",
    passed: t3_passed,
    expectedScore: { red: 1, blue: 0 },
    actualScore: { red: state.redScore, blue: state.blueScore },
    details: "Petugas Gelanggang memutuskan 'Tolak Skor'. Nilai Biru tetap 0 dan event ditandai REJECTED.",
  });

  // TEST 4: Juri 1 & Juri 3 Bersama Mengajukan Jatuhan (+3 Merah) -> Petugas Gelanggang Sahkan
  const evtId3 = engine.submitJudgeScore(1, "RED", "JATUHAN", 3, 3000);
  engine.submitJudgeScore(3, "RED", "JATUHAN", 3, 3500); // Juri 3 ikut mengajukan
  engine.operatorApproveEvent(evtId3);
  state = engine.getMatchState();
  const t4_passed = state.redScore === 4 && state.events[0].judgesAgreed?.length === 2 && state.events[0].status === "VERIFIED";

  results.push({
    scenarioName: "4. Multi-Juri Mengajukan Jatuhan (+3 Merah) -> Petugas Gelanggang Sahkan",
    passed: t4_passed,
    expectedScore: { red: 4, blue: 0 },
    actualScore: { red: state.redScore, blue: state.blueScore },
    details: "Juri 1 & 3 mengajukan jatuhan sah. Petugas Gelanggang menyetujui, nilai Merah menjadi 4 (1 + 3).",
  });

  // OUTPUT TEST RESULTS
  let allPassed = true;
  results.forEach((r, idx) => {
    if (!r.passed) allPassed = false;
    const statusLabel = r.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`[TEST ${idx + 1}] ${statusLabel} - ${r.scenarioName}`);
    console.log(`   Expected: R=${r.expectedScore.red}, B=${r.expectedScore.blue} | Actual: R=${r.actualScore.red}, B=${r.actualScore.blue}`);
    console.log(`   Catatan: ${r.details}\n`);
  });

  console.log("================================================================================");
  console.log(allPassed ? "🎉 SEMUA PENGUJIAN FLOW PUTUSAN PETUGAS GELANGGANG BERHASIL!" : "⚠️ ADA PENGUJIAN GAGAL");
  console.log("================================================================================");
}

runOperatorDecisionFlowTests().catch(console.error);
