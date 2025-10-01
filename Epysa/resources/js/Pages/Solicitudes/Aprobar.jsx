import React from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Aprobar() {
  const { solicitudes = [], rol } = usePage().props;

  const aprobar = (id) => router.post(route('aprobaciones.aprobar', id));
  const rechazar = (id) => {
    const motivo = prompt('Motivo del rechazo (opcional):') || '';
    router.post(route('aprobaciones.rechazar', id), { motivo });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Aprobaciones (${rol})`} />
      <div className="py-8 px-4 md:px-8">
        <h1 className="text-2xl font-semibold mb-4">Aprobaciones ({rol})</h1>

        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Insumo</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                <th className="px-4 py-2 text-left">Sucursal</th>
                <th className="px-4 py-2 text-left">Solicitante</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.length === 0 && (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">No hay solicitudes para revisar.</td></tr>
              )}
              {solicitudes.map((s) => (
                <tr key={s.id_solicitud} className="border-t">
                  <td className="px-4 py-2">{s.id_solicitud}</td>
                  <td className="px-4 py-2">{s.insumo_nombre}</td>
                  <td className="px-4 py-2">{s.cantidad}</td>
                  <td className="px-4 py-2">{s.sucursal_nombre}</td>
                  <td className="px-4 py-2">{s.usuario_nombre}</td>
                  <td className="px-4 py-2">{s.estado}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => aprobar(s.id_solicitud)} className="px-3 py-1 bg-green-600 text-white rounded hover:opacity-90">Aprobar</button>
                    <button onClick={() => rechazar(s.id_solicitud)} className="px-3 py-1 bg-red-600 text-white rounded hover:opacity-90">Rechazar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
