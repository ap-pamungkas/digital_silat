import { NextResponse } from "next/server";
import { createMatchAction, getMatches, updateMatchStatusAction } from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { createMatchSchema, updateMatchStatusSchema } from "@/lib/validation";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler(async () => {
  return { data: await getMatches() };
});

export const POST = withRouteHandler(async (request) => {
  await requireSessionUser(OPERATOR_ROLES);
  const body = await parseBody(createMatchSchema, request);
  const result = await createMatchAction(body);

  if (!result.success) throw actionError(result);

  return NextResponse.json(result.data, { status: 201 });
});

export const PATCH = withRouteHandler(async (request) => {
  await requireSessionUser(OPERATOR_ROLES);
  const body = await parseBody(updateMatchStatusSchema, request);
  const result = await updateMatchStatusAction(body);

  if (!result.success) throw actionError(result);

  return { data: { success: true } };
});