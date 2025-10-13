import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Historial() {
    const {
        solicitudes = { data: [], links: [], from: 0, to: 0, total: 0 },
        filtros = {},
        sucursales = [],
    } = usePage().props;

    const [q, setQ] = useState(filtros.q ?? "");
    const [estado, setEstado] = useState(filtros.estado ?? "");
    const [sucursal, setSucursal] = useState(filtros.sucursal ?? "");

    useEffect(() => {
        const id = setTimeout(() => {
            submitFilters({ replace: true, preserveState: true });
        }, 450);
        return () => clearTimeout(id);
    }, [q]);

    const submitFilters = (opts = {}) => {
        router.get(
            route("solicitudes.historial"),
            { q, estado, sucursal },
            { preserveScroll: true, ...opts }
        );
    };

    const resetFilters = () => {
        setQ("");
        setEstado("");
        setSucursal("");
        router.get(
            route("solicitudes.historial"),
            {},
            { preserveState: false, replace: true }
        );
    };

    const exportHref = useMemo(() => {
        const params = new URLSearchParams({ q, estado, sucursal });
        return route("solicitudes.historial.export") + "?" + params.toString();
    }, [q, estado, sucursal]);

    return (
        <AuthenticatedLayout>
            <Head title="Historial de Solicitudes" />
            <div className="max-w-7xl mx-auto bg-white shadow rounded-2xl p-6 mt-7">
                <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold">
                            Historial de Solicitudes
                        </h1>
                    </div>
                    <a
                        href={exportHref}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        Descargar Excel
                    </a>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                    <div className="col-span-1 md:col-span-1">
                        <input
                            type="text"
                            placeholder="Buscar"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="w-full border rounded-xl px-3 py-2"
                        />
                    </div>
                    <div>
                        <select
                            value={sucursal || ""}
                            onChange={(e) => {
                                setSucursal(e.target.value);
                                submitFilters({
                                    replace: true,
                                    preserveState: true,
                                });
                            }}
                            className="w-full border rounded-xl px-3 py-2"
                        >
                            <option value="">Todas las sucursales</option>
                            {(sucursales || []).map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() =>
                            submitFilters({
                                replace: true,
                                preserveState: true,
                            })
                        }
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Filtrar
                    </button>
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
                                <th className="text-left px-3 py-2">Fecha</th>
                                <th className="text-left px-3 py-2">Estado</th>
                                <th className="text-left px-3 py-2">
                                    Sucursal
                                </th>
                                <th className="text-left px-3 py-2">
                                    Solicitante
                                </th>
                                <th className="text-left px-3 py-2">Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(solicitudes.data || []).length === 0 && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-3 py-6 text-center text-gray-500"
                                    >
                                        No hay resultados para los filtros
                                        actuales.
                                    </td>
                                </tr>
                            )}

                            {(solicitudes.data || []).map((s) => {
                                const fecha = s.fecha_sol
                                    ? new Date(s.fecha_sol).toLocaleString()
                                    : "—";
                                const estadoTexto =
                                    s.estado?.desc_estado ?? "—";
                                const sucursalTexto =
                                    [s.sucursal?.ciudad, s.sucursal?.direccion]
                                        .filter(Boolean)
                                        .join(" - ") || "—";
                                const solicitante = s.usuario?.name ?? "—";
                                const detalle =
                                    (s.insumo?.nombre_insumo ?? "—") +
                                    (s.cantidad ? ` x ${s.cantidad}` : "");

                                return (
                                    <tr
                                        key={
                                            s.id_solicitud ??
                                            `${s.fecha_sol}-${Math.random()}`
                                        }
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-2">{fecha}</td>
                                        <td className="px-3 py-2">
                                            <span className="inline-flex px-2 py-1 rounded-lg bg-gray-100">
                                                {estadoTexto}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            {sucursalTexto}
                                        </td>
                                        <td className="px-3 py-2">
                                            {solicitante}
                                        </td>
                                        <td className="px-3 py-2">{detalle}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                        Mostrando {solicitudes.from ?? 0}–{solicitudes.to ?? 0}{" "}
                        de {solicitudes.total ?? 0}
                    </div>

                    <div className="flex gap-2">
                        {(solicitudes.links || []).map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || "#"}
                                preserveScroll
                                preserveState
                                data={{ q, estado, sucursal }}
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
        </AuthenticatedLayout>
    );
}
