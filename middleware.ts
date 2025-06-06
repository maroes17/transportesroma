import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from './lib/auth/roles';

export async function middleware(req: Request) {
  console.log('Middleware ejecutándose para:', req.url);
  
  // Verificar el header de autorización
  const authHeader = req.headers.get('authorization');
  console.log('Header de autorización:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Header de autorización inválido o faltante');
    return NextResponse.json(
      { error: 'No autorizado - Header de autorización inválido' },
      { status: 401 }
    );
  }

  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
      raw: true
    });
    
    console.log('Token recibido:', token);
    
    if (!token) {
      console.log('No se encontró token');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Decodificar el token JWT
    const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Datos del token:', tokenData);
    
    const userRole = tokenData.role as UserRole;
    console.log('Rol del usuario:', userRole);

    // Rutas protegidas que requieren autenticación
    if (req.url.includes('/api/protected')) {
      // Verificar roles específicos para ciertas rutas
      if (req.url.includes('/api/protected/admin') && userRole !== UserRole.ADMIN) {
        console.log('Acceso denegado: Se requiere rol de administrador');
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }

      if (req.url.includes('/api/protected/driver') && userRole !== UserRole.DRIVER) {
        console.log('Acceso denegado: Se requiere rol de conductor');
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }

      if (req.url.includes('/api/protected/dispatcher') && userRole !== UserRole.DISPATCHER) {
        console.log('Acceso denegado: Se requiere rol de despachador');
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error al procesar el token:', error);
    return NextResponse.json(
      { error: 'Error al procesar el token' },
      { status: 401 }
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