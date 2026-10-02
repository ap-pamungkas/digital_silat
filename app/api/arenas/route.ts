import { withRouteHandler } from "@/lib/server/handler";
import { getArenas } from "@/lib/data-service";

export const GET = withRouteHandler(async () => {
  return { data: await getArenas() };
});