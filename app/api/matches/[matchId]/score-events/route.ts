import { withRouteHandler, parseBody } from "@/lib/server/handler";
import { getMatchScoringSnapshot, submitScoreEventAction } from "@/lib/data-service";
import { submitScoreEventSchema } from "@/lib/validation";
import { SCORING_ROLES, requireSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler<{ matchId: string }, unknown>(async (_request, { params }) => {
  const { matchId } = await params;
  return { data: await getMatchScoringSnapshot(matchId) };
});

export const POST = withRouteHandler<{ matchId: string }, unknown>(async (request, { params }) => {
  await requireSessionUser(SCORING_ROLES);
  const { matchId } = await params;
  const body = await parseBody(submitScoreEventSchema, request);

  const result = await submitScoreEventAction({
    matchId,
    corner: body.corner,
    action: body.action,
    points: body.points,
    judgeNumber: body.judgeNumber,
  });

  return { data: result, status: 201 };
});