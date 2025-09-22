// resources/js/Components/Navbar.jsx
import { Link } from "@inertiajs/react";

export default function Navbar() {
    return (
        <nav className="bg-white shadow-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="text-xl font-bold text-gray-800 hover:text-gray-600"
                        >
                            Mi Plataforma
                        </Link>
                    </div>

                    {/* Links */}
                    <div className="flex space-x-6">
                        <Link
                            href="/dashboard"
                            className="text-gray-700 hover:text-black transition"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/insumos"
                            className="text-gray-700 hover:text-black transition"
                        >
                            Insumos
                        </Link>
                        <Link
                            href="/perfil"
                            className="text-gray-700 hover:text-black transition"
                        >
                            Perfil
                        </Link>
                    </div>

                    {/* Botón logout */}
                    <div>
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Cerrar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
