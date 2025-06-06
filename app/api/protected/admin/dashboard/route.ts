import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/lib/auth/roles';

export async function GET(req: Request) {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado - Header de autorización inválido' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Token recibido en dashboard:', token);

    // Decodificar el token JWT
    const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Datos del token decodificado:', tokenData);

    const userRole = tokenData.role as UserRole;
    console.log('Rol del usuario en dashboard:', userRole);

    if (userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Acceso denegado - Se requiere rol de administrador' },
        { status: 403 }
      );
    }

    // Datos de ejemplo para el dashboard
    const dashboardData = {
      totalUsers: 150,
      activeDrivers: 45,
      pendingRoutes: 12,
      recentActivity: [
        { id: 1, action: 'Nuevo conductor registrado', timestamp: new Date() },
        { id: 2, action: 'Ruta completada', timestamp: new Date() },
        { id: 3, action: 'Actualización de perfil', timestamp: new Date() }
      ]
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error en dashboard:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 