import { NextResponse } from "next/server";
import { getAthletes, createAthleteAction } from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { createAthleteSchema } from "@/lib/validation";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const GET = withRouteHandler(async () => {
  return { data: await getAthletes() };
});

export const POST = withRouteHandler(async (request) => {
  await requireSessionUser(OPERATOR_ROLES);
  const body = await parseBody(createAthleteSchema, request);

  const result = await createAthleteAction({
    name: body.name,
    contingentName: body.contingent,
    contingentCode: body.contingentCode,
    gender: body.gender,
    weightClassName: body.weightClass,
  });

  if (!result.success) throw actionError(result);

  return NextResponse.json(result.data, { status: 201 });
});