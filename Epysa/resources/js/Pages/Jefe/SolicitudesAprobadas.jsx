import React from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function SolicitudesAprobadas() {
  const { solicitudes, rol } = usePage().props;

  // acepta paginator o array plano
  const rows = Array.isArray(solicitudes?.data)
    ? solicitudes.data
    : Array.isArray(solicitudes)
    ? solicitudes
    : [];

  const aprobar = (id) => {
    if (!id) return;
    if (!confirm("¿Aprobar esta solicitud?")) return;
    // ← método POST según tus rutas
    router.post(route("aprobaciones.aprobar", id), {}, { preserveScroll: true });
  };

  const rechazar = (id) => {
    if (!id) return;
    if (!confirm("¿Rechazar esta solicitud?")) return;
    const motivo = prompt("Motivo del rechazo (opcional):", "") ?? "";
    router.post(
      route("aprobaciones.rechazar", id),
      { motivo },
      { preserveScroll: true }
    );
  };

  const sucursalNombre = (suc) => {
    if (!suc) return "—";
    const { ciudad, direccion } = suc;
    if (!ciudad && !direccion) return "—";
    return `${ciudad ?? ""}${ciudad && direccion ? " — " : ""}${direccion ?? ""}`.trim();
  };

  return (
    <AuthenticatedLayout>
      <Head title="Solicitudes para Aprobar" />
      <div className="py-8 px-4 md:px-8">
        <div className="mx-auto max-w-6xl bg-white shadow rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">
              {rol === "encargado" && "Solicitudes Pendientes (Encargado)"}
              {rol === "jefe" && "Solicitudes Aprobadas por Encargado (Revisión Jefe)"}
              {rol === "logistica" && "Solicitudes Aprobadas por Jefe (Logística)"}
              {!["encargado", "jefe", "logistica"].includes(rol ?? "") && "Solicitudes"}
            </h1>
            <Link href={route("aprobaciones.index")} className="text-sm underline">
              Volver
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <Th>#</Th>
                  <Th>Usuario</Th>
                  <Th>Sucursal</Th>
                  <Th>Insumo</Th>
                  <Th>Cantidad</Th>
                  <Th>Fecha</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      No hay solicitudes para mostrar
                    </td>
                  </tr>
                )}

                {rows.map((s, idx) => {
                  const id = s?.id_solicitud ?? s?.id ?? idx;
                  const usuarioNombre = s?.usuario?.name ?? "—";
                  const sucurNombre = sucursalNombre(s?.sucursal);
                  const insumoNombre = s?.insumo?.nombre_insumo ?? "—";
                  const cantidad = s?.cantidad ?? "—";
                  const fecha = s?.fecha_sol ?? "—";

                  return (
                    <tr key={id} className="hover:bg-gray-50 border-t">
                      <Td>{idx + 1}</Td>
                      <Td>{usuarioNombre}</Td>
                      <Td>{sucurNombre}</Td>
                      <Td>{insumoNombre}</Td>
                      <Td>{cantidad}</Td>
                      <Td>{fecha}</Td>
                      <Td align="right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => aprobar(id)}
                            className="px-3 py-1 rounded bg-green-600 text-white hover:opacity-90"
                            title="Marcar como Aprobada"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => rechazar(id)}
                            className="px-3 py-1 rounded bg-red-600 text-white hover:opacity-90"
                            title="Marcar como Rechazada"
                          >
                            Rechazar
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {Array.isArray(solicitudes?.links) && solicitudes.links.length > 3 && (
            <div className="flex gap-2 items-center justify-end mt-4">
              {solicitudes.links.map((l, i) => (
                <Link
                  key={i}
                  href={l.url || ""}
                  preserveScroll
                  className={`px-3 py-1.5 rounded border ${
                    l.active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } ${!l.url ? "opacity-50 pointer-events-none" : ""}`}
                  dangerouslySetInnerHTML={{ __html: l.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function Th({ children, className = "" }) {
  return <th className={`p-2 border text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, align = "left" }) {
  return <td className={`p-2 border ${align === "right" ? "text-right" : ""}`}>{children}</td>;
}
