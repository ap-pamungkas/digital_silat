import { redirect } from "next/navigation";
import type * as React from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OPERATOR_ROLES, getSessionUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (!OPERATOR_ROLES.includes(user.role)) {
    redirect(user.role === "JUDGE" ? "/judge" : "/access-denied");
  }

  return <DashboardShell user={{ name: user.name, role: user.role }}>{children}</DashboardShell>;
}