import { redirect } from "next/navigation";
import { getMatches } from "@/lib/data-service";

export const dynamic = "force-dynamic";

export default async function LiveScoringIndexPage() {
  const matches = await getMatches();
  const match = matches.find((item) => item.status === "LIVE") ?? matches[0];

  redirect(match ? `/live-scoring/${match.id}` : "/matches");
}
