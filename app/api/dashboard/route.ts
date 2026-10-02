import { withRouteHandler } from "@/lib/server/handler";
import { getDashboardData } from "@/lib/data-service";

export const GET = withRouteHandler(async () => {
  return { data: await getDashboardData() };
});