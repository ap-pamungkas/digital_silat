import { withRouteHandler } from "@/lib/server/handler";
import { UnauthorizedError } from "@/lib/server/errors";
import { getJudgeSession } from "@/lib/auth/judge-session";
import { prisma } from "@/lib/prisma";

/** Current judge device session from the HttpOnly cookie, or 401. */
export const GET = withRouteHandler<unknown, unknown>(async () => {
  const session = await getJudgeSession();
  if (!session) {
    throw new UnauthorizedError("Perangkat juri belum masuk.");
  }

  const now = new Date();
  await prisma.judge.update({
    where: { id: session.judgeId },
    data: { status: "ONLINE", lastActiveAt: now },
  }).catch(() => {});

  return { data: session };
});
