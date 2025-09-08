'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

// Permisos disponibles en el sistema
const PERMISSIONS = [
  { id: 'report:read', label: 'Ver reportes' },
  { id: 'user:read', label: 'Ver usuarios' },
  { id: 'user:write', label: 'Gestionar usuarios' },
  { id: 'driver:read', label: 'Ver conductores' },
  { id: 'driver:write', label: 'Gestionar conductores' },
  { id: 'settings:write', label: 'Actualizar configuraciones' },
  { id: 'system:config', label: 'Configuración del sistema' },
];

// Permisos que se asignan a un super administrador
const SUPER_ADMIN_PERMISSIONS = PERMISSIONS.map(p => p.id);

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { handleRegister, loading, error } = useAuth();

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const userData = {
      name,
      email,
      password,
      permissions: isSuperAdmin 
        ? SUPER_ADMIN_PERMISSIONS
        : selectedPermissions,
      isSuperAdmin
    };
    
    console.log('Datos del formulario:', userData);
    await handleRegister(userData);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Admin Registration</h2>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: '10px', padding: '8px' }}
        />
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: '20px', padding: '8px' }}
        />

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={isSuperAdmin}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setIsSuperAdmin(isChecked);
                if (isChecked) {
                  setSelectedPermissions(SUPER_ADMIN_PERMISSIONS);
                } else {
                  setSelectedPermissions([]);
                }
              }}
              style={{ marginRight: '8px' }}
            />
            Super Administrador (todos los permisos)
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '10px' }}>Permisos:</p>
          {PERMISSIONS.map((permission) => (
            <div key={permission.id} style={{ marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={isSuperAdmin || selectedPermissions.includes(permission.id)}
                  disabled={isSuperAdmin}
                  onChange={() => handlePermissionChange(permission.id)}
                  style={{ marginRight: '8px' }}
                />
                {permission.label}
              </label>
            </div>
          ))}
        </div>

        {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: '10px', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Registrando...' : 'Registrar Administrador'}
        </button>
      </form>
    </div>
  );
};
