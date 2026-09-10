import { NextResponse } from "next/server";
import { getArenas } from "@/lib/data-service";

export async function GET() {
  try {
    const list = await getArenas();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch arenas" },
      { status: 500 }
    );
  }
}
