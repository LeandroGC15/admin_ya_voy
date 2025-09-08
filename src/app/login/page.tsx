import { LoginForm } from '@/features/auth/components/login-form';
import Image from 'next/image';
import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ya Voy</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Sistema de administración</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
