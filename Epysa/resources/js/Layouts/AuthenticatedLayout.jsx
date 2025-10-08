// resources/js/Layouts/AuthenticatedLayout.jsx
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();

    const { auth } = usePage().props;
    const user = auth?.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false); // mobile menu
    const [isSideOpen, setIsSideOpen] = useState(false); // side menu (drawer)

    const isPathActive = (path) =>
        page.url === path || page.url.startsWith(path + "/");

    // --- Helpers de rol y rutas seguras ---

    // Normaliza cadenas (lowercase + sin tildes + trim)
    const norm = (v) =>
        String(v ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .trim();

    // Toma cualquier variante del nombre de rol que pueda venir desde el backend
    const rawRole =
        user?.rol_nombre ??
        user?.rol?.nombre_rol ??
        user?.rolRef?.nombre_rol ??
        user?.role?.name ??
        user?.role ??
        user?.rol ??
        "";

    const roleName = norm(rawRole);

    // Si tu backend envía id del rol en alguna de estas claves:
    const roleId =
        Number(user?.id_rol) ||
        Number(user?.rol_id) ||
        // a veces llega como string del id en user.rol
        (Number.isFinite(Number(user?.rol)) ? Number(user?.rol) : null) ||
        null;

    // Marca como jefe si el nombre contiene "jefe" o si el id es 3 (según tu tabla)
    const isJefe = roleName.includes("jefe", "Jefe") || roleId === 3;

    // route() seguro: usa Ziggy si está definido y la ruta existe; si no, usa un fallback plano
    const safeRoute = (name, fallback) => {
        try {
            return route(name);
        } catch {
            return fallback;
        }
    };

    // Cerrar el drawer con ESC
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setIsSideOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

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
                                    active={
                                        isPathActive("/insumos/index") ||
                                        isPathActive("/insumos")
                                    }
                                    className="!text-white hover:!text-blue-100 font-medium"
                                >
                                    Ver Insumos
                                </NavLink>

                                <NavLink
                                    href="/insumos/crear"
                                    active={isPathActive("/insumos/crear")}
                                    className="!text-white hover:!text-blue-100 font-medium"
                                >
                                    Agregar Insumo
                                </NavLink>

                                <NavLink
                                    href="/solicitudes/crear"
                                    active={isPathActive("/solicitudes/crear")}
                                    className="!text-white hover:!text-blue-100 font-medium"
                                >
                                    Nueva Solicitud
                                </NavLink>
                            </div>
                        </div>

                        {/* Right: Botón que abre el side menu (desktop) */}
                        <div className="hidden items-center sm:flex">
                            <button
                                type="button"
                                onClick={() => setIsSideOpen(true)}
                                className="inline-flex items-center rounded-md bg-transparent px-3 py-2 text-lg font-medium leading-4 text-white transition hover:bg-blue-500 focus:outline-none"
                                aria-label="Abrir panel de usuario"
                                aria-expanded={isSideOpen}
                            >
                                {user?.name}
                                <svg
                                    className="-me-0.5 ms-2 h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Botón hamburguesa (mobile) */}
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
                            href="/insumos/index"
                            active={
                                isPathActive("/insumos/index") ||
                                isPathActive("/insumos")
                            }
                            className="text-gray-800"
                        >
                            Ver Insumos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href="/insumos/crear"
                            active={isPathActive("/insumos/crear")}
                            className="text-gray-800"
                        >
                            Agregar Insumo
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href="/solicitudes/crear"
                            active={isPathActive("/solicitudes/crear")}
                            className="text-gray-800"
                        >
                            Nueva Solicitud
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-blue-200 bg-white pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user?.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user?.email}
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink
                                href={route("profile.edit")}
                                className="text-gray-800"
                            >
                                Mi Perfil
                            </ResponsiveNavLink>
                            {isJefe && (
                                <ResponsiveNavLink
                                    href="/admin/usuarios"
                                    className="text-gray-800"
                                >
                                    Gestionar usuarios
                                </ResponsiveNavLink>
                            )}
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

            {/* ==== SIDE MENU (Drawer) para usuario ==== */}
            {user && (
                <>
                    {/* Overlay */}
                    <div
                        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
                            isSideOpen
                                ? "opacity-100"
                                : "pointer-events-none opacity-0"
                        }`}
                        onClick={() => setIsSideOpen(false)}
                        aria-hidden={!isSideOpen}
                    />

                    {/* Drawer */}
                    <aside
                        className={`fixed right-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl transition-transform duration-300 ${
                            isSideOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menú de usuario"
                    >
                        {/* Header del drawer */}
                        <div className="flex items-center justify-between border-b px-4 py-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Sesión iniciada como
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email}
                                </p>
                            </div>
                            <button
                                className="rounded p-2 text-gray-500 hover:bg-gray-100"
                                onClick={() => setIsSideOpen(false)}
                                aria-label="Cerrar panel"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Items del drawer */}
                        <div className="px-2 py-3">
                            <Link
                                href={route("profile.edit")}
                                className="flex items-center rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100"
                                onClick={() => setIsSideOpen(false)}
                            >
                                Mi Perfil
                            </Link>

                            {/* Enlaces para jefe */}
                            {isJefe && (
                                <>
                                    <Link
                                        href={safeRoute(
                                            "admin.users.create"
                                        )}
                                        className="flex items-center rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100"
                                        onClick={() => setIsSideOpen(false)}
                                    >
                                        Crear usuario
                                    </Link>

                                    <Link
                                        href={safeRoute(
                                            "admin.users.index",
                                            "/admin/usuarios"
                                        )}
                                        className="flex items-center rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100"
                                        onClick={() => setIsSideOpen(false)}
                                    >
                                        Gestionar usuarios
                                    </Link>
                                </>
                            )}

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                                onClick={() => setIsSideOpen(false)}
                            >
                                Cerrar sesión
                            </Link>
                        </div>
                    </aside>
                </>
            )}

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
