'use client';

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState } from 'react';
import UserCreationForm from '@/features/users/components/UserCreationForm';
import UserSearchForm from '@/features/users/components/UserSearchForm';
import UserDeleteForm from '@/features/users/components/UserDeleteForm';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showUserCreationForm, setShowUserCreationForm] = useState(false);
  const [showUserSearchForm, setShowUserSearchForm] = useState(false);
  const [showUserDeleteForm, setShowUserDeleteForm] = useState(false);

  const handleAdminAction = (action: string) => {
    // Cerrar todos los formularios antes de abrir uno nuevo
    setShowUserCreationForm(false);
    setShowUserSearchForm(false);
    setShowUserDeleteForm(false);

    if (action === 'create-user') {
      setShowUserCreationForm(true);
    } else if (action === 'search-user') {
      setShowUserSearchForm(true);
    } else if (action === 'delete-user') {
      setShowUserDeleteForm(true);
    } else {
      console.log('Acción administrativa seleccionada:', action);
    }
  };

  const handleUserCreated = () => {
    setShowUserCreationForm(false);
    console.log('Usuario creado y formulario cerrado.');
  };

  const handleUserDeleted = () => {
    setShowUserDeleteForm(false);
    console.log('Usuario eliminado y formulario cerrado.');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onAdminAction={handleAdminAction} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
      {showUserCreationForm && (
        <UserCreationForm 
          onClose={() => setShowUserCreationForm(false)}
          onUserCreated={handleUserCreated}
        />
      )}
      {showUserSearchForm && (
        <UserSearchForm 
          onClose={() => setShowUserSearchForm(false)}
        />
      )}
      {showUserDeleteForm && (
        <UserDeleteForm 
          onClose={() => setShowUserDeleteForm(false)}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
}
