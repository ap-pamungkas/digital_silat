import { NextResponse } from "next/server";
import { getJudges } from "@/lib/data-service";

export async function GET() {
  try {
    const list = await getJudges();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch judges" },
      { status: 500 }
    );
  }
}
