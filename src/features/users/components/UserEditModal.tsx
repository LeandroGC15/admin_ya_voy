'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/features/core/components';
import { useUpdateUser } from '../hooks/use-users';
import { updateUserSchema, type UpdateUserInput, type User } from '../schemas/user-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { invalidateQueries } from '@/lib/api/react-query-client';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

const userTypeOptions = [
  { value: 'passenger', label: 'Pasajero' },
  { value: 'driver', label: 'Conductor' },
];

export function UserEditModal({ isOpen, onClose, user, onSuccess }: UserEditModalProps) {
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: '',
      isActive: true,
      userType: 'passenger',
    },
  });

  const updateUserMutation = useUpdateUser();

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        isActive: user.isActive,
        userType: user.userType || 'passenger',
      });
    }
  }, [user, form]);

  const handleSubmit = (data: UpdateUserInput) => {
    if (!user) return;

    updateUserMutation.mutate(
      { id: user.id, data },
      {
        onSuccess: () => {
          onClose();
          invalidateQueries(['users']);
          onSuccess?.();
        },
      }
    );
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Usuario: ${user.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? 'Actualizando...' : 'Actualizar Usuario'}
          </Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Nombre completo del usuario"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="correo@ejemplo.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="+52 55 1234 5678"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="userType">Tipo de Usuario</Label>
            <Select
              value={form.watch('userType')}
              onValueChange={(value) => form.setValue('userType', value as 'passenger' | 'driver')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.userType && (
              <p className="text-sm text-red-500">{form.formState.errors.userType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              {...form.register('city')}
              placeholder="Ciudad de residencia"
            />
            {form.formState.errors.city && (
              <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              {...form.register('state')}
              placeholder="Estado o provincia"
            />
            {form.formState.errors.state && (
              <p className="text-sm text-red-500">{form.formState.errors.state.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              {...form.register('country')}
              placeholder="País de residencia"
            />
            {form.formState.errors.country && (
              <p className="text-sm text-red-500">{form.formState.errors.country.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              {...form.register('isActive')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">Usuario activo</Label>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Información Actual</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">ID:</span> {user.id}
            </div>
            <div>
              <span className="font-medium">Email verificado:</span> {user.emailVerified ? 'Sí' : 'No'}
            </div>
            <div>
              <span className="font-medium">Teléfono verificado:</span> {user.phoneVerified ? 'Sí' : 'No'}
            </div>
            <div>
              <span className="font-medium">Identidad verificada:</span> {user.identityVerified ? 'Sí' : 'No'}
            </div>
            <div>
              <span className="font-medium">Viajes totales:</span> {user.totalRides}
            </div>
            <div>
              <span className="font-medium">Viajes completados:</span> {user.completedRides}
            </div>
            <div>
              <span className="font-medium">Viajes cancelados:</span> {user.cancelledRides}
            </div>
            <div>
              <span className="font-medium">Calificación promedio:</span> {user.averageRating ? user.averageRating.toFixed(1) : 'N/A'} ⭐
            </div>
            {user.wallet && (
              <>
                <div>
                  <span className="font-medium">Saldo:</span> ${user.wallet.balance ? user.wallet.balance.toFixed(2) : '0.00'}
                </div>
                <div>
                  <span className="font-medium">Transacciones:</span> {user.wallet.totalTransactions || 0}
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default UserEditModal;
