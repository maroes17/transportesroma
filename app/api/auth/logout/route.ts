import { NextResponse } from "next/server";

export async function POST() {
  try {
    // En una implementación real, podrías invalidar el token en el servidor
    // o agregarlo a una lista negra de tokens
    
    return NextResponse.json(
      { message: "Sesión cerrada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
} 