'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useUploadTierImage } from '../../hooks/use-pricing';

interface TierImageUploadProps {
  tierId?: number; // Opcional para modo creación
  currentImageUrl?: string;
  onImageUploaded?: (imageUrl: string) => void;
  onImageRemoved?: () => void;
}

export function TierImageUpload({
  tierId,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
}: TierImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useUploadTierImage();

  // Update preview when currentImageUrl changes
  useEffect(() => {
    if (currentImageUrl && !selectedFile) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl, selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.');
      return;
    }

    // Validar tamaño (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es muy grande. El tamaño máximo es 2MB.');
      return;
    }

    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !tierId) {
      setError('Por favor selecciona un archivo y asegúrate de que el tier esté guardado.');
      return;
    }

    setError(null);

    try {
      const result = await uploadMutation.mutateAsync({ tierId, file: selectedFile });
      onImageUploaded?.(result.imageUrl || '');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen. Por favor intenta de nuevo.');
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    onImageRemoved?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Imagen del Tier</Label>
        <p className="text-sm text-gray-500">
          Esta imagen se mostrará en la aplicación móvil cuando los usuarios seleccionen el tipo de vehículo.
        </p>
        
        {/* Preview */}
        {preview && (
          <div className="relative w-full max-w-xs mx-auto">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-contain rounded-lg border-2 border-gray-300 bg-gray-50 p-2"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
              disabled={uploadMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upload Button */}
        {!preview && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Haz clic para seleccionar una imagen
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG o WebP (máx. 2MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Upload Action */}
        {selectedFile && tierId && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir Imagen
              </>
            )}
          </Button>
        )}

        {/* Info for new tiers */}
        {!tierId && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>Primero guarda el tier, luego podrás subir una imagen.</span>
          </div>
        )}
      </div>
    </div>
  );
}

