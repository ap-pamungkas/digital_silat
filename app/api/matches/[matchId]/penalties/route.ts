import { withRouteHandler, parseBody } from "@/lib/server/handler";
import { applyPenaltyAction } from "@/lib/data-service";
import { createPenaltySchema } from "@/lib/validation";

export const POST = withRouteHandler<{ matchId: string }, unknown>(async (request, { params }) => {
  const { matchId } = await params;
  const body = await parseBody(createPenaltySchema, request);

  const result = await applyPenaltyAction({
    matchId,
    corner: body.corner,
    type: body.type,
    refereeNote: body.refereeNote,
  });

  return { data: result, status: 201 };
});