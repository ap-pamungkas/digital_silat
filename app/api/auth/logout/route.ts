import { withRouteHandler } from "@/lib/server/handler";
import { signOutAction } from "@/lib/data-service";

export const POST = withRouteHandler<unknown, unknown>(async () => {
  await signOutAction();
  return { data: { success: true } };
});