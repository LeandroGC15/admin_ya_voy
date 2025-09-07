import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="hidden w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg md:block">
      <div className="flex h-16 items-center justify-center border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">YaVoy!</h1>
      </div>
      <nav className="mt-6 flex flex-col gap-2 px-4">
        <Link href="/dashboard" className="block rounded-md px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          Dashboard
        </Link>
        <Link href="/dashboard/orders" className="block rounded-md px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          Orders
        </Link>
        <Link href="/dashboard/products" className="block rounded-md px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          Products
        </Link>
        <Link href="/dashboard/customers" className="block rounded-md px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          Customers
        </Link>
        <Link href="/dashboard/settings" className="block rounded-md px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
