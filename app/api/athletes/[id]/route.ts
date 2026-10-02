import { NextResponse } from "next/server";
import { deleteAthleteAction, updateAthleteAction } from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { updateAthleteSchema } from "@/lib/validation";
import { OPERATOR_ROLES, requireSessionUser } from "@/lib/auth/session";

export const PATCH = withRouteHandler<{ id: string }, unknown>(async (request, { params }) => {
  await requireSessionUser(OPERATOR_ROLES);
  const { id } = await params;
  const data = await parseBody(updateAthleteSchema, request);

  const result = await updateAthleteAction(id, {
    name: data.name,
    contingentName: data.contingent,
    contingentCode: data.contingentCode,
    gender: data.gender,
    weightClassName: data.weightClass,
  });

  if (!result.success) throw actionError(result);

  return { data: result.data };
});

export const DELETE = withRouteHandler<{ id: string }, unknown>(async (_request, { params }) => {
  await requireSessionUser(OPERATOR_ROLES);
  const { id } = await params;
  const result = await deleteAthleteAction(id);

  if (!result.success) throw actionError(result);

  return NextResponse.json({ success: true });
});