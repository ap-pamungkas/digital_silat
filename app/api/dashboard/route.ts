import { withRouteHandler } from "@/lib/server/handler";
import { getDashboardData } from "@/lib/data-service";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler(async () => {
  await requireSessionUser(OPERATOR_ROLES);
  return { data: await getDashboardData() };
});