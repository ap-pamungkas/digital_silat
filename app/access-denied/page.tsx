import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata = {
  title: "Akses Ditolak | PAGAR Digital Silat",
};

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Akses Ditolak</h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8]">
            Akun Anda tidak memiliki izin untuk membuka halaman ini. Hubungi operator pertandingan bila
            Anda merasa ini keliru.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              Ke Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Ganti Akun
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}