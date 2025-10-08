import React from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const isoToday = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "N/D");

export default function Edit() {
  const { solicitud } = usePage().props;

  const {
    data,
    setData,
    post,
    processing,
    errors,
    reset,
  } = useForm({
    // nombres que espera el controlador
    fecha_envio: solicitud?.fecha_envio || isoToday(),
    fecha_estimada: solicitud?.fecha_estimada || isoToday(),
    numero_camion: solicitud?.numero_camion || "",
    ruta_asignada: solicitud?.ruta_asignada || "",
    marcar_en_transito: false,
    motivo: "",
    nueva_fecha_propuesta: "",
  });

  const onAprobar = (e) => {
    e.preventDefault();
    post(route("sol.logistica.aprobar", solicitud.id_solicitud), {
      preserveScroll: true,
    });
  };

  const onRechazar = (e) => {
    e.preventDefault();
    post(route("sol.logistica.rechazar", solicitud.id_solicitud), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () =>
        reset("motivo", "nueva_fecha_propuesta"), // limpia inputs de rechazo
      data: {
        motivo: data.motivo,
        nueva_fecha_propuesta: data.nueva_fecha_propuesta || null,
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Logística #${solicitud.id_solicitud}`} />
      <div className="py-8 px-4 md:px-8">
        <div className="mx-auto max-w-3xl bg-white shadow rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              Logística Solicitud #{solicitud.id_solicitud}
            </h1>
            <Link href={route("logistica.index")} className="text-sm underline">
              Volver
            </Link>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <b>Insumo:</b> {solicitud.insumo_nombre} — <b>Cantidad:</b>{" "}
              {solicitud.cantidad}
            </p>
            <p>
              <b>Sucursal:</b> {solicitud.sucursal_nombre}
            </p>
            <p>
              <b>Solicitante:</b> {solicitud.usuario_nombre}
            </p>
            <p>
              <b>Estado solicitud:</b> {solicitud.estado_solicitud || "N/D"} —{" "}
              <b>Estado logística:</b>{" "}
              {(solicitud.estado_logistica || "pendiente").replace("_", " ")}
            </p>
            <p>
              <b>Último envío:</b> {fmt(solicitud.fecha_envio)} — <b>ETA:</b>{" "}
              {fmt(solicitud.fecha_estimada)}
            </p>
          </div>

          {/* Aprobar / actualizar datos */}
          <form onSubmit={onAprobar} className="space-y-3 border-t pt-4">
            <h2 className="font-medium">Aprobación / actualización</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de envío
                </label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={data.fecha_envio}
                  onChange={(e) => setData("fecha_envio", e.target.value)}
                />
                {errors.fecha_envio && (
                  <p className="text-red-600 text-sm">{errors.fecha_envio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha estimada de entrega
                </label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={data.fecha_estimada}
                  onChange={(e) => setData("fecha_estimada", e.target.value)}
                />
                {errors.fecha_estimada && (
                  <p className="text-red-600 text-sm">
                    {errors.fecha_estimada}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                N° de camión
              </label>
              <input
                className="w-full border rounded-lg p-2"
                value={data.numero_camion}
                onChange={(e) => setData("numero_camion", e.target.value)}
              />
              {errors.numero_camion && (
                <p className="text-red-600 text-sm">{errors.numero_camion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Asignación de ruta
              </label>
              <input
                className="w-full border rounded-lg p-2"
                value={data.ruta_asignada}
                onChange={(e) => setData("ruta_asignada", e.target.value)}
              />
              {errors.ruta_asignada && (
                <p className="text-red-600 text-sm">{errors.ruta_asignada}</p>
              )}
            </div>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.marcar_en_transito}
                onChange={(e) =>
                  setData("marcar_en_transito", e.target.checked)
                }
              />
              <span>Marcar como En tránsito</span>
            </label>

            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
            >
              {processing ? "Guardando…" : "Aprobar / Guardar"}
            </button>
          </form>

          {/* Rechazar */}
          <form onSubmit={onRechazar} className="space-y-3 border-t pt-4">
            <h2 className="font-medium">Rechazar</h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                Motivo del rechazo
              </label>
              <input
                className="w-full border rounded-lg p-2"
                value={data.motivo}
                onChange={(e) => setData("motivo", e.target.value)}
              />
              {errors.motivo && (
                <p className="text-red-600 text-sm">{errors.motivo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nueva fecha propuesta (opcional)
              </label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={data.nueva_fecha_propuesta}
                onChange={(e) =>
                  setData("nueva_fecha_propuesta", e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
            >
              {processing ? "Rechazando…" : "Rechazar y notificar"}
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
