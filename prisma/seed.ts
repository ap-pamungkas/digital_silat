import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting database seeding for PAGAR Digital Silat...");

  // 1. Clean existing records (in reverse dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.penalty.deleteMany();
  await prisma.scoreEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.judge.deleteMany();
  await prisma.athlete.deleteMany();
  await prisma.category.deleteMany();
  await prisma.contingent.deleteMany();
  await prisma.arena.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing database records.");

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@pagar.id",
      name: "Agustinus (Super Admin)",
      role: "SUPER_ADMIN",
      avatarUrl: "/avatars/admin.png",
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "operator1@pagar.id",
      name: "Operator Gelanggang 1",
      role: "OPERATOR",
      isActive: true,
    },
  });

  console.log("👤 Created admin & operator users.");

  // 3. Create Tournament
  const tournament = await prisma.tournament.create({
    data: {
      code: "TOUR-2026-ALE",
      name: "KEJUARAAN PENCAK SILAT ALE-ALE 2026",
      description: "Kejuaraan Terbuka Pencak Silat Tingkat Prestasi se-Kalimantan Barat & Nasional",
      location: "GOR PANGSUMA / KETAPANG, KALIMANTAN BARAT",
      startDate: new Date("2026-08-27T08:00:00Z"),
      endDate: new Date("2026-08-30T18:00:00Z"),
      status: "ONGOING",
      rulesetVersion: "IPSI 2022 / PERSILAT 2023",
    },
  });

  console.log(`🏆 Created Tournament: ${tournament.name}`);

  // 4. Create Arenas
  const arena1 = await prisma.arena.create({
    data: {
      tournamentId: tournament.id,
      name: "GELANGGANG 1",
      arenaCode: "ARENA-01",
      arenaNumber: 1,
      status: "ACTIVE",
      displayConnected: true,
      obsConnected: true,
    },
  });

  const arena2 = await prisma.arena.create({
    data: {
      tournamentId: tournament.id,
      name: "GELANGGANG 2",
      arenaCode: "ARENA-02",
      arenaNumber: 2,
      status: "ACTIVE",
      displayConnected: true,
      obsConnected: true,
    },
  });

  const arena3 = await prisma.arena.create({
    data: {
      tournamentId: tournament.id,
      name: "GELANGGANG 3",
      arenaCode: "ARENA-03",
      arenaNumber: 3,
      status: "ACTIVE",
      displayConnected: true,
      obsConnected: false,
    },
  });

  const arena4 = await prisma.arena.create({
    data: {
      tournamentId: tournament.id,
      name: "GELANGGANG 4",
      arenaCode: "ARENA-04",
      arenaNumber: 4,
      status: "IDLE",
      displayConnected: true,
      obsConnected: true,
    },
  });

  console.log("🏟️  Created 4 Arenas (Gelanggang 1-4).");

  // 5. Create Contingents
  const contingentsData = [
    { code: "JTG", name: "JAWA TENGAH", officialName: "Drs. Budi Santoso" },
    { code: "JBR", name: "JAWA BARAT", officialName: "Asep Sunandar" },
    { code: "BAL", name: "BALI", officialName: "I Wayan Suweta" },
    { code: "DKI", name: "DKI JAKARTA", officialName: "M. Subarkah" },
    { code: "JTM", name: "JAWA TIMUR", officialName: "H. Hariadi" },
    { code: "SBR", name: "SUMATERA BARAT", officialName: "Zulkifli" },
    { code: "DIY", name: "D.I. YOGYAKARTA", officialName: "Hamengku Kusuma" },
    { code: "KTM", name: "KALIMANTAN TIMUR", officialName: "Rudy Mas'ud" },
    { code: "BTN", name: "BANTEN", officialName: "Tb. Haerul Jaman" },
    { code: "RIU", name: "RIAU", officialName: "Syamsuar" },
  ];

  const contingents: Record<string, string> = {};
  for (const item of contingentsData) {
    const cont = await prisma.contingent.create({
      data: {
        tournamentId: tournament.id,
        code: item.code,
        name: item.name,
        officialName: item.officialName,
      },
    });
    contingents[item.code] = cont.id;
  }

  console.log("🚩 Created 10 Contingents.");

  // 6. Create Categories
  const catA_Putra = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      name: "TANDING - KELAS A PUTRA",
      categoryClass: "KELAS A (45-50 kg)",
      type: "TANDING",
      gender: "PUTRA",
      ageGroup: "DEWASA",
      minWeight: 45,
      maxWeight: 50,
      roundCount: 3,
      roundDurationSeconds: 120,
    },
  });

  const catB_Putra = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      name: "TANDING - KELAS B PUTRA",
      categoryClass: "KELAS B (50-55 kg)",
      type: "TANDING",
      gender: "PUTRA",
      ageGroup: "DEWASA",
      minWeight: 50,
      maxWeight: 55,
      roundCount: 3,
      roundDurationSeconds: 120,
    },
  });

  const catC_Putri = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      name: "TANDING - KELAS C PUTRI",
      categoryClass: "KELAS C (55-60 kg)",
      type: "TANDING",
      gender: "PUTRI",
      ageGroup: "DEWASA",
      minWeight: 55,
      maxWeight: 60,
      roundCount: 3,
      roundDurationSeconds: 120,
    },
  });

  const catD_Putra = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      name: "TANDING - KELAS D PUTRA",
      categoryClass: "KELAS D (60-65 kg)",
      type: "TANDING",
      gender: "PUTRA",
      ageGroup: "DEWASA",
      minWeight: 60,
      maxWeight: 65,
      roundCount: 3,
      roundDurationSeconds: 120,
    },
  });

  const catE_Putra = await prisma.category.create({
    data: {
      tournamentId: tournament.id,
      name: "TANDING - KELAS E PUTRA",
      categoryClass: "KELAS E (65-70 kg)",
      type: "TANDING",
      gender: "PUTRA",
      ageGroup: "DEWASA",
      minWeight: 65,
      maxWeight: 70,
      roundCount: 3,
      roundDurationSeconds: 120,
    },
  });

  console.log("🥋 Created 5 Categories.");

  // 7. Create Athletes
  const ath1 = await prisma.athlete.create({
    data: {
      contingentId: contingents["JTG"],
      categoryId: catA_Putra.id,
      name: "BIMA SAKTI",
      gender: "PUTRA",
      weight: 49.2,
      seed: 1,
    },
  });

  const ath2 = await prisma.athlete.create({
    data: {
      contingentId: contingents["JBR"],
      categoryId: catA_Putra.id,
      name: "ADITYA PRATAMA",
      gender: "PUTRA",
      weight: 48.8,
      seed: 2,
    },
  });

  const ath3 = await prisma.athlete.create({
    data: {
      contingentId: contingents["BAL"],
      categoryId: catB_Putra.id,
      name: "I GEDE ARYA WIJAYA",
      gender: "PUTRA",
      weight: 53.5,
      seed: 1,
    },
  });

  const ath4 = await prisma.athlete.create({
    data: {
      contingentId: contingents["DKI"],
      categoryId: catB_Putra.id,
      name: "MUHAMMAD RIZKY",
      gender: "PUTRA",
      weight: 54.1,
      seed: 3,
    },
  });

  const ath5 = await prisma.athlete.create({
    data: {
      contingentId: contingents["JTM"],
      categoryId: catC_Putri.id,
      name: "NURUL HIDAYAH",
      gender: "PUTRI",
      weight: 58.0,
      seed: 1,
    },
  });

  const ath6 = await prisma.athlete.create({
    data: {
      contingentId: contingents["SBR"],
      categoryId: catC_Putri.id,
      name: "SITI AISYAH",
      gender: "PUTRI",
      weight: 57.5,
      seed: 2,
    },
  });

  const ath7 = await prisma.athlete.create({
    data: {
      contingentId: contingents["DIY"],
      categoryId: catD_Putra.id,
      name: "FAJAR NUGRAHA",
      gender: "PUTRA",
      weight: 63.4,
    },
  });

  const ath8 = await prisma.athlete.create({
    data: {
      contingentId: contingents["KTM"],
      categoryId: catD_Putra.id,
      name: "HENDRA SAPUTRA",
      gender: "PUTRA",
      weight: 64.0,
    },
  });

  const ath9 = await prisma.athlete.create({
    data: {
      contingentId: contingents["BTN"],
      categoryId: catE_Putra.id,
      name: "DIMAS ANUGRAH",
      gender: "PUTRA",
      weight: 68.2,
    },
  });

  const ath10 = await prisma.athlete.create({
    data: {
      contingentId: contingents["RIU"],
      categoryId: catE_Putra.id,
      name: "ALDI KURNIA",
      gender: "PUTRA",
      weight: 67.9,
    },
  });

  console.log("🥇 Created 10 Athletes.");

  // 8. Create Judges (5 Judges for each Arena)
  const judgeNames = [
    // Arena 1
    "BAMBANG SUDIBYO", "SUPRIADI", "HERMAN KURNIAWAN", "EKO PRASETYO", "AGUS WIJAYA",
    // Arena 2
    "DEDI SURYADI", "WAHYU HIDAYAT", "ARIF RACHMAN", "RUDI HARTONO", "TRI SUSANTO",
    // Arena 3
    "SUGIANTO", "JOKO SANTOSO", "MUHLIS", "DANI DARMAWAN", "ANDI SETIAWAN",
    // Arena 4
    "ZAINAL ABIDIN", "HADI PURNOMO", "FIRMANSYAH", "GUNAWAN", "ANTON SUBAGIO",
  ];

  const arenaList = [arena1, arena2, arena3, arena4];
  const judgesMap: Record<string, string> = {};

  let judgeIdx = 0;
  for (const ar of arenaList) {
    for (let jNum = 1; jNum <= 5; jNum++) {
      const name = judgeNames[judgeIdx++];
      const judge = await prisma.judge.create({
        data: {
          arenaId: ar.id,
          judgeNumber: jNum,
          name,
          licenseNumber: `WASJUR-${ar.arenaNumber}-0${jNum}`,
          status: "ONLINE",
          batteryLevel: 80 + Math.floor(Math.random() * 18),
          pingMs: 15 + Math.floor(Math.random() * 15),
          device: jNum % 2 === 0 ? "iPad Air 5" : "Galaxy Tab S8",
        },
      });
      judgesMap[`${ar.arenaCode}_JURI_${jNum}`] = judge.id;
    }
  }

  console.log("👨‍⚖️ Created 20 Judges across 4 Arenas.");

  // 9. Create Matches
  // Match 1: Live match in Gelanggang 1 (#023)
  const match1 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      arenaId: arena1.id,
      categoryId: catA_Putra.id,
      matchNumber: "MATCH #023",
      stage: "FINAL",
      status: "LIVE",
      currentRound: 2,
      totalRounds: 3,
      roundDurationSeconds: 120,
      timeRemainingSeconds: 90,
      timerStatus: "RUNNING",
      redAthleteId: ath1.id,
      blueAthleteId: ath2.id,
      redScore: 23,
      blueScore: 27,
      scheduledTime: new Date("2026-08-29T10:30:00Z"),
      startedAt: new Date("2026-08-29T10:32:00Z"),
    },
  });

  // Link active match to arena1
  await prisma.arena.update({
    where: { id: arena1.id },
    data: { currentMatchId: match1.id },
  });

  // Match 2: Live match in Gelanggang 2 (#024)
  const match2 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      arenaId: arena2.id,
      categoryId: catB_Putra.id,
      matchNumber: "MATCH #024",
      stage: "SEMI_FINAL",
      status: "LIVE",
      currentRound: 3,
      totalRounds: 3,
      roundDurationSeconds: 120,
      timeRemainingSeconds: 45,
      timerStatus: "RUNNING",
      redAthleteId: ath3.id,
      blueAthleteId: ath4.id,
      redScore: 18,
      blueScore: 14,
      scheduledTime: new Date("2026-08-29T10:45:00Z"),
      startedAt: new Date("2026-08-29T10:46:00Z"),
    },
  });

  await prisma.arena.update({
    where: { id: arena2.id },
    data: { currentMatchId: match2.id },
  });

  // Match 3: Live match in Gelanggang 3 (#025)
  const match3 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      arenaId: arena3.id,
      categoryId: catC_Putri.id,
      matchNumber: "MATCH #025",
      stage: "FINAL",
      status: "LIVE",
      currentRound: 1,
      totalRounds: 3,
      roundDurationSeconds: 120,
      timeRemainingSeconds: 110,
      timerStatus: "RUNNING",
      redAthleteId: ath5.id,
      blueAthleteId: ath6.id,
      redScore: 31,
      blueScore: 29,
      scheduledTime: new Date("2026-08-29T11:00:00Z"),
      startedAt: new Date("2026-08-29T11:01:00Z"),
    },
  });

  await prisma.arena.update({
    where: { id: arena3.id },
    data: { currentMatchId: match3.id },
  });

  // Match 4: Upcoming match in Gelanggang 4 (#026)
  await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      arenaId: arena4.id,
      categoryId: catD_Putra.id,
      matchNumber: "MATCH #026",
      stage: "PENYISIHAN",
      status: "SCHEDULED",
      currentRound: 1,
      totalRounds: 3,
      roundDurationSeconds: 120,
      timeRemainingSeconds: 120,
      timerStatus: "READY",
      redAthleteId: ath7.id,
      blueAthleteId: ath8.id,
      redScore: 0,
      blueScore: 0,
      scheduledTime: new Date("2026-08-29T11:15:00Z"),
    },
  });

  // Match 5: Finished match in Gelanggang 1 (#022)
  await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      arenaId: arena1.id,
      categoryId: catE_Putra.id,
      matchNumber: "MATCH #022",
      stage: "SEMI_FINAL",
      status: "FINISHED",
      currentRound: 3,
      totalRounds: 3,
      roundDurationSeconds: 120,
      timeRemainingSeconds: 0,
      timerStatus: "FINISHED",
      redAthleteId: ath9.id,
      blueAthleteId: ath10.id,
      redScore: 35,
      blueScore: 28,
      winnerCorner: "RED",
      winnerAthleteId: ath9.id,
      winReason: "MENANG_MUTLAK",
      scheduledTime: new Date("2026-08-29T09:45:00Z"),
      startedAt: new Date("2026-08-29T09:46:00Z"),
      endedAt: new Date("2026-08-29T10:15:00Z"),
    },
  });

  console.log("⚔️  Created 5 Matches.");

  // 10. Create Score Events for Match 1
  const juri1_id = judgesMap["ARENA-01_JURI_1"];
  const juri2_id = judgesMap["ARENA-01_JURI_2"];
  const juri3_id = judgesMap["ARENA-01_JURI_3"];
  const juri4_id = judgesMap["ARENA-01_JURI_4"];

  await prisma.scoreEvent.createMany({
    data: [
      {
        matchId: match1.id,
        judgeId: juri1_id,
        judgeNumber: 1,
        corner: "RED",
        action: "PUKULAN",
        points: 1,
        round: 2,
        matchTime: "01:48",
        matchTimestampSeconds: 108,
        verified: true,
        status: "VERIFIED",
      },
      {
        matchId: match1.id,
        judgeId: juri3_id,
        judgeNumber: 3,
        corner: "BLUE",
        action: "TENDANGAN",
        points: 2,
        round: 2,
        matchTime: "01:39",
        matchTimestampSeconds: 99,
        verified: true,
        status: "VERIFIED",
      },
      {
        matchId: match1.id,
        judgeId: juri2_id,
        judgeNumber: 2,
        corner: "RED",
        action: "JATUHAN",
        points: 3,
        round: 2,
        matchTime: "01:25",
        matchTimestampSeconds: 85,
        verified: true,
        status: "VERIFIED",
      },
      {
        matchId: match1.id,
        judgeId: juri4_id,
        judgeNumber: 4,
        corner: "BLUE",
        action: "PUKULAN",
        points: 1,
        round: 2,
        matchTime: "01:12",
        matchTimestampSeconds: 72,
        verified: true,
        status: "VERIFIED",
      },
    ],
  });

  // 11. Create Penalty for Match 1
  await prisma.penalty.create({
    data: {
      matchId: match1.id,
      corner: "BLUE",
      type: "TEGURAN_1",
      pointsDeducted: 1,
      round: 1,
      refereeNote: "Keluar Garis Batas Gelanggang",
      matchTime: "00:45",
    },
  });

  // 12. Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      matchId: match1.id,
      action: "START_MATCH",
      details: JSON.stringify({ matchNumber: "MATCH #023", round: 2, arena: "ARENA-01" }),
      ipAddress: "127.0.0.1",
    },
  });

  console.log("📊 Created Initial Score Events, Penalties, and Audit Logs.");
  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
