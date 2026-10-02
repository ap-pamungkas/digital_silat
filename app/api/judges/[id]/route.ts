import { NextResponse } from "next/server";
import { deleteJudgeAction, updateJudgeAction } from "@/lib/data-service";
import { withRouteHandler, parseBody, actionError } from "@/lib/server/handler";
import { updateJudgeSchema } from "@/lib/validation";

export const PATCH = withRouteHandler<{ id: string }, unknown>(async (request, { params }) => {
  const { id } = await params;
  const body = await parseBody(updateJudgeSchema, request);

  const result = await updateJudgeAction(id, body);

  if (!result.success) throw actionError(result);

  return { data: result.data };
});

export const DELETE = withRouteHandler<{ id: string }, unknown>(async (_request, { params }) => {
  const { id } = await params;
  const result = await deleteJudgeAction(id);

  if (!result.success) throw actionError(result);

  return NextResponse.json({ success: true });
});