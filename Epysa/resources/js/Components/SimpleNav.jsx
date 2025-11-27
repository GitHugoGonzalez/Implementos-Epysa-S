import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function SimpleNav() {
    const page = usePage();
    const { auth = {} } = page.props || {};
    const user = auth.user || null; // Clave para la lógica condicional

    // ===== Helpers =====
    const norm = (v) =>
        String(v ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .trim();

    const rawRole =
        user?.rol?.nombre_rol ??
        user?.rol_nombre ??
        user?.role?.name ??
        user?.role ??
        user?.rol ??
        "";
    const roleName = norm(rawRole);
    const roleId =
        Number(user?.id_rol) ||
        Number(user?.rol_id) ||
        (Number.isFinite(Number(user?.rol)) ? Number(user?.rol) : null) ||
        null;

    const canManageUsers =
        roleName.includes("jefe") ||
        roleName.includes("administrador") ||
        roleId === 3 ||
        roleId === 5;

    const isOperario = roleName.includes("operario");

    const isPathActive = (path) =>
        page?.url === path || (page?.url || "").startsWith(path + "/");

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [isSideOpen, setIsSideOpen] = useState(false);

    const safeRoute = (name, fallback = "#") => {
        try {
            const url = route(name);
            if (typeof url === "string" && url.length) return url;
        } catch (e) {
            // no-op
        }
        return fallback;
    };

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setIsSideOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <nav className="border-b border-blue-700 bg-blue-600 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo + links principales */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <img
                                    src="/imagenes/logo_header.svg"
                                    alt="Implementos Epysa"
                                    className="h-12 w-auto"
                                />
                            </Link>
                        </div>

                        {/* 💡 Desktop links: SOLO se renderizan si hay usuario */}
                        {user && (
                            <div className="hidden items-center gap-2 sm:flex">
                                {isOperario ? (
                                    <>
                                        <NavLink
                                            href="/solicitudes/crear"
                                            active={isPathActive("/solicitudes/crear")}
                                            className="!text-white hover:!text-blue-100 font-medium"
                                        >
                                            Nueva Solicitud
                                        </NavLink>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            href={safeRoute("dashboard", "/dashboard")}
                                            active={safeRoute().current?.("dashboard")}
                                            className="!text-white hover:!text-blue-100 font-medium"
                                        >
                                            Dashboard
                                        </NavLink>

                                        <NavLink
                                            href="/insumos/index"
                                            active={isPathActive("/insumos/index")}
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

                                        
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 💡 Botón de usuario / Botón de Login (Derecha) */}
                    <div className="flex items-center">
                        {user ? (
                            // 🟢 SI HAY USUARIO: Muestra el botón de perfil/drawer (Desktop)
                            <div className="hidden items-center sm:flex">
                                <button
                                    type="button"
                                    onClick={() => setIsSideOpen(true)}
                                    className="inline-flex items-center rounded-md bg-transparent px-3 py-2 text-lg font-medium leading-4 text-white transition hover:bg-blue-500 focus:outline-none"
                                    aria-label="Abrir panel de usuario"
                                    aria-expanded={isSideOpen}
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
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            // 🔴 SI NO HAY USUARIO: Muestra el botón de Iniciar Sesión (Desktop)
                            <Link
                                href={safeRoute("login", "/login")}
                                className="rounded-lg bg-white px-4 py-2 text-blue-600 font-bold transition hover:bg-blue-100 hidden sm:inline-flex"
                            >
                                Iniciar Sesión
                            </Link>
                        )}


                        {/* Botón Hamburguesa (mobile) */}
                        <div className="-me-2 flex items-center sm:hidden">
                            {user ? (
                                // 🟢 Si hay usuario, muestra el botón de hamburguesa para el menú
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown((prev) => !prev)
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
                                            className={!showingNavigationDropdown ? "inline-flex" : "hidden"}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingNavigationDropdown ? "inline-flex" : "hidden"}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                // 🔴 Si NO hay usuario, muestra el botón de Iniciar Sesión (Móvil)
                                <Link
                                    href={safeRoute("login", "/login")}
                                    className="rounded-lg bg-white px-3 py-1.5 text-blue-600 font-bold transition hover:bg-blue-100 text-sm"
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 💡 Menú responsive (mobile): SOLO se renderiza si hay usuario */}
            {user && (
                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    <div className="space-y-1 bg-white pb-3 pt-2">
                        {isOperario ? (
                            <>
                                <ResponsiveNavLink
                                    href="/solicitudes/crear"
                                    active={isPathActive("/solicitudes/crear")}
                                    className="text-gray-800"
                                >
                                    Nueva Solicitud
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={safeRoute("profile.edit", "/profile")}
                                    className="text-gray-800"
                                >
                                    Mi Perfil
                                </ResponsiveNavLink>
                            </>
                        ) : (
                            <>
                                <ResponsiveNavLink
                                    href={safeRoute("dashboard", "/dashboard")}
                                    active={safeRoute().current?.("dashboard")}
                                    className="text-gray-800"
                                >
                                    Dashboard
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href="/insumos/index"
                                    active={isPathActive("/insumos/index")}
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
                                <ResponsiveNavLink
                                    href="/solicitudes/historial"
                                    active={isPathActive("/solicitudes/historial")}
                                    className="text-gray-800"
                                >
                                    Historial
                                </ResponsiveNavLink>

                                {canManageUsers && (
                                    <ResponsiveNavLink
                                        href={safeRoute(
                                            "admin.users.create",
                                            "/admin/usuarios/crear"
                                        )}
                                        active={isPathActive("/admin/usuarios/crear")}
                                        className="text-gray-800"
                                    >
                                        Crear usuarios
                                    </ResponsiveNavLink>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sección de perfil móvil */}
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
                                href={safeRoute("profile.edit", "/profile")}
                                className="text-gray-800"
                            >
                                Mi Perfil
                            </ResponsiveNavLink>
                            {canManageUsers && (
                                <ResponsiveNavLink
                                    href={safeRoute(
                                        "admin.users.index",
                                        "/admin/usuarios"
                                    )}
                                    className="text-gray-800"
                                >
                                    Gestionar usuarios
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink
                                method="post"
                                href={safeRoute("logout", "/logout")}
                                as="button"
                                className="text-gray-800"
                            >
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            )}

            {/* 💡 SIDE MENU (Drawer): SOLO se renderiza si hay usuario */}
            {user && (
                <>
                    <div
                        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${isSideOpen
                            ? "opacity-100"
                            : "pointer-events-none opacity-0"
                            }`}
                        onClick={() => setIsSideOpen(false)}
                        aria-hidden={!isSideOpen}
                    />
                    <aside
                        className={`fixed right-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl transition-transform duration-300 ${isSideOpen ? "translate-x-0" : "translate-x-full"
                            }`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menú de usuario"
                    >
                        <div className="flex items-center justify-between border-b px-4 py-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Sesión iniciada como
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                            <button
                                className="rounded p-2 text-gray-500 hover:bg-gray-100"
                                onClick={() => setIsSideOpen(false)}
                                aria-label="Cerrar panel"
                            >
                                {/* SVG de cerrar */}
                            </button>
                        </div>

                        <div className="px-2 py-3">
                            <Link
                                href={safeRoute("profile.edit", "/profile")}
                                className="flex items-center rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100"
                                onClick={() => setIsSideOpen(false)}
                            >
                                Mi Perfil
                            </Link>

                            {canManageUsers && (
                                <>
                                    <Link
                                        href={safeRoute(
                                            "admin.users.create",
                                            "/admin/usuarios/crear"
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

                                    <Link
                                        href={safeRoute("auditoria.index", "/auditoria")}
                                        className="flex items-center rounded-lg px-3 py-2 text-gray-800 hover:bg-gray-100"
                                        onClick={() => setIsSideOpen(false)}
                                    >
                                        Auditoría del sistema
                                    </Link>
                                </>
                            )}

                            <Link
                                href={safeRoute("logout", "/logout")}
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
        </nav>
    );
}