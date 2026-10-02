import { withRouteHandler } from "@/lib/server/handler";
import { getSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler<unknown, unknown>(async () => {
  const user = await getSessionUser();

  return { data: { user } };
});