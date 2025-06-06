import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { UserRole } from './lib/auth/roles';

export async function middleware(req: Request) {
  try {
    const session = await auth();
    
    // Si no hay sesión y la ruta es protegida, redirigir al login
    if (!session) {
      if (req.url.includes('/api/protected') || req.url.includes('/dashboard')) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    const userRole = session.user.role as UserRole;

    // Verificar permisos para rutas protegidas
    if (req.url.includes('/api/protected')) {
      if (req.url.includes('/api/protected/admin') && userRole !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }

      if (req.url.includes('/api/protected/driver') && userRole !== UserRole.DRIVER) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }

      if (req.url.includes('/api/protected/dispatcher') && userRole !== UserRole.DISPATCHER) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error en middleware:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/api/protected/:path*',
    '/dashboard/:path*',
    '/profile/:path*'
  ]
}; 