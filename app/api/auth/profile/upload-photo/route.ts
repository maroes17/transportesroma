import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cloudinary from "@/lib/cloudinary";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET no está definida en las variables de entorno");
}

if (!process.env.CLOUDINARY_URL) {
  throw new Error("CLOUDINARY_URL no está definida en las variables de entorno");
}

export async function POST(request: Request) {
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

    // Obtener la imagen del body
    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se ha proporcionado ninguna imagen" },
        { status: 400 }
      );
    }

    // Verificar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir la imagen a Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "profile_photos",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("Error de Cloudinary:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const client = await clientPromise;
    const db = client.db();

    // Actualizar el usuario con la URL de la imagen
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.id) },
      { 
        $set: { 
          profilePhoto: (uploadResponse as any).secure_url,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: "Foto de perfil actualizada exitosamente",
      photoUrl: (uploadResponse as any).secure_url
    });

  } catch (error) {
    console.error("Error detallado al subir la foto de perfil:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { 
        error: "Error al subir la foto de perfil",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
} 