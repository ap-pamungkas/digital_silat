import { withRouteHandler, parseBody } from "@/lib/server/handler";
import { getMatchScoringSnapshot, submitScoreEventAction } from "@/lib/data-service";
import { submitScoreEventSchema } from "@/lib/validation";
import { requireScoringAccess } from "@/lib/auth/judge-session";

export const GET = withRouteHandler<{ matchId: string }, unknown>(async (_request, { params }) => {
  const { matchId } = await params;
  return { data: await getMatchScoringSnapshot(matchId) };
});

export const POST = withRouteHandler<{ matchId: string }, unknown>(async (request, { params }) => {
  const { matchId } = await params;
  const body = await parseBody(submitScoreEventSchema, request);
  await requireScoringAccess(matchId, body.judgeNumber);

  const result = await submitScoreEventAction({
    matchId,
    corner: body.corner,
    action: body.action,
    points: body.points,
    judgeNumber: body.judgeNumber,
  });

  return { data: result, status: 201 };
});