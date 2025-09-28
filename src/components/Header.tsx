'use client';

import { ThemeToggle } from "./ui/theme-toggle";

const Header = () => {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-card px-6 md:px-8">
      <div>
        {/* Mobile menu button can go here */}
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="hidden rounded-md border border-input bg-muted px-4 py-2 text-sm text-foreground md:block"
        />
        <ThemeToggle />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted"></div>
          <div>
            <p className="font-semibold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
