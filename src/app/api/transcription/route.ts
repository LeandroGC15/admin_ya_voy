import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

// Inicializar el cliente de ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    // Obtener el archivo de audio del FormData
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo de audio" },
        { status: 400 }
      );
    }

    // Obtener parámetros opcionales
    const modelId = (formData.get("modelId") as string) || "scribe_v1";
    const tagAudioEvents = formData.get("tagAudioEvents") === "true";
    const languageCodeParam = formData.get("languageCode") as string | null;
    const languageCode = languageCodeParam && languageCodeParam.trim() !== "" 
      ? languageCodeParam 
      : undefined; // undefined para detección automática
    const diarize = formData.get("diarize") === "true";

    // Convertir el File a Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type || "audio/mp3",
    });

    // Realizar la transcripción
    const transcription = await elevenlabs.speechToText.convert({
      file: audioBlob,
      modelId,
      tagAudioEvents,
      languageCode, // undefined para detección automática
      diarize,
    });

    return NextResponse.json(
      {
        success: true,
        data: transcription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en transcripción:", error);

    // Manejar errores específicos de ElevenLabs
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Error al procesar la transcripción",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error desconocido al procesar la transcripción" },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar el estado del servicio
export async function GET() {
  return NextResponse.json(
    {
      service: "transcription",
      status: "active",
      model: "scribe_v1",
      hasApiKey: !!process.env.ELEVENLABS_API_KEY,
    },
    { status: 200 }
  );
}

