import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { UserRole } from "@/lib/auth/roles";

export async function POST(req: Request) {
  try {
    const { name, email, password, role = UserRole.USER } = await req.json();

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
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

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este correo electrónico" },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el nuevo usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Remover la contraseña del objeto de respuesta
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { message: "Usuario registrado exitosamente", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en el registro:", error);

    if (error instanceof Error) {
      // Error de conexión a MongoDB
      if (error.message.includes("Could not connect to any servers")) {
        return NextResponse.json(
          { 
            error: "Error de conexión con la base de datos. Por favor, verifica tu conexión a internet y la configuración de MongoDB Atlas.",
            details: "Asegúrate de que tu IP esté en la lista blanca de MongoDB Atlas"
          },
          { status: 503 }
        );
      }

      // Error de validación de Mongoose
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { 
            error: "Error de validación",
            details: error.message 
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: "Error al registrar el usuario",
        details: "Por favor, intenta nuevamente más tarde"
      },
      { status: 500 }
    );
  }
} 