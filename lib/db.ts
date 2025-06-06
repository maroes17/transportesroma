import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, define MONGODB_URI en el archivo .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Forzar IPv4
      ssl: true,
      retryWrites: true,
      retryReads: true,
    };

    console.log('Intentando conectar a MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Ocultar credenciales en logs

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Conexión exitosa a MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error al conectar con MongoDB:', e);
    
    // Mensaje de error más descriptivo
    const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
    if (errorMessage.includes('IP whitelist')) {
      throw new Error(
        'No se pudo conectar a MongoDB Atlas. Tu IP actual no está en la lista blanca. ' +
        'Por favor, agrega tu IP (179.60.65.103) a la lista blanca en MongoDB Atlas: ' +
        'https://cloud.mongodb.com -> Network Access -> Add IP Address'
      );
    }
    
    throw new Error(
      'Error de conexión con MongoDB Atlas. Por favor, verifica:\n' +
      '1. Tu conexión a internet\n' +
      '2. Que tu IP esté en la lista blanca de MongoDB Atlas\n' +
      '3. Que las credenciales en .env.local sean correctas\n' +
      'Error específico: ' + errorMessage
    );
  }

  return cached.conn;
} 