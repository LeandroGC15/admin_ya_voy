'use client';

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState } from 'react';
import UserCreationForm from '@/features/users/components/UserCreationForm';
import UserSearchForm from '@/features/users/components/UserSearchForm';
import UserDeleteForm from '@/features/users/components/UserDeleteForm';
import DriverRegisterForm from '@/features/drivers/components/DriverRegisterForm';
import DriverDeleteForm from '@/features/drivers/components/DriverDeleteForm'; // Nueva importación
import DriverSearchForm from '@/features/drivers/components/DriverSearchForm'; // Nueva importación
import UserUpdateForm from '@/features/users/components/UserUpdateForm'; // Nueva importación

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showUserCreationForm, setShowUserCreationForm] = useState(false);
  const [showUserSearchForm, setShowUserSearchForm] = useState(false);
  const [showUserDeleteForm, setShowUserDeleteForm] = useState(false);
  const [showDriverRegisterForm, setShowDriverRegisterForm] = useState(false);
  const [showDriverDeleteForm, setShowDriverDeleteForm] = useState(false); // Nuevo estado
  const [showDriverSearchForm, setShowDriverSearchForm] = useState(false); // Nuevo estado
  const [showUserUpdateForm, setShowUserUpdateForm] = useState(false); // Nuevo estado
  // const [userToUpdate, setUserToUpdate] = useState<any>(null); // Eliminado

  const closeAllForms = () => {
    setShowUserCreationForm(false);
    setShowUserSearchForm(false);
    setShowUserDeleteForm(false);
    setShowDriverRegisterForm(false);
    setShowDriverDeleteForm(false); // Cerrar este también
    setShowDriverSearchForm(false); // Cerrar este también
    setShowUserUpdateForm(false); // Cerrar este también
    // setUserToUpdate(null); // Eliminado
  };

  const handleAdminAction = (action: string) => {
    closeAllForms(); // Cerrar todos los formularios antes de abrir uno nuevo

    if (action === 'create-user') {
      setShowUserCreationForm(true);
    } else if (action === 'search-user') {
      setShowUserSearchForm(true);
    } else if (action === 'delete-user') {
      setShowUserDeleteForm(true);
    } else if (action === 'register-driver') {
      setShowDriverRegisterForm(true);
    } else if (action === 'delete-driver-by-id') { // Nueva acción
      setShowDriverDeleteForm(true);
    } else if (action === 'search-driver') { // Nueva acción
      setShowDriverSearchForm(true);
    } else if (action === 'update-user') { // Nueva acción para actualizar usuario
      setShowUserUpdateForm(true); // Abre directamente el UserUpdateForm
    }
    // ... manejar otras acciones administrativas aquí
    console.log('Acción administrativa seleccionada:', action);
  };

  const handleUserSelectedForUpdate = (user: any) => {
    closeAllForms();
    // setUserToUpdate(user); // Eliminado
    setShowUserUpdateForm(true); // Se abre el formulario de actualización con el usuario ya identificado
  };

  const handleUserCreated = () => {
    setShowUserCreationForm(false);
    console.log('Usuario creado y formulario cerrado.');
  };

  const handleUserDeleted = () => {
    setShowUserDeleteForm(false);
    console.log('Usuario eliminado y formulario cerrado.');
  };

  const handleUserUpdated = () => {
    setShowUserUpdateForm(false);
    // setUserToUpdate(null); // Eliminado
    // Opcional: Recargar la lista de usuarios en UserSearchForm si está abierto
    // Para esto, UserSearchForm necesitaría una prop para recargar o una forma de escuchar este evento.
    console.log('Usuario actualizado y formulario cerrado.');
  };

  const handleDriverRegistered = () => {
    setShowDriverRegisterForm(false);
    console.log('Conductor registrado y formulario cerrado.');
  };

  const handleDriverDeleted = () => { // Nuevo callback
    setShowDriverDeleteForm(false);
    console.log('Conductor eliminado y formulario cerrado.');
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
          onSelectUserForUpdate={handleUserSelectedForUpdate} // Pasar la nueva prop
        />
      )}
      {showUserDeleteForm && (
        <UserDeleteForm 
          onClose={() => setShowUserDeleteForm(false)}
          onUserDeleted={handleUserDeleted}
        />
      )}
      {showUserUpdateForm && (
        <UserUpdateForm
          onClose={() => handleUserUpdated()}
          onUserUpdated={handleUserUpdated}
        />
      )}
      {showDriverRegisterForm && (
        <DriverRegisterForm
          onClose={() => setShowDriverRegisterForm(false)}
          onDriverRegistered={handleDriverRegistered}
        />
      )}
      {showDriverDeleteForm && ( // Renderizado condicional
        <DriverDeleteForm
          onClose={() => setShowDriverDeleteForm(false)}
          onDriverDeleted={handleDriverDeleted}
        />
      )}
      {showDriverSearchForm && (
        <DriverSearchForm
          onClose={() => setShowDriverSearchForm(false)}
        />
      )}
    </div>
  );
}
