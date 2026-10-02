import { withRouteHandler, parseBody } from "@/lib/server/handler";
import { decideScoreEventAction } from "@/lib/data-service";
import { decideScoreEventSchema } from "@/lib/validation";

export const PATCH = withRouteHandler<{ matchId: string; eventId: string }, unknown>(
  async (request, { params }) => {
    const { matchId, eventId } = await params;
    const { decision } = await parseBody(decideScoreEventSchema, request);

    const snapshot = await decideScoreEventAction({ matchId, eventId, decision });

    return { data: snapshot };
  }
);