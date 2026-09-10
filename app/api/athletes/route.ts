import { NextResponse } from "next/server";
import { getAthletes, createAthleteAction } from "@/lib/data-service";

export async function GET() {
  try {
    const athletes = await getAthletes();
    return NextResponse.json(athletes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch athletes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createAthleteAction({
      name: body.name,
      contingentName: body.contingent,
      contingentCode: body.contingentCode,
      gender: body.gender,
      weightClassName: body.weightClass,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create athlete" },
      { status: 500 }
    );
  }
}
