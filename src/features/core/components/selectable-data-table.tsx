'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface SelectableDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  
  // Selección múltiple
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (selectedItems: T[]) => void;
  getItemId?: (item: T) => string | number;
  selectAllLabel?: string;
}

export function SelectableDataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  actions,
  emptyMessage = 'No hay datos disponibles',
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId = (item: T) => item.id,
  selectAllLabel = 'Seleccionar todo',
}: SelectableDataTableProps<T>) {
  
  // Manejar selección individual
  const handleItemSelect = (item: T, checked: boolean) => {
    if (!onSelectionChange) return;
    
    const itemId = getItemId(item);
    const isSelected = selectedItems.some(selected => getItemId(selected) === itemId);
    
    if (checked && !isSelected) {
      onSelectionChange([...selectedItems, item]);
    } else if (!checked && isSelected) {
      onSelectionChange(selectedItems.filter(selected => getItemId(selected) !== itemId));
    }
  };

  // Manejar selección de todos
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...data]);
    } else {
      onSelectionChange([]);
    }
  };

  // Verificar si un item está seleccionado
  const isItemSelected = (item: T) => {
    const itemId = getItemId(item);
    return selectedItems.some(selected => getItemId(selected) === itemId);
  };

  // Verificar si todos los items están seleccionados
  const isAllSelected = data.length > 0 && data.every(item => isItemSelected(item));
  
  // Verificar si algunos items están seleccionados (estado indeterminado)
  const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isIndeterminate;
                      }
                    }}
                    aria-label={selectAllLabel}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.header}</TableHead>
              ))}
              {actions && <TableHead className="w-[100px]">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const itemId = getItemId(row);
              const isSelected = isItemSelected(row);
              
              return (
                <TableRow 
                  key={itemId} 
                  className={isSelected ? 'bg-blue-50' : ''}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleItemSelect(row, checked as boolean)}
                        aria-label={`Seleccionar ${itemId}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')
                      }
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {data.length} de {pagination.totalItems} elementos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

