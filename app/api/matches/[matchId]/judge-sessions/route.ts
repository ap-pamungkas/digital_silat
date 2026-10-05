import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { withRouteHandler } from "@/lib/server/handler";
import { NotFoundError, ValidationError } from "@/lib/server/errors";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler<{ matchId: string }, unknown>(async (_request, { params }) => {
  await requireSessionUser(OPERATOR_ROLES);
  const { matchId } = await params;

  const sessions = await prisma.judgeSession.findMany({
    where: { matchId },
    select: {
      accessCode: true,
      judge: { select: { judgeNumber: true, name: true } },
    },
    orderBy: { judge: { judgeNumber: "asc" } },
  });

  return {
    data: sessions.map((session) => ({
      judgeNumber: session.judge.judgeNumber,
      judgeName: session.judge.name,
      accessCode: session.accessCode,
    })),
  };
});

export const POST = withRouteHandler<{ matchId: string }, unknown>(async (_request, { params }) => {
  await requireSessionUser(OPERATOR_ROLES);
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      tournamentId: true,
      arena: {
        select: {
          judges: {
            orderBy: { judgeNumber: "asc" },
            select: { id: true, judgeNumber: true, name: true },
          },
        },
      },
    },
  });

  if (!match) throw new NotFoundError("Pertandingan tidak ditemukan.");
  let judgesList = match.arena.judges;
  if (judgesList.length === 0) {
    judgesList = await prisma.judge.findMany({
      where: { arena: { tournamentId: match.tournamentId } },
      orderBy: { judgeNumber: "asc" },
      select: { id: true, judgeNumber: true, name: true },
    });
  }
  if (judgesList.length === 0) {
    judgesList = await prisma.judge.findMany({
      orderBy: { judgeNumber: "asc" },
      select: { id: true, judgeNumber: true, name: true },
    });
  }
  if (judgesList.length === 0) {
    throw new ValidationError("Belum ada juri terdaftar pada gelanggang pertandingan ini.");
  }

  const generatedSessions = judgesList.map((judge) => ({
    judge,
    accessCode: randomBytes(8).toString("hex").toUpperCase(),
  }));

  await prisma.$transaction(
    generatedSessions.map(({ judge, accessCode }) =>
      prisma.judgeSession.upsert({
        where: { matchId_judgeId: { matchId, judgeId: judge.id } },
        create: { matchId, judgeId: judge.id, accessCode },
        update: {
          accessCode,
          loginAt: null,
          status: "OFFLINE",
          sessionToken: null,
          sessionTokenExpiresAt: null,
        },
      })
    )
  );

  return {
    data: generatedSessions.map(({ judge, accessCode }) => ({
      judgeNumber: judge.judgeNumber,
      judgeName: judge.name,
      accessCode,
    })),
  };
});