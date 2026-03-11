import Link from "next/link";
import { Database } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/admin/db"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <Database className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">DB Dashboard</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/admin/db/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Overview
          </Link>
        </nav>
      </div>
    </header>
  );
}
