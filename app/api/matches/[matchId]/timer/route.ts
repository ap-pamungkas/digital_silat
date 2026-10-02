import { withRouteHandler, parseBody } from "@/lib/server/handler";
import { getMatchTimerAction, updateMatchTimerAction } from "@/lib/data-service";
import { updateTimerSchema } from "@/lib/validation";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler<{ matchId: string }, unknown>(async (_request, { params }) => {
  const { matchId } = await params;
  return { data: await getMatchTimerAction(matchId) };
});

export const PATCH = withRouteHandler<{ matchId: string }, unknown>(async (request, { params }) => {
  await requireSessionUser(OPERATOR_ROLES);
  const { matchId } = await params;
  const body = await parseBody(updateTimerSchema, request);

  const timer = await updateMatchTimerAction({
    matchId,
    action: body.action,
    round: body.round,
  });

  return { data: timer };
});