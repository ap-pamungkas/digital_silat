import { NextResponse } from "next/server";
import { getAthletes, createAthleteAction } from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { createAthleteSchema } from "@/lib/validation";

export const GET = withRouteHandler(async () => {
  return { data: await getAthletes() };
});

export const POST = withRouteHandler(async (request) => {
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