import React, { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuditDiff from "@/Components/AuditDiff";

export default function AuditoriaIndex() {
    const {
        logs = { data: [], links: [], from: 0, to: 0, total: 0 },
        filtros = {},
        acciones = [],
        usuarios = [],
    } = usePage().props;

    const [q, setQ] = useState(filtros.q ?? "");
    const [accion, setAccion] = useState(filtros.accion ?? "");
    const [usuario, setUsuario] = useState(filtros.usuario_id ?? "");
    const [desde, setDesde] = useState(filtros.desde ?? "");
    const [hasta, setHasta] = useState(filtros.hasta ?? "");

    // ======== URL limpia (solo filtros reales) ========
    const buildParams = () => {
        const params = {};
        if (q) params.q = q;
        if (accion) params.accion = accion;
        if (usuario) params.usuario_id = usuario;
        if (desde) params.desde = desde;
        if (hasta) params.hasta = hasta;
        return params;
    };

    // ======== Filtro por texto con debounce ========
    useEffect(() => {
        const id = setTimeout(() => {
            router.get(
                route("auditoria.index"),
                buildParams(),
                { replace: true, preserveState: true, preserveScroll: true }
            );
        }, 400);

        return () => clearTimeout(id);
    }, [q]);

    const submitFilters = () => {
        router.get(
            route("auditoria.index"),
            buildParams(),
            { replace: true, preserveState: true, preserveScroll: true }
        );
    };

    const resetFilters = () => {
        setQ("");
        setAccion("");
        setUsuario("");
        setDesde("");

        router.get(route("auditoria.index"), {}, { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Auditoría del Sistema" />

            <div className="max-w-7xl mx-auto bg-white shadow rounded-2xl p-6 mt-7">
                <h1 className="text-2xl font-semibold mb-6">Auditoría del Sistema</h1>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">

                    {/* Buscador */}
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2"
                    />

                    {/* Acciones */}
                    <select
                        value={accion}
                        onChange={(e) => { setAccion(e.target.value); submitFilters(); }}
                        className="border rounded-xl px-3 py-2"
                    >
                        <option value="">Todas las acciones</option>
                        {acciones.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>

                    {/* Usuarios */}
                    <select
                        value={usuario}
                        onChange={(e) => { setUsuario(e.target.value); submitFilters(); }}
                        className="border rounded-xl px-3 py-2"
                    >
                        <option value="">Todos los usuarios</option>
                        {usuarios.map((u) =>
                            <option key={u.id} value={u.id}>{u.name}</option>
                        )}
                    </select>

                    {/* DESDE */}
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">Fecha desde</label>
                        <input
                            type="date"
                            value={desde}
                            onChange={(e) => { setDesde(e.target.value); submitFilters(); }}
                            className="border rounded-xl px-3 py-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                    {/* HASTA */}
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">Fecha hasta</label>
                        <input
                            type="date"
                            value={hasta}
                            onChange={(e) => { setHasta(e.target.value); submitFilters(); }}
                            className="border rounded-xl px-3 py-2"
                        />
                    </div>

                    {/* Botón filtrar */}
                    <button
                        onClick={() => submitFilters()}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Filtrar
                    </button>

                    {/* Botón limpiar */}
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                    >
                        Limpiar
                    </button>
                </div>


                {/* Tabla */}
                <div className="overflow-x-auto border rounded-2xl">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left">Fecha</th>
                                <th className="px-3 py-2 text-left">Usuario</th>
                                <th className="px-3 py-2 text-left">Acción</th>
                                <th className="px-3 py-2 text-left">Antes / Después</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-3 py-6 text-center text-gray-500">
                                        No hay registros de auditoría.
                                    </td>
                                </tr>
                            )}

                            {logs.data.map((l) => (
                                <tr key={l.id_audit} className="border-t hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        {new Date(l.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2">{l.usuario_nombre || "—"}</td>
                                    <td className="px-3 py-2">{l.accion}</td>

                                    {/* Tabla bonita con AuditDiff */}
                                    <td className="px-3 py-2">
                                        <AuditDiff
                                            before={l.valores_antes || {}}
                                            after={l.valores_despues || {}}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                        Mostrando {logs.from}–{logs.to} de {logs.total}
                    </div>

                    <div className="flex gap-2">
                        {logs.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || "#"}
                                preserveScroll
                                preserveState
                                className={`px-3 py-1 rounded-lg border ${
                                    link.active
                                        ? "bg-blue-600 text-white"
                                        : "bg-white hover:bg-gray-50"
                                } ${
                                    !link.url
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
