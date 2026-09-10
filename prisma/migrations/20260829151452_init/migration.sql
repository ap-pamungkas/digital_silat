-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR', 'JUDGE', 'REFEREE', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ArenaStatus" AS ENUM ('ACTIVE', 'IDLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('PUTRA', 'PUTRI');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('TANDING', 'SENI_TUNGGAL', 'SENI_GANDA', 'SENI_REGU', 'SOLO_KREATIF');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('USIA_DINI', 'PRA_REMAJA', 'REMAJA', 'DEWASA', 'MASTER');

-- CreateEnum
CREATE TYPE "Corner" AS ENUM ('RED', 'BLUE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'READY', 'LIVE', 'PAUSED', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimerStatus" AS ENUM ('READY', 'RUNNING', 'PAUSED', 'WARNING', 'FINISHED');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('ONLINE', 'SYNCING', 'RECONNECTING', 'OFFLINE');

-- CreateEnum
CREATE TYPE "ScoringAction" AS ENUM ('PUKULAN', 'TENDANGAN', 'JATUHAN', 'TANGKISAN_PUKULAN', 'TANGKISAN_TENDANGAN', 'HUKUMAN');

-- CreateEnum
CREATE TYPE "ScoreEventStatus" AS ENUM ('VERIFIED', 'PENDING', 'REJECTED', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "PenaltyType" AS ENUM ('TEGURAN_1', 'TEGURAN_2', 'PERINGATAN_1', 'PERINGATAN_2', 'PERINGATAN_3', 'DISKUALIFIKASI');

-- CreateEnum
CREATE TYPE "MatchStage" AS ENUM ('PENYISIHAN', 'PEREMPAT_FINAL', 'SEMI_FINAL', 'FINAL', 'PEREBUTAN_JUARA_3');

-- CreateEnum
CREATE TYPE "WinReason" AS ENUM ('MENANG_ANGKA', 'MENANG_MUTLAK', 'MENANG_TEKNIK', 'MENANG_DISKUALIFIKASI', 'MENANG_W_O', 'MENANG_UNDUR_DIRI');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "rulesetVersion" TEXT NOT NULL DEFAULT 'IPSI 2022',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arenas" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "arenaCode" TEXT NOT NULL,
    "arenaNumber" INTEGER NOT NULL,
    "status" "ArenaStatus" NOT NULL DEFAULT 'IDLE',
    "displayConnected" BOOLEAN NOT NULL DEFAULT false,
    "obsConnected" BOOLEAN NOT NULL DEFAULT false,
    "currentMatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contingents" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "officialName" TEXT,
    "contactPhone" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contingents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryClass" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL DEFAULT 'TANDING',
    "gender" "Gender" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL DEFAULT 'DEWASA',
    "minWeight" DOUBLE PRECISION,
    "maxWeight" DOUBLE PRECISION,
    "roundCount" INTEGER NOT NULL DEFAULT 3,
    "roundDurationSeconds" INTEGER NOT NULL DEFAULT 120,
    "restDurationSeconds" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL,
    "contingentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "seed" INTEGER,
    "avatarUrl" TEXT,
    "medicalCleared" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judges" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "arenaId" TEXT NOT NULL,
    "judgeNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'OFFLINE',
    "batteryLevel" INTEGER,
    "pingMs" INTEGER,
    "device" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "matchNumber" TEXT NOT NULL,
    "stage" "MatchStage" NOT NULL DEFAULT 'PENYISIHAN',
    "scheduledTime" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "totalRounds" INTEGER NOT NULL DEFAULT 3,
    "roundDurationSeconds" INTEGER NOT NULL DEFAULT 120,
    "timeRemainingSeconds" INTEGER NOT NULL DEFAULT 120,
    "timerStatus" "TimerStatus" NOT NULL DEFAULT 'READY',
    "timerLastStartedAt" TIMESTAMP(3),
    "redAthleteId" TEXT NOT NULL,
    "blueAthleteId" TEXT NOT NULL,
    "redScore" INTEGER NOT NULL DEFAULT 0,
    "blueScore" INTEGER NOT NULL DEFAULT 0,
    "winnerCorner" "Corner",
    "winnerAthleteId" TEXT,
    "winReason" "WinReason",
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_events" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "judgeNumber" INTEGER NOT NULL,
    "corner" "Corner" NOT NULL,
    "action" "ScoringAction" NOT NULL,
    "points" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "matchTime" TEXT NOT NULL,
    "matchTimestampSeconds" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "status" "ScoreEventStatus" NOT NULL DEFAULT 'VERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalties" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "corner" "Corner" NOT NULL,
    "type" "PenaltyType" NOT NULL,
    "pointsDeducted" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "refereeNote" TEXT,
    "matchTime" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "matchId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_code_key" ON "tournaments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "arenas_tournamentId_arenaCode_key" ON "arenas"("tournamentId", "arenaCode");

-- CreateIndex
CREATE UNIQUE INDEX "contingents_tournamentId_code_key" ON "contingents"("tournamentId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "judges_userId_key" ON "judges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "judges_arenaId_judgeNumber_key" ON "judges"("arenaId", "judgeNumber");

-- CreateIndex
CREATE INDEX "score_events_matchId_round_idx" ON "score_events"("matchId", "round");

-- CreateIndex
CREATE INDEX "score_events_matchId_corner_idx" ON "score_events"("matchId", "corner");

-- CreateIndex
CREATE INDEX "penalties_matchId_corner_idx" ON "penalties"("matchId", "corner");

-- CreateIndex
CREATE INDEX "audit_logs_matchId_idx" ON "audit_logs"("matchId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- AddForeignKey
ALTER TABLE "arenas" ADD CONSTRAINT "arenas_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contingents" ADD CONSTRAINT "contingents_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_contingentId_fkey" FOREIGN KEY ("contingentId") REFERENCES "contingents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judges" ADD CONSTRAINT "judges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judges" ADD CONSTRAINT "judges_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_redAthleteId_fkey" FOREIGN KEY ("redAthleteId") REFERENCES "athletes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_blueAthleteId_fkey" FOREIGN KEY ("blueAthleteId") REFERENCES "athletes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winnerAthleteId_fkey" FOREIGN KEY ("winnerAthleteId") REFERENCES "athletes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "judges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalties" ADD CONSTRAINT "penalties_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
