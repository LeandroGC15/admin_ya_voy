'use client';

import { ThemeToggle } from "./ui/theme-toggle";
import { Input } from "./ui/input";
import { Bell, Menu, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      {/* Left side: mobile menu + search (desktop) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menú"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-muted md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." className="w-72 pl-9" />
        </div>
      </div>

      {/* Right side: notifications, theme, user */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          type="button"
          aria-label="Notificaciones"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
        </button>

        <ThemeToggle />

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted" />
          <div className="hidden leading-tight sm:block">
            <p className="font-semibold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
