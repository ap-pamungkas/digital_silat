import { withRouteHandler, parseBody } from "@/lib/server/handler";
import { signInAction } from "@/lib/data-service";
import { loginSchema } from "@/lib/validation";

export const POST = withRouteHandler<unknown, unknown>(async (request) => {
  const body = await parseBody(loginSchema, request);
  const result = await signInAction(body.email, body.password);

  return { data: result };
});