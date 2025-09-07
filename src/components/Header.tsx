const Header = () => {
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
        </div>
      </div>
    </header>
  );
};

export default Header;
