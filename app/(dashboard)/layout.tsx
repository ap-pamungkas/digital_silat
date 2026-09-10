"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { ScoringProvider } from "@/context/ScoringContext";
import { ToastProvider } from "@/components/ui/Toast";
import { useDashboard } from "@/hooks/use-dashboard";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggleCollapse, mobileOpen, openMobile, closeMobile } = useSidebar();
  const { tournament } = useDashboard();

  const activeTournamentName =
    tournament && tournament.id && tournament.id !== "TOUR-DEFAULT" && tournament.name && tournament.name !== "Turnamen Pencak Silat"
      ? tournament.name
      : undefined;

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <Sidebar
        isOpenMobile={mobileOpen}
        onCloseMobile={closeMobile}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
        <Header
          onOpenMobileSidebar={openMobile}
          onToggleSidebar={toggleCollapse}
          isSidebarCollapsed={isCollapsed}
          tournamentName={activeTournamentName}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ScoringProvider>
        <ToastProvider>
          <DashboardContent>{children}</DashboardContent>
        </ToastProvider>
      </ScoringProvider>
    </SidebarProvider>
  );
}
