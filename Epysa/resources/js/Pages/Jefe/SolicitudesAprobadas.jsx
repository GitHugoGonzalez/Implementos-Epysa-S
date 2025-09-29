import React from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function SolicitudesAprobadas() {
    const { solicitudes } = usePage().props;

    const aprobar = (id) => {
        if (!confirm("¿Aprobar esta solicitud?")) return;
        router.patch(`/jefe/solicitudes/${id}/aprobar`);
    };

    const rechazar = (id) => {
        if (!confirm("¿Rechazar esta solicitud?")) return;
        router.patch(`/jefe/solicitudes/${id}/rechazar`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Solicitudes Aprobadas" />
            <div className="py-8 px-4 md:px-8">
                <div className="mx-auto max-w-6xl bg-white shadow rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold">
                            Solicitudes Aprobadas
                        </h1>
                        <Link href="/dashboard" className="text-sm underline">
                            Volver
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">#</th>
                                    <th className="p-2 border">Usuario</th>
                                    <th className="p-2 border">Sucursal</th>
                                    <th className="p-2 border">Insumo</th>
                                    <th className="p-2 border">Cantidad</th>
                                    <th className="p-2 border">Fecha</th>
                                    <th className="p-2 border">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(!solicitudes || solicitudes.length === 0) && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center p-4"
                                        >
                                            No hay solicitudes para mostrar
                                        </td>
                                    </tr>
                                )}

                                {solicitudes?.map((s, idx) => (
                                    <tr
                                        key={s.id_solicitud}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="p-2 border">
                                            {idx + 1}
                                        </td>
                                        <td className="p-2 border">
                                            {s.usuario_nombre}
                                        </td>
                                        <td className="p-2 border">
                                            {s.sucursal_nombre}
                                        </td>
                                        <td className="p-2 border">
                                            {s.insumo_nombre}
                                        </td>
                                        <td className="p-2 border">
                                            {s.cantidad}
                                        </td>
                                        <td className="p-2 border">
                                            {s.fecha_sol}
                                        </td>
                                        <td className="p-2 border">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        aprobar(s.id_solicitud)
                                                    }
                                                    className="px-3 py-1 rounded bg-green-600 text-white hover:opacity-90"
                                                    title="Marcar como Aprobada"
                                                >
                                                    Aprobar
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        rechazar(s.id_solicitud)
                                                    }
                                                    className="px-3 py-1 rounded bg-red-600 text-white hover:opacity-90"
                                                    title="Marcar como Rechazada"
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
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
