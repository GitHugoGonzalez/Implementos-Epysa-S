import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h1 className="text-3xl font-bold">Bienvenido a nuestra aplicación</h1>
                        <p className="mt-4">Esta es la página de inicio para visitantes.</p>
                        <p className="mt-2">Inicia sesión para acceder a contenido exclusivo.</p>
                        
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h2 className="text-xl font-semibold">Características</h2>
                            <ul className="mt-2 list-disc list-inside">
                                <li>Acceso seguro con autenticación</li>
                                <li>Persistencia de sesión</li>
                                <li>Contenido personalizado</li>
                            </ul>
                        </div>

                        <div className="mt-6">
                            <Link 
                                to="/login" 
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                            >
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}