import { withRouteHandler, parseBody } from "@/lib/server/handler";
import { getTournaments } from "@/lib/data-service";
import { prisma } from "@/lib/prisma";
import { createTournamentSchema } from "@/lib/validation";

export const GET = withRouteHandler(async () => {
  return { data: await getTournaments() };
});

export const POST = withRouteHandler(async (request) => {
  const body = await parseBody(createTournamentSchema, request);
  const count = await prisma.tournament.count();
  const newCode = `TOUR-2026-${String(count + 1).padStart(3, "0")}`;

  const created = await prisma.tournament.create({
    data: {
      code: newCode,
      name: body.name.toUpperCase(),
      location: body.location || "GOR Utama",
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : new Date(),
      status: "UPCOMING",
    },
  });

  const arenasCount = Number(body.totalArenas) || 3;
  for (let i = 1; i <= arenasCount; i++) {
    await prisma.arena.create({
      data: {
        tournamentId: created.id,
        name: `GELANGGANG ${i}`,
        arenaCode: `ARENA-0${i}`,
        arenaNumber: i,
        status: "IDLE",
      },
    });
  }

  return { data: created, status: 201 };
});