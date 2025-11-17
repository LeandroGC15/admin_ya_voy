import { ENDPOINTS } from '@/lib/endpoints';

export interface TranscriptionOptions {
  modelId?: string;
  tagAudioEvents?: boolean;
  languageCode?: string;
  diarize?: boolean;
}

export interface TranscriptionResponse {
  success: boolean;
  data: {
    text: string;
    // Otros campos que retorne ElevenLabs
    [key: string]: unknown;
  };
}

export interface TranscriptionError {
  error: string;
  message?: string;
}

/**
 * Transcribe un archivo de audio usando ElevenLabs
 * @param audioFile - Archivo de audio a transcribir
 * @param options - Opciones de transcripción
 * @returns Respuesta con la transcripción
 */
export const transcribeAudio = async (
  audioFile: File,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    if (options.modelId) {
      formData.append('modelId', options.modelId);
    }
    if (options.tagAudioEvents !== undefined) {
      formData.append('tagAudioEvents', String(options.tagAudioEvents));
    }
    if (options.languageCode) {
      formData.append('languageCode', options.languageCode);
    }
    if (options.diarize !== undefined) {
      formData.append('diarize', String(options.diarize));
    }

    const response = await fetch(ENDPOINTS.transcription.base, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error: TranscriptionError = await response.json();
      throw new Error(error.message || error.error || 'Error al transcribir el audio');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en transcripción:', error);
    throw error;
  }
};

