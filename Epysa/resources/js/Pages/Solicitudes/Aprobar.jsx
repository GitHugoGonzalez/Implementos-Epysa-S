import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Aprobar() {
  const { solicitudes = { data: [], links: [], from: 0, to: 0, total: 0 }, rol = "" } = usePage().props;
  const [q, setQ] = useState("");

  const aprobar = (id) => {
    router.post(route("aprobaciones.aprobar", id), {}, { preserveScroll: true });
  };

  const rechazar = (id) => {
    const motivo = prompt("Motivo del rechazo (opcional):") || "";
    router.post(route("aprobaciones.rechazar", id), { motivo }, { preserveScroll: true });
  };

  const buscar = () => {
    router.get(route("aprobaciones.index"), { q }, { preserveScroll: true, replace: true });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Aprobaciones (${rol})`} />
      <div className="py-8 px-4 md:px-8">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h1 className="text-2xl font-semibold">Aprobaciones ({rol})</h1>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar..."
              className="border rounded-lg px-3 py-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
            />
            <button
              onClick={buscar}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Insumo</th>
                <th className="px-4 py-2 text-left">Cantidad</th>
                <th className="px-4 py-2 text-left">Sucursal</th>
                <th className="px-4 py-2 text-left">Solicitante</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.data.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No hay solicitudes para revisar.
                  </td>
                </tr>
              )}

              {solicitudes.data.map((s) => {
                const fecha = s.fecha_sol ? new Date(s.fecha_sol).toLocaleDateString() : "—";
                const sucursal = [s.sucursal?.ciudad, s.sucursal?.direccion].filter(Boolean).join(" - ") || "—";
                const estado = s.estado?.desc_estado ?? "—";
                const solicitante = s.usuario?.name ?? "—";
                const insumo = s.insumo?.nombre_insumo ?? "—";

                return (
                  <tr key={s.id_solicitud} className="border-t">
                    <td className="px-4 py-2">{s.id_solicitud}</td>
                    <td className="px-4 py-2">{fecha}</td>
                    <td className="px-4 py-2">{insumo}</td>
                    <td className="px-4 py-2">{s.cantidad}</td>
                    <td className="px-4 py-2">{sucursal}</td>
                    <td className="px-4 py-2">{solicitante}</td>
                    <td className="px-4 py-2">{estado}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => aprobar(s.id_solicitud)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded hover:opacity-90"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => rechazar(s.id_solicitud)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:opacity-90"
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Mostrando {solicitudes.from ?? 0}–{solicitudes.to ?? 0} de {solicitudes.total ?? 0}
          </div>
          <div className="flex gap-2">
            {(solicitudes.links || []).map((link, i) => (
              <Link
                key={i}
                href={link.url || "#"}
                preserveScroll
                preserveState
                data={{ q }}
                className={`px-3 py-1 rounded-lg border ${
                  link.active ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
                } ${!link.url ? "pointer-events-none opacity-50" : ""}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}