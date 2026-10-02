import { NextResponse } from "next/server";
import { deleteScheduledMatchAction, updateMatchScheduleAction } from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { updateMatchScheduleSchema } from "@/lib/validation";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const PATCH = withRouteHandler<{ matchId: string }, unknown>(async (request, { params }) => {
  await requireSessionUser(OPERATOR_ROLES);
  const { matchId } = await params;
  const body = await parseBody(updateMatchScheduleSchema, request);

  const result = await updateMatchScheduleAction(matchId, {
    arenaId: body.arenaId,
    matchNumber: body.matchNumber,
    redAthleteId: body.redAthleteId,
    blueAthleteId: body.blueAthleteId,
    stage: body.stage,
    scheduledDate: body.scheduledDate,
    scheduledTime: body.scheduledTime,
  });

  if (!result.success) throw actionError(result);

  return { data: { success: true } };
});

export const DELETE = withRouteHandler<{ matchId: string }, unknown>(async (_request, { params }) => {
  await requireSessionUser(OPERATOR_ROLES);
  const { matchId } = await params;
  const result = await deleteScheduledMatchAction(matchId);

  if (!result.success) throw actionError(result);

  return NextResponse.json({ success: true });
});