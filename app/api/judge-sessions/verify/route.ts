import { prisma } from "@/lib/prisma";
import { withRouteHandler, parseJson } from "@/lib/server/handler";
import { UnauthorizedError, ValidationError } from "@/lib/server/errors";
import { verifyJudgeSessionSchema } from "@/lib/validation";

export const POST = withRouteHandler(async (request) => {
  let body: unknown;
  try {
    body = await parseJson(request);
  } catch {
    throw new ValidationError("Data verifikasi tidak valid.");
  }

  const parsed = verifyJudgeSessionSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Kode akses atau posisi juri tidak valid.");
  }

  const session = await prisma.judgeSession.findFirst({
    where: {
      matchId: parsed.data.matchId,
      accessCode: parsed.data.accessCode.toUpperCase(),
      judge: { judgeNumber: parsed.data.judgeNumber },
    },
    select: { id: true, judgeId: true },
  });

  if (!session) {
    throw new UnauthorizedError(
      "Kode akses tidak sesuai dengan kode juri untuk pertandingan ini."
    );
  }

  const loginAt = new Date();
  await prisma.$transaction([
    prisma.judgeSession.update({
      where: { id: session.id },
      data: { loginAt, status: "ONLINE" },
    }),
    prisma.judge.update({
      where: { id: session.judgeId },
      data: { status: "ONLINE", lastActiveAt: loginAt },
    }),
  ]);

  return { data: { success: true } };
});