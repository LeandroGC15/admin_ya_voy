import axios from 'axios';

const API_URL = 'http://72.60.119.19:3001';

export const loginAdmin = async (credentials: any) => {
  try {
    const response = await axios.post(`${API_URL}/admin/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mapeo de permisos del frontend al backend
const mapPermissions = (permissions: string[]): string[] => {
  return permissions.map(perm => {
    switch(perm) {
      case 'REPORTS_VIEW': return 'report:read';
      case 'USERS_MANAGE': return 'user:write';
      case 'SETTINGS_UPDATE': return 'settings:write';
      case 'SYSTEM_CONFIG': return 'system:config';
      default: return perm;
    }
  });
};

export const registerAdmin = async (userData: any) => {
  try {
    // Determinar permisos basado en si es super admin o no
    const permissions = userData.isSuperAdmin 
      ? ['report:read', 'user:read', 'user:write', 'driver:read', 'driver:write', 'settings:write', 'system:config']
      : mapPermissions(userData.permissions || []);
    
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      adminRole: 'admin',
      adminPermissions: permissions,
      isActive: true
    };
    
    console.log('Enviando datos de registro al backend:', JSON.stringify(payload, null, 2));
    
    console.log('Enviando datos de registro:', payload);
    
    const response = await axios.post(`${API_URL}/api/auth/register`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error en el registro:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al registrar el administrador');
  }
};
