import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET no está definida en las variables de entorno");
}

export async function PUT(request: Request) {
  try {
    // Verificar token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      email: string;
    };

    // Obtener datos actualizados
    const { name, email } = await request.json();

    // Validaciones básicas
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verificar si el nuevo email ya está en uso por otro usuario
    if (email !== decoded.email) {
      const existingUser = await db.collection("users").findOne({ 
        email,
        _id: { $ne: new ObjectId(decoded.id) }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "El email ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Actualizar usuario
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.id) },
      { 
        $set: { 
          name,
          email,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Perfil actualizado exitosamente",
      user: {
        id: decoded.id,
        name,
        email
      }
    });

  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
} 