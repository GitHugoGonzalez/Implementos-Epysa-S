import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import SimpleNav from "../../Components/SimpleNav"; // 👈 tu SimpleNav

export default function Historial() {
  // Props desde Inertia con defaults seguros
  const {
    solicitudes = { data: [], links: [], from: 0, to: 0, total: 0 },
    filtros = {},
    sucursales = [],
    estados = [],
  } = usePage().props;

  // Estado local de filtros
  const [q, setQ] = useState(filtros.q ?? "");
  const [estado, setEstado] = useState(filtros.estado ?? "");
  const [sucursal, setSucursal] = useState(filtros.sucursal ?? "");

  // Estado para modal de detalle
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // Sincronizar estado local si cambian los filtros desde el backend
  useEffect(() => {
    setQ(filtros.q ?? "");
    setEstado(filtros.estado ?? "");
    setSucursal(filtros.sucursal ?? "");
  }, [filtros.q, filtros.estado, filtros.sucursal]);

  // Helper para enviar filtros (permite overrides para evitar problema asíncrono)
  const submitFilters = (opts = {}, overrides = {}) => {
    const currentQ = overrides.q !== undefined ? overrides.q : q;
    const currentEstado =
      overrides.estado !== undefined ? overrides.estado : estado;
    const currentSucursal =
      overrides.sucursal !== undefined ? overrides.sucursal : sucursal;

    const params = {
      q: (currentQ ?? "").trim(),
      estado: currentEstado ?? "",
      sucursal: currentSucursal ?? "",
    };

    router.get(route("solicitudes.historial"), params, {
      preserveScroll: true,
      ...opts,
    });
  };

  // Búsqueda con debounce solo por q
  useEffect(() => {
    const id = setTimeout(() => {
      submitFilters({ replace: true, preserveState: true });
    }, 450);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const resetFilters = () => {
    setQ("");
    setEstado("");
    setSucursal("");
    router.get(
      route("solicitudes.historial"),
      {},
      {
        preserveState: false,
        replace: true,
        preserveScroll: true,
      }
    );
  };

  // URL de exportación respetando filtros
  const exportHref = useMemo(() => {
    const params = new URLSearchParams({
      q: (q || "").trim(),
      estado: estado || "",
      sucursal: sucursal || "",
    });
    return route("solicitudes.historial.export") + "?" + params.toString();
  }, [q, estado, sucursal]);

  // Abrir modal con detalle de solicitud
  const abrirDetalle = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setDetalleAbierto(true);
  };

  const cerrarDetalle = () => {
    setDetalleAbierto(false);
    setSolicitudSeleccionada(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head title="Historial de Solicitudes" />

      {/* 👇 Aquí va tu barra de navegación */}
      <SimpleNav />

      <div className="max-w-7xl mx-auto bg-white shadow rounded-2xl p-6 mt-7">
        {/* Header + botón Excel */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold">Historial de Solicitudes</h1>
          <div className="flex items-center gap-2">
            <a
              href={exportHref}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Descargar Excel
            </a>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {/* Buscar (q) */}
          <div>
            <input
              type="text"
              placeholder="Buscar por N° solicitud o nombre del solicitante..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
          </div>

          {/* Estado */}
          <div>
            <select
              value={estado || ""}
              onChange={(e) => {
                const value = e.target.value;
                setEstado(value);
                submitFilters(
                  { replace: true, preserveState: true },
                  { estado: value }
                );
              }}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="">Todos los estados</option>
              {(estados || []).map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sucursal */}
          <div>
            <select
              value={sucursal || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSucursal(value);
                submitFilters(
                  { replace: true, preserveState: true },
                  { sucursal: value }
                );
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

        {/* Botón Limpiar */}
        <div className="flex items-center gap-2 mb-4">
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
                <th className="text-left px-3 py-2">N° Solicitud</th>
                <th className="text-left px-3 py-2">Estado</th>
                <th className="text-left px-3 py-2">Sucursal</th>
                <th className="text-left px-3 py-2">Solicitante</th>
                <th className="text-left px-3 py-2">Insumo</th>
              </tr>
            </thead>
            <tbody>
              {(solicitudes.data || []).length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    No hay resultados para los filtros actuales.
                  </td>
                </tr>
              )}

              {(solicitudes.data || []).map((s) => {
                const fecha = s.fecha_sol
                  ? new Date(s.fecha_sol).toLocaleString()
                  : "—";
                const estadoTexto = s.estado?.desc_estado ?? "—";
                const sucursalTexto =
                  [s.sucursal?.ciudad, s.sucursal?.direccion]
                    .filter(Boolean)
                    .join(" - ") || "—";
                const solicitante = s.usuario?.name ?? "—";
                const insumoNombre = s.insumo?.nombre_insumo ?? "—";

                return (
                  <tr
                    key={s.id_solicitud ?? `${s.fecha_sol}-${Math.random()}`}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => abrirDetalle(s)}
                  >
                    <td className="px-3 py-2">{fecha}</td>
                    <td className="px-3 py-2 font-medium text-blue-600 underline">
                      {s.id_solicitud}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex px-2 py-1 rounded-lg bg-gray-100">
                        {estadoTexto}
                      </span>
                    </td>
                    <td className="px-3 py-2">{sucursalTexto}</td>
                    <td className="px-3 py-2">{solicitante}</td>
                    <td className="px-3 py-2">{insumoNombre}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Mostrando {solicitudes.from ?? 0}–{solicitudes.to ?? 0} de{" "}
            {solicitudes.total ?? 0}
          </div>

          <div className="flex gap-2">
            {(solicitudes.links || []).map((link, i) => (
              <Link
                key={i}
                href={link.url || "#"}
                preserveScroll
                preserveState
                data={{ q: (q || "").trim(), estado, sucursal }}
                className={`px-3 py-1 rounded-lg border ${
                  link.active
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-50"
                } ${!link.url ? "pointer-events-none opacity-50" : ""}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dialog de detalle de solicitud */}
      <Dialog open={detalleAbierto} onClose={cerrarDetalle} fullWidth maxWidth="sm">
        <DialogTitle>Detalle de la solicitud</DialogTitle>
        <DialogContent dividers>
          {solicitudSeleccionada ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">N° Solicitud:</span>{" "}
                {solicitudSeleccionada.id_solicitud}
              </p>
              <p>
                <span className="font-semibold">Fecha:</span>{" "}
                {solicitudSeleccionada.fecha_sol
                  ? new Date(solicitudSeleccionada.fecha_sol).toLocaleString()
                  : "—"}
              </p>
              <p>
                <span className="font-semibold">Solicitante:</span>{" "}
                {solicitudSeleccionada.usuario?.name ?? "—"}
              </p>
              <p>
                <span className="font-semibold">Sucursal:</span>{" "}
                {[
                  solicitudSeleccionada.sucursal?.ciudad,
                  solicitudSeleccionada.sucursal?.direccion,
                ]
                  .filter(Boolean)
                  .join(" - ") || "—"}
              </p>
              <p>
                <span className="font-semibold">Estado:</span>{" "}
                {solicitudSeleccionada.estado?.desc_estado ?? "—"}
              </p>
              <p>
                <span className="font-semibold">Insumo:</span>{" "}
                {solicitudSeleccionada.insumo?.nombre_insumo ?? "—"}
              </p>
              <p>
                <span className="font-semibold">Cantidad:</span>{" "}
                {solicitudSeleccionada.cantidad ?? "—"}
              </p>
              <p>
                <span className="font-semibold">Motivo:</span>{" "}
                {solicitudSeleccionada.motivo || "—"}
              </p>
            </div>
          ) : (
            <p>No se encontró la información de la solicitud.</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDetalle}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
