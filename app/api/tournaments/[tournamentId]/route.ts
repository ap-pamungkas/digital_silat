import { NextResponse } from "next/server";
import {
  deleteTournamentAction,
  updateTournamentAction,
} from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { updateTournamentSchema } from "@/lib/validation";

export const PATCH = withRouteHandler<{ tournamentId: string }, unknown>(
  async (request, { params }) => {
    const { tournamentId } = await params;
    const body = await parseBody(updateTournamentSchema, request);

    const result = await updateTournamentAction(tournamentId, {
      name: body.name,
      location: body.location,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
    });

    if (!result.success) throw actionError(result);

    return { data: result.data };
  }
);

export const DELETE = withRouteHandler<{ tournamentId: string }, unknown>(
  async (_request, { params }) => {
    const { tournamentId } = await params;
    const result = await deleteTournamentAction(tournamentId);

    if (!result.success) {
      if (result.status >= 500) {
        console.error(`[api] DELETE tournament ${tournamentId} gagal`);
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      throw actionError(result);
    }

    return NextResponse.json({ success: true });
  }
);