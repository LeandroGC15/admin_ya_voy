'use client';

import { ThemeToggle } from "./ui/theme-toggle";
import { Input } from "./ui/input";
import { Bell, Menu, Search, DollarSign, Loader2, Info } from "lucide-react";
import { useLatestExchangeRate } from "@/features/exchange-rates";
import { useState } from "react";

const Header = () => {
  const { data: exchangeRate, isLoading, error } = useLatestExchangeRate();

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

        {/* USD Rate */}
        <div
          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 shadow-sm cursor-help hover:bg-muted/50 transition-colors relative group"
          title={
            exchangeRate && exchangeRate.rate
              ? `Precio del dólar: ${exchangeRate.rate.toFixed(2)} VES\nFuente: ${exchangeRate.casa || 'N/A'}\nActualizado: ${new Date(exchangeRate.fechaActualizacion || exchangeRate.createdAt).toLocaleString()}`
              : 'Precio del dólar no disponible'
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-medium text-muted-foreground">USD</span>
                <span className="text-sm font-bold text-foreground">Cargando...</span>
              </div>
            </>
          ) : error ? (
            <>
              <DollarSign className="h-4 w-4 text-red-500" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-medium text-muted-foreground">USD</span>
                <span className="text-sm font-bold text-red-500">Error</span>
              </div>
            </>
          ) : exchangeRate && exchangeRate.rate ? (
            <>
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-medium text-muted-foreground">USD</span>
                <span className="text-sm font-bold text-foreground">
                  ${exchangeRate.rate.toFixed(2)}
                </span>
              </div>
              <Info className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-medium text-muted-foreground">USD</span>
                <span className="text-sm font-bold text-yellow-500">N/A</span>
              </div>
            </>
          )}
        </div>

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
