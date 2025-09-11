'use client';

interface HeaderProps {
  onAdminAction?: (action: string) => void;
}
import { ThemeToggle } from "./ui/theme-toggle";

const Header = ({ onAdminAction }: HeaderProps) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onAdminAction) {
      onAdminAction(event.target.value);
      event.target.value = ""; // Resetear el select después de la acción
    }
  };

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
          <select
            className="ml-4 rounded-md border border-input bg-muted px-3 py-1 text-sm text-foreground"
            onChange={handleSelectChange}
            value=""
          >
            <option value="" disabled>Acciones Admin</option>
            <option value="create-user">Crear Usuario</option>
            <option value="search-user">Buscar Usuario por Email</option>
            <option value="update-user">Actualizar Usuario</option>
            <option value="delete-user">Eliminar Usuario</option>
            <option value="register-driver">Registrar Conductor</option>
            <option value="search-driver">Buscar Conductor</option>
            <option value="delete-driver-by-id">Eliminar Conductor</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
