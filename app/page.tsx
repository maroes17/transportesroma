import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Sección izquierda - Formulario de login */}
      <div className="w-full md:w-1/3 bg-gradient-to-b from-white to-gray-50 p-8 md:p-12 flex flex-col justify-between">
        <div className="max-w-sm mx-auto w-full space-y-10">
          {/* Logo y título */}
          <div className="text-center space-y-6">
            <div className="relative w-48 h-20 mx-auto">
              <Image
                src="/images/logos/LogoRomanesco.png"
                alt="Transportes Roma"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 leading-tight">
              ¡Te damos la bienvenida a la Gestión de Flotas!
            </h1>
          </div>

          {/* Formulario de login */}
          <LoginForm />
        </div>

        {/* Copyright */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Creado por empresa Transportes Romanesco
        </p>
      </div>

      {/* Sección derecha - Imagen de fondo */}
      <div className="w-full md:w-2/3 relative hidden md:block">
        <Image
          src="/images/backgrounds/bg_sesion.jpg"
          alt="Carretera con vehículos"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>
    </main>
  );
}
