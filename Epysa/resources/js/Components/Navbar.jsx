import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      axios.defaults.withCredentials = true;
      await axios.get('/sanctum/csrf-cookie');
      const response = await axios.get('/api/user');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex space-x-4">
            <Link href="/" className="text-gray-800 font-bold text-xl">
              Mi App
            </Link>
          </div>

          <div className="flex space-x-4 items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-800 px-3 py-2">
              Inicio
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-800 px-3 py-2">
              Acerca de
            </Link>

            {isAuthenticated ? (
              <>
                {/* 👉 Aquí agregamos el botón para Insumos */}
                <Link
                  href={route('insumos.create')}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2"
                >
                  Agregar Insumo
                </Link>

                <span className="text-gray-600">Hola, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link href="/login" className="text-gray-600 hover:text-gray-800 px-3 py-2">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
