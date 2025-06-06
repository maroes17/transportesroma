import { NextResponse } from "next/server";
import { auth } from '@/lib/auth-edge';
import { UserRole } from './lib/auth/roles';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};

export async function middleware(req: Request) {
  try {
    const session = await auth();
    const isApiRoute = req.url.includes('/api/');
    const isProtectedRoute = req.url.includes('/dashboard') || req.url.includes('/api/protected');

    // Si no hay sesión y es una ruta protegida, redirigir al login
    if (!session && isProtectedRoute) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Si hay sesión y es una ruta pública, redirigir al dashboard
    if (session && !isProtectedRoute && !isApiRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Verificar permisos para rutas protegidas
    if (session && req.url.includes('/api/protected')) {
      const userRole = session.user.role as UserRole;

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