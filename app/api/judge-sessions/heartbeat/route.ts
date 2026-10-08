import { withRouteHandler } from "@/lib/server/handler";
import { UnauthorizedError } from "@/lib/server/errors";
import { getJudgeSession } from "@/lib/auth/judge-session";
import { prisma } from "@/lib/prisma";

export const POST = withRouteHandler(async () => {
  const session = await getJudgeSession();
  if (!session) {
    throw new UnauthorizedError("Perangkat juri belum masuk.");
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.judge.update({
      where: { id: session.judgeId },
      data: { status: "ONLINE", lastActiveAt: now },
    }),
    prisma.judgeSession.updateMany({
      where: { matchId: session.matchId, judgeId: session.judgeId },
      data: { status: "ONLINE" },
    }),
  ]);

  return {
    data: {
      success: true,
      lastActiveAt: now.toISOString(),
    },
  };
});
