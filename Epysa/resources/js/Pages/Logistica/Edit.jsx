import React from "react";
import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Edit() {
  const { solicitud } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    log_fecha_envio: solicitud.log_fecha_envio || new Date().toISOString().substring(0,10),
    log_fecha_estimada: solicitud.log_fecha_estimada || solicitud.eta_calculada || new Date().toISOString().substring(0,10),
    log_numero_camion: solicitud.log_numero_camion || "",
    log_ruta_asignada: solicitud.log_ruta_asignada || "",
    marcar_enviada: false,
    motivo: "",
    nueva_fecha_propuesta: "", // para rechazo
  });

  const onAprobar = (e) => {
    e.preventDefault();
    post(route('sol.logistica.aprobar', solicitud.id_solicitud));
  };

  const onRechazar = (e) => {
    e.preventDefault();
    post(route('sol.logistica.rechazar', solicitud.id_solicitud), {
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
            <h1 className="text-xl font-semibold">Logística Solicitud #{solicitud.id_solicitud}</h1>
            <Link href={route('logistica.index')} className="text-sm underline">Volver</Link>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p><b>Insumo:</b> {solicitud.insumo_nombre} — <b>Cantidad:</b> {solicitud.cantidad}</p>
            <p><b>Sucursal:</b> {solicitud.sucursal_nombre}</p>
            <p><b>Solicitante:</b> {solicitud.usuario_nombre}</p>
            <p><b>ETA (sistema):</b> {solicitud.eta_calculada || 'N/D'} — <b>Deadline:</b> {solicitud.deadline_at || 'N/D'}</p>
          </div>

          {/* Aprobar / actualizar datos */}
          <form onSubmit={onAprobar} className="space-y-3 border-t pt-4">
            <h2 className="font-medium">Aprobación / actualización</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de envío</label>
                <input type="date" className="w-full border rounded-lg p-2"
                  value={data.log_fecha_envio}
                  onChange={(e) => setData('log_fecha_envio', e.target.value)} />
                {errors.log_fecha_envio && <p className="text-red-600 text-sm">{errors.log_fecha_envio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha estimada de entrega</label>
                <input type="date" className="w-full border rounded-lg p-2"
                  value={data.log_fecha_estimada}
                  onChange={(e) => setData('log_fecha_estimada', e.target.value)} />
                {errors.log_fecha_estimada && <p className="text-red-600 text-sm">{errors.log_fecha_estimada}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">N° de camión</label>
              <input className="w-full border rounded-lg p-2"
                value={data.log_numero_camion}
                onChange={(e) => setData('log_numero_camion', e.target.value)} />
              {errors.log_numero_camion && <p className="text-red-600 text-sm">{errors.log_numero_camion}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Asignación de ruta</label>
              <input className="w-full border rounded-lg p-2"
                value={data.log_ruta_asignada}
                onChange={(e) => setData('log_ruta_asignada', e.target.value)} />
              {errors.log_ruta_asignada && <p className="text-red-600 text-sm">{errors.log_ruta_asignada}</p>}
            </div>

            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={data.marcar_enviada}
                onChange={(e) => setData('marcar_enviada', e.target.checked)} />
              <span>Marcar como Enviada</span>
            </label>

            <button type="submit" disabled={processing}
              className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50">
              {processing ? 'Guardando…' : 'Aprobar / Guardar'}
            </button>
          </form>

          {/* Rechazar */}
          <form onSubmit={onRechazar} className="space-y-3 border-t pt-4">
            <h2 className="font-medium">Rechazar</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Motivo del rechazo</label>
              <input className="w-full border rounded-lg p-2"
                value={data.motivo}
                onChange={(e) => setData('motivo', e.target.value)} />
              {errors.motivo && <p className="text-red-600 text-sm">{errors.motivo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nueva fecha propuesta (opcional)</label>
              <input type="date" className="w-full border rounded-lg p-2"
                value={data.nueva_fecha_propuesta}
                onChange={(e) => setData('nueva_fecha_propuesta', e.target.value)} />
            </div>

            <button type="submit" disabled={processing}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 disabled:opacity-50">
              {processing ? 'Rechazando…' : 'Rechazar y notificar'}
            </button>
          </form>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
