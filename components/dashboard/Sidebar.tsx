"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  User,
  Users,
  Swords,
  Layers,
  FileSpreadsheet,
  Printer,
  Settings,
  Tv,
  Cast,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  className,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Data Turnamen", href: "/tournaments", icon: Trophy },
    { label: "Atlet & Kontingen", href: "/athletes", icon: User },
    { label: "Jadwal Pertandingan", href: "/matches", icon: Swords },
    { label: "Gelanggang & Juri", href: "/arenas", icon: Layers },
    { label: "Dokumen & Cetak", href: "/reports", icon: Printer },
    { label: "Pengaturan", href: "/settings", icon: Settings },
  ];

  const externalPortals = [
    { label: "Mode Juri (Mobile)", href: "/judge", icon: Smartphone },
    { label: "Layar TV Scoreboard", href: "/display/ARENA-01", icon: Tv, target: "_blank" },
    { label: "OBS Streaming Overlay", href: "/overlay/ARENA-01", icon: Cast, target: "_blank" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-[#273649] bg-white dark:bg-[#0d1c2f] transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:max-h-screen shrink-0",
          // Mobile state
          isOpenMobile ? "translate-x-0 w-72 p-5" : "-translate-x-full lg:translate-x-0",
          // Desktop state
          isCollapsed ? "lg:w-20 lg:p-3.5" : "lg:w-72 lg:p-5",
          className
        )}
      >
        {/* Brand Header */}
        <div className={cn("flex flex-col mb-6 shrink-0", isCollapsed && "lg:items-center")}>
          <div className="flex items-center justify-between w-full">
            <Link
              href="/dashboard"
              className={cn("flex items-center gap-3 group", isCollapsed && "lg:justify-center")}
              title="PAGAR - Dashboard"
            >
              <div className="w-10 h-10 bg-[#eab308] rounded-xl flex items-center justify-center text-[#604700] font-black text-xl shadow-xs transition-transform group-hover:scale-105 shrink-0">
                P
              </div>
              {!isCollapsed && (
                <div className="min-w-0 transition-opacity duration-200">
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-[#ffd165] tracking-tight leading-none truncate">
                    PAGAR
                  </h1>
                  <p className="text-[11px] text-slate-500 dark:text-[#d3c5ac] mt-1 font-medium truncate">
                    Sistem Scoring Pencak Silat
                  </p>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              aria-label="Tutup menu"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-[#94a3b8] dark:hover:text-[#ffd165] dark:hover:bg-[#1c2b3e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isCollapsed && (
            <div className="mt-3.5 inline-flex px-2.5 py-1 bg-slate-100 dark:bg-[#273649] rounded-md text-[10px] font-bold text-slate-700 dark:text-[#d5e3fd] tracking-wider w-fit border border-slate-200 dark:border-[#4f4633] transition-all">
              ALE-ALE EDITION
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 overflow-x-hidden">
          {!isCollapsed ? (
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94a3b8]">
              Menu Utama
            </div>
          ) : (
            <div className="hidden lg:block my-2 h-px bg-slate-200 dark:bg-[#273649]/60" />
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all group active:scale-[0.98]",
                  isCollapsed
                    ? "lg:justify-center lg:p-2.5 px-3.5 py-2.5 gap-3"
                    : "gap-3 px-3.5 py-2.5",
                  isActive
                    ? "bg-amber-50 text-amber-700 dark:bg-[#273649] dark:text-[#ffd165] font-bold shadow-xs border border-amber-200 dark:border-[#4f4633]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#d3c5ac] dark:hover:text-[#d5e3fd] dark:hover:bg-[#1c2b3e]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive
                      ? "text-amber-600 dark:text-[#ffd165]"
                      : "text-slate-400 dark:text-[#94a3b8] group-hover:text-amber-600 dark:group-hover:text-[#ffd165]"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* External Portals Section */}
          <div className={cn("pt-3 border-t border-slate-200 dark:border-[#273649]/60", isCollapsed ? "mt-3" : "mt-6")}>
            {!isCollapsed ? (
              <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#94a3b8]">
                Portal Pertandingan
              </div>
            ) : (
              <div className="hidden lg:block mb-2 h-px bg-slate-200 dark:bg-[#273649]/60" />
            )}

            {externalPortals.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.target}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-lg text-xs font-medium text-slate-600 dark:text-[#d3c5ac] hover:bg-slate-100 dark:hover:bg-[#1c2b3e] hover:text-amber-600 dark:hover:text-[#ffd165] transition-colors group",
                    isCollapsed
                      ? "lg:justify-center lg:p-2.5 px-3.5 py-2 justify-between"
                      : "justify-between px-3.5 py-2"
                  )}
                >
                  <div className={cn("flex items-center gap-2.5", isCollapsed && "lg:justify-center")}>
                    <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-[#94a3b8] group-hover:text-amber-600 dark:group-hover:text-[#ffd165] transition-colors" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.target === "_blank" && (
                    <ExternalLink className="w-3 h-3 text-slate-400 dark:text-[#94a3b8] opacity-60 group-hover:opacity-100 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Profile & Collapse Toggle */}
        <div className="mt-auto pt-3 border-t border-slate-200 dark:border-[#273649] shrink-0 space-y-2">
          {/* Profile Card */}
          <div
            title="Agustinus (Administrator)"
            className={cn(
              "flex items-center rounded-xl bg-slate-50 dark:bg-[#122033]/60 hover:bg-slate-100 dark:hover:bg-[#1c2b3e] transition-colors cursor-pointer border border-slate-200 dark:border-[#273649]",
              isCollapsed ? "lg:justify-center lg:p-2 p-2.5 gap-3" : "px-2.5 py-2 gap-3"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#273649] flex items-center justify-center border border-slate-300 dark:border-[#4f4633] text-amber-700 dark:text-[#ffd165] font-bold text-xs shrink-0">
              AG
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-[#d5e3fd] truncate">Agustinus</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#d3c5ac] truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                    Administrator
                  </p>
                </div>
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-[#ffd165] shrink-0" />
              </>
            )}
          </div>

          {/* Desktop Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
              title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
              className={cn(
                "hidden lg:flex items-center rounded-lg text-xs font-medium text-slate-500 dark:text-[#94a3b8] hover:text-amber-600 dark:hover:text-[#ffd165] hover:bg-slate-100 dark:hover:bg-[#1c2b3e] transition-colors cursor-pointer w-full py-2",
                isCollapsed ? "justify-center px-0" : "px-3 gap-2"
              )}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0" />
                  <span className="truncate">Tutup Menu</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

