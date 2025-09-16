import React from 'react';

export default function About() {
    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h1 className="text-3xl font-bold">Acerca de Nosotros</h1>
                        <p className="mt-4">Esta es la página acerca de nosotros</p>
                        <p className="mt-2">Aplicación construida con Laravel y React</p>
                    </div>
                </div>
            </div>
        </div>
    );
}