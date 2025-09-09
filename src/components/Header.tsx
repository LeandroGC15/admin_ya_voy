'use client';

interface HeaderProps {
  onAdminAction?: (action: string) => void;
}

const Header = ({ onAdminAction }: HeaderProps) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onAdminAction) {
      onAdminAction(event.target.value);
      event.target.value = ""; // Resetear el select después de la acción
    }
  };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-6 dark:border-gray-700 dark:bg-gray-800 md:px-8">
      <div>
        {/* Mobile menu button can go here */}
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="hidden rounded-md border bg-gray-100 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 md:block"
        />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
          </div>
          <select
            className="ml-4 rounded-md border bg-gray-100 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            onChange={handleSelectChange}
            value=""
          >
            <option value="" disabled>Acciones Admin</option>
            <option value="create-user">Crear Usuario</option>
            <option value="search-user">Buscar Usuario por Email</option>
            <option value="delete-user">Eliminar Usuario</option>
            <option value="register-driver">Registrar Conductor</option>
            <option value="delete-driver-by-id">Eliminar Conductor</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
