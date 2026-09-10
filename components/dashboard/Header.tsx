"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  title?: string;
  tournamentName?: string;
}

export function Header({
  onOpenMobileSidebar,
  onToggleSidebar,
  isSidebarCollapsed = false,
  title = "Dashboard",
  tournamentName,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-[#273649] bg-white/95 dark:bg-[#051426]/95 backdrop-blur-md px-4 sm:px-6 transition-colors">
      {/* Left: Mobile & Desktop Sidebar Toggle + Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              onOpenMobileSidebar();
            } else if (onToggleSidebar) {
              onToggleSidebar();
            } else {
              onOpenMobileSidebar();
            }
          }}
          aria-label={isSidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          title={isSidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[#94a3b8] dark:hover:bg-[#1c2b3e] dark:hover:text-[#ffd165] transition-colors cursor-pointer"
        >
          {/* Mobile hamburger icon */}
          <Menu className="w-5 h-5 lg:hidden" />
          {/* Desktop collapse / expand icon */}
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 hidden lg:block" />
          ) : (
            <PanelLeftClose className="w-5 h-5 hidden lg:block" />
          )}
        </button>

        <div className="flex items-center text-sm font-medium text-slate-600 dark:text-[#d3c5ac]">
          <span className="hover:text-amber-600 dark:hover:text-[#ffd165] cursor-pointer transition-colors hidden xs:inline">
            Admin
          </span>
          <ChevronRight className="mx-2 w-4 h-4 text-slate-400 dark:text-[#94a3b8]" />
          <span className="text-amber-600 dark:text-[#ffd165] font-semibold truncate">{title}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Theme Toggle & Tournament Selector */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#94a3b8] group-focus-within:text-amber-600 dark:group-focus-within:text-[#ffd165] transition-colors" />
          <input
            type="text"
            placeholder="Cari..."
            className="w-52 lg:w-64 rounded-full border border-slate-200 dark:border-[#4f4633] bg-slate-50 dark:bg-[#0d1c2f] py-1.5 pl-9 pr-4 text-xs text-slate-900 dark:text-[#d5e3fd] placeholder-slate-400 dark:placeholder-[#94a3b8] focus:border-amber-500 dark:focus:border-[#ffd165] focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#ffd165] transition-all"
          />
        </div>

        <Link
          href="/judge"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#122033] hover:bg-slate-200 dark:hover:bg-[#1c2b3e] text-slate-700 dark:text-[#d3c5ac] hover:text-amber-600 dark:hover:text-[#ffd165] border border-slate-200 dark:border-[#273649] text-xs font-medium transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-[#ffd165]" />
          <span>Mode Juri</span>
        </Link>

        {/* Theme Toggle (Light / Dark / System) */}
        <ThemeToggle />

        <button
          type="button"
          className="relative p-2 rounded-full text-slate-600 dark:text-[#d3c5ac] hover:text-amber-600 dark:hover:text-[#ffd165] hover:bg-slate-100 dark:hover:bg-[#1c2b3e] transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-white dark:ring-[#051426]" />
        </button>

        {tournamentName ? (
          <>
            <div className="h-5 w-px bg-slate-200 dark:bg-[#273649] hidden sm:block mx-0.5" />
            <Link
              href="/tournaments"
              title="Kelola Kejuaraan"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0d1c2f] hover:bg-slate-200 dark:hover:bg-[#1c2b3e] border border-slate-200 dark:border-[#273649] text-xs text-slate-700 dark:text-[#d3c5ac] transition-colors"
            >
              <span className="font-medium text-slate-900 dark:text-[#d5e3fd] truncate max-w-[170px]">
                {tournamentName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#94a3b8] shrink-0" />
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
