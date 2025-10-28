import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configurar axios globalmente
    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.defaults.baseURL = 'http://localhost:8000';
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Primero obtener el token CSRF
            await axios.get('/sanctum/csrf-cookie');
            
            // Luego obtener el usuario
            const response = await axios.get('/api/user');
            setUser(response.data);
        } catch (error) {
            console.log('Usuario no autenticado');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            // Obtener CSRF token primero
            await axios.get('/sanctum/csrf-cookie');
            
            // Hacer login
            const response = await axios.post('/login', credentials);
            
            if (response.status === 200) {
                // Obtener usuario autenticado
                const userResponse = await axios.get('/api/user');
                setUser(userResponse.data);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                errors: error.response?.data?.errors || { general: 'Error de autenticación' } 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};