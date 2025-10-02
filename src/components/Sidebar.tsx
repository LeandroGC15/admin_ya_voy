'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <aside className="hidden w-64 flex-shrink-0 bg-[#3F5B7F] md:block">
      <div className="flex h-16 items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-primary">YaVoy!</h1>
      </div>
      <nav className="mt-6 flex flex-col gap-2 px-4">
        {/* Dashboard */}
        <Link href="/dashboard" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
          Dashboard
        </Link>

        {/* Gestión de Usuarios */}
        <div className="border-t border-[#5C7E9F] pt-2">
          <h3 className="px-4 py-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Gestión
          </h3>
          <Link href="/dashboard/users" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
            Usuarios
          </Link>
          <Link href="/dashboard/drivers" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
            Conductores
          </Link>
        </div>

        {/* Configuración - Expandible */}
        <div className="border-t border-[#5C7E9F] pt-2">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="flex w-full items-center justify-between rounded-md px-4 py-2.5 text-left text-gray-200 hover:bg-[#5C7E9F] hover:text-white"
          >
            <span className="text-sm font-semibold uppercase tracking-wide">Configuración</span>
            {isConfigOpen ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>

          {isConfigOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <Link href="/dashboard/config" className="block rounded-md px-4 py-2 text-sm text-gray-200 hover:bg-[#5C7E9F] hover:text-white font-medium">
                 Panel de Configuración
              </Link>
              <Link href="/dashboard/config/general" className="block rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-[#5C7E9F] hover:text-white">
                 Configuraciones Generales
              </Link>
              <Link href="/dashboard/config/pricing" className="block rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-[#5C7E9F] hover:text-white">
                 Pricing
              </Link>
              <Link href="/dashboard/config/reports" className="block rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-[#5C7E9F] hover:text-white">
                 Reportes y Analytics
              </Link>
              <Link href="/dashboard/config/geography" className="block rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-[#5C7E9F] hover:text-white">
                 Panel Geográfico
              </Link>
              <Link href="/dashboard/config/geography/countries" className="block rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-[#5C7E9F] hover:text-white">
                 • Países
              </Link>
            </div>
          )}
        </div>

        {/* Métricas */}
        <div className="border-t border-[#5C7E9F] pt-2">
          <Link href="/dashboard/metrics" className="block rounded-md px-4 py-2.5 text-gray-200 hover:bg-[#5C7E9F] hover:text-white">
            Métricas
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
