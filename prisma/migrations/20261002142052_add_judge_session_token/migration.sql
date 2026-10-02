-- CreateTable
CREATE TABLE "judge_sessions" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "sessionToken" TEXT,
    "sessionTokenExpiresAt" TIMESTAMP(3),
    "deviceInfo" TEXT,
    "loginAt" TIMESTAMP(3),
    "status" "ConnectionStatus" NOT NULL DEFAULT 'OFFLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "judge_sessions_accessCode_key" ON "judge_sessions"("accessCode");

-- CreateIndex
CREATE UNIQUE INDEX "judge_sessions_sessionToken_key" ON "judge_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "judge_sessions_matchId_judgeId_key" ON "judge_sessions"("matchId", "judgeId");

-- AddForeignKey
ALTER TABLE "judge_sessions" ADD CONSTRAINT "judge_sessions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_sessions" ADD CONSTRAINT "judge_sessions_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "judges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
