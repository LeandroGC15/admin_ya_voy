import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="hidden w-64 flex-shrink-0 bg-[#3F5B7F] md:block">
      <div className="flex h-16 items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-white">YaVoy!</h1>
      </div>
      <nav className="mt-6 flex flex-col gap-2 px-4">
        <Link href="/dashboard" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Dashboard
        </Link>
        <Link href="/dashboard/users" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Usuarios
        </Link>
        <Link href="/dashboard/drivers" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Conductores
        </Link>
        <Link href="/dashboard/orders" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Orders
        </Link>
        <Link href="/dashboard/products" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Products
        </Link>
        <Link href="/dashboard/customers" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Customers
        </Link>
        <Link href="/dashboard/settings" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Settings
        </Link>
        <Link href="/dashboard/metrics" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Metrics
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
