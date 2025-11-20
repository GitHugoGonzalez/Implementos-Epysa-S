import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

export default function Index() {
    const { solicitudes = [] } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="Gestión Logística" />
            <div className="py-8 px-4 md:px-8">
                <div className="mx-auto max-w-6xl space-y-4">
                    <h1 className="text-2xl font-semibold">
                        Gestión Logística
                    </h1>

                    <div className="bg-white shadow rounded-xl overflow-hidden">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left">ID Solicitud</th>
                                    <th className="px-4 py-2 text-left">
                                        Insumo
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Cant.
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Sucursal
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Solicitante
                                    </th>
                                    <th className="px-4 py-2 text-left">
                                        Estado Solicitud
                                    </th>
                                    {/* Columnas eliminadas: Estado Logística, Envío, ETA */}
                                    <th className="px-4 py-2 text-left"></th> 
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.length === 0 && (
                                    <tr>
                                        <td
                                            className="text-center py-6 text-gray-500"
                                            colSpan="7" /* Se redujo el colSpan a 7 */
                                        >
                                            No hay solicitudes.
                                        </td>
                                    </tr>
                                )}

                                {solicitudes.map((s) => (
                                    <tr
                                        key={s.id_solicitud}
                                        className="border-t"
                                    >
                                        <td className="px-4 py-2">
                                            {s.id_solicitud}
                                        </td>
                                        <td className="px-4 py-2">
                                            {s.insumo_nombre}
                                        </td>
                                        <td className="px-4 py-2">
                                            {s.cantidad}
                                        </td>
                                        <td className="px-4 py-2">
                                            {s.sucursal_nombre}
                                        </td>
                                        <td className="px-4 py-2">
                                            {s.usuario_nombre}
                                        </td>
                                        <td className="px-4 py-2">
                                            {s.estado_solicitud ?? "—"}
                                        </td>
                                        {/* Celdas eliminadas: Estado Logística, Envío, ETA */}
                                        <td className="px-4 py-2 text-right">
                                            <Link
                                                href={route(
                                                    "sol.logistica.edit",
                                                    s.id_solicitud
                                                )}
                                                className="px-3 py-1 rounded bg-indigo-600 text-white hover:opacity-90"
                                            >
                                                Gestionar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}