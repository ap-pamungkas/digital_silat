import { NextResponse } from "next/server";
import { createJudgeAction, getJudges } from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { createJudgeSchema } from "@/lib/validation";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler(async () => {
  return { data: await getJudges() };
});

export const POST = withRouteHandler(async (request) => {
  await requireSessionUser(OPERATOR_ROLES);
  const body = await parseBody(createJudgeSchema, request);

  const result = await createJudgeAction({
    arenaId: body.arenaId,
    judgeNumber: body.judgeNumber,
    name: body.name,
    licenseNumber: body.licenseNumber,
  });

  if (!result.success) throw actionError(result);

  return NextResponse.json(result.data, { status: 201 });
});