import { NextResponse } from "next/server";
import { getMatches, createMatchAction, updateMatchStatusAction } from "@/lib/data-service";

export async function GET() {
  try {
    const list = await getMatches();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createMatchAction(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create match" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const result = await updateMatchStatusAction(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update match" },
      { status: 500 }
    );
  }
}
