import React from "react";
import { Link } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-blue-700 bg-blue-600 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <img
                                    src="/imagenes/logo_header.svg"
                                    alt="Implementos Epysa"
                                    className="h-12 w-auto"
                                />
                            </Link>
                        </div>
                        <div className="flex space-x-4 items-center">
                            {auth.user ? (
                                <div className="hidden items-center sm:flex">
                                    <Link
                                        href={route("dashboard")}
                                        className="inline-flex items-center px-3 py-2 rounded-md text-white hover:bg-blue-500 text-lg transition"
                                    >
                                        Dashboard
                                    </Link>

                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-transparent px-3 py-2 text-lg font-medium leading-4 text-white transition hover:bg-blue-500 focus:outline-none"
                                                >
                                                    {auth.user.name}
                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route("profile.edit")}
                                            >
                                                Mi Perfil
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                            >
                                                Cerrar Sesión
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href={route("login")}
                                        className="inline-flex items-center px-3 py-2 rounded-md text-white hover:bg-blue-500 text-lg transition"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="inline-flex items-center px-3 py-2 rounded-md text-white hover:bg-blue-500 text-lg transition"
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
                            <h1 className="text-3xl font-bold">
                                Solicitud de implementos
                            </h1>
                            {auth.user ? (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <h2 className="text-xl font-semibold">
                                        ¡Hola, {auth.user.name}!
                                    </h2>
                                    <p>Ya estás autenticado en el sistema.</p>
                                </div>
                            ) : (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h2 className="text-xl font-semibold">
                                        Inicia sesión o regístrate
                                    </h2>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
