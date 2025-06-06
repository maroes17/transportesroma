import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgrounds/truck-background.jpg"
          alt="Camión en la carretera"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Overlay para mejorar la legibilidad */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Image
              src="/images/logos/logo.png"
              alt="Transportes Roma"
              width={200}
              height={80}
              className="mx-auto"
              priority
            />
          </div>

          {/* Formulario de login */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Bienvenido a Transportes Roma
            </h1>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
