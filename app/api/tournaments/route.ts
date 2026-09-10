import { NextResponse } from "next/server";
import { getTournaments } from "@/lib/data-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await getTournaments();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const arenasCount = parseInt(body.totalArenas) || 3;
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

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create tournament" },
      { status: 500 }
    );
  }
}
