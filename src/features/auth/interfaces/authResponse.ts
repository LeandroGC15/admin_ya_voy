export interface AdminUser {
    id: number;
    name: string;
    email: string;
    userType: string;
    adminRole: string;
    adminPermissions: string[];
    lastAdminLogin: string;
  }
  
  export interface AuthResponseData {
    accessToken: string;
    refreshToken: string;
    admin: AdminUser;
    expiresIn: number;
  }
  