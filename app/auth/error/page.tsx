import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #64FC05 0%, #006341 100%)" }}
    >
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-[#1A1B22] mb-2">Error de autenticación</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ocurrió un problema al verificar tu sesión. Por favor intenta de nuevo.
        </p>
        <Link
          href="/auth/login"
          className="inline-block w-full py-2.5 rounded-lg text-sm font-semibold text-black text-center"
          style={{ backgroundColor: "#64FC05" }}
        >
          Volver al Login
        </Link>
      </div>
    </div>
  )
}
