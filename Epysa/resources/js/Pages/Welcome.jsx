import React from 'react';
import { Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-gray-800 font-bold text-xl">
                            Software
                        </div>
                        <div className="flex space-x-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold">Solicitud de implementos</h1>
                           
                            
                            {auth.user ? (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <h2 className="text-xl font-semibold">¡Hola, {auth.user.name}!</h2>
                                    <p>Ya estás autenticado en el sistema.</p>
                                </div>
                            ) : (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h2 className="text-xl font-semibold">Inicia sesión o regístrate</h2>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}