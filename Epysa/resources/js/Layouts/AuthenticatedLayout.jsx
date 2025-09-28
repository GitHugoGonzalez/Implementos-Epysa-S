// resources/js/Layouts/AuthenticatedLayout.jsx
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const isPathActive = (path) =>
        page.url === path || page.url.startsWith(path + "/");

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-blue-700 bg-blue-600 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        {/* Left: Logo + Links */}
                        <div className="flex items-center gap-6">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <img
                                        src="/imagenes/logo_header.svg"
                                        alt="Implementos Epysa"
                                        className="h-12 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Desktop links */}
                            <div className="hidden items-center gap-2 sm:flex">
                                <NavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                    className="!text-white hover:!text-blue-100 font-medium"
                                >
                                    Dashboard
                                </NavLink>

                                <NavLink
                                    href="/insumos/index"
                                    active={page.url === "/insumos/index"}
                                    className="!text-white hover:!text-blue-100 font-medium"
                                >
                                    Ver Insumos
                                </NavLink>

                                <NavLink
                                    href="/insumos/crear"
                                    active={page.url === "/insumos/crear"}
                                    className="!text-white hover:!text-blue-100 font-medium"
                                >
                                    Agregar Insumo
                                </NavLink>
                                <NavLink
                                    href="/solicitudes/crear"
                                    active={page.url === "/solicitudes/crear"}
                                    className="!text-white hover:!text-blue-100 font-medium"
                                >
                                    Nueva Solicitud
                                </NavLink>
                                
                            </div>
                        </div>

                        {/* Right: User dropdown (desktop) */}
                        <div className="hidden items-center sm:flex">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-transparent px-3 py-2 text-lg font-medium leading-4 text-white transition hover:bg-blue-500 focus:outline-none"
                                        >
                                            {user.name}
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
                                    <Dropdown.Link href={route("profile.edit")}>
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

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (prev) => !prev
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-white transition hover:bg-blue-500 focus:bg-blue-500 focus:outline-none"
                                aria-label="Abrir menú"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    <div className="space-y-1 bg-white pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                            className="text-gray-800"
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href="/insumos"
                            active={page.url === "/insumos"}
                            className="text-gray-800"
                        >
                            Ver Insumos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href="/insumos/crear"
                            active={page.url === "/insumos/crear"}
                            className="text-gray-800"
                        >
                            Agregar Insumo
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href="/insumos/crear"
                            active={page.url === "/insumos/crear"}
                            className="text-gray-800"
                        >
                            Nueva Solicitud
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-blue-200 bg-white pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink
                                href={route("profile.edit")}
                                className="text-gray-800"
                            >
                                Mi Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                                className="text-gray-800"
                            >
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
