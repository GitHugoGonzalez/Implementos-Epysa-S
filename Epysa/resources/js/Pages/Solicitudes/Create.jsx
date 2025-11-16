import React, { useState } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";
import Modal from "@/Components/Modal";

// 🔔 MUI Snackbar
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Create() {
  // 👇 defaults para que nunca crashee si alguna prop no llega
  const {
    insumos = [],
    sucursales = [],
    estados = [],
    canMarkUrgent = false,
  } = usePage().props;

  // ID de 'pendiente' si existe (no obligatorio)
  const idPendiente =
    (estados || []).find((e) => e.desc_estado?.toLowerCase() === "pendiente")
      ?.id_estado ?? null;

  const { data, setData, post, processing, errors, reset } = useForm({
    id_insumo: "",
    id_sucursal: "",
    cantidad: 1,
    fecha_sol: new Date().toISOString().substring(0, 10),
    es_urgente: false,
    motivo: "", // 👈 nuevo campo
    // id_estado: idPendiente,
  });

  // Estado para Snackbar
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  const handleSnackClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackOpen(false);
  };

  const submit = (e) => {
    e.preventDefault();
    post("/solicitudes", {
      onSuccess: () => {
        // 🔹 Resetear a valores iniciales definidos en useForm
        reset();

        // 🔹 Opcional: asegurar fecha actual después del reset
        setData("fecha_sol", new Date().toISOString().substring(0, 10));

        // 🔹 Mostrar Snackbar de éxito
        setSnackMessage("Solicitud creada correctamente.");
        setSnackOpen(true);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head title="Crear Solicitud" />
      <SimpleNav />
      <div className="py-8 px-4 md:px-8">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Solicitud de Insumo</h1>
            <Link href="/dashboard" className="text-sm underline">
              Volver
            </Link>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Insumo */}
            <div>
              <label className="block text-sm font-medium mb-1">Insumo</label>
              <select
                className="w-full border rounded-lg p-2"
                value={data.id_insumo}
                onChange={(e) => setData("id_insumo", e.target.value)}
              >
                <option value="">Selecciona un insumo…</option>
                {(insumos || []).map((i) => (
                  <option key={i.id_insumo} value={i.id_insumo}>
                    {i.nombre_insumo}
                  </option>
                ))}
              </select>
              {errors.id_insumo && (
                <p className="text-red-600 text-sm mt-1">{errors.id_insumo}</p>
              )}
            </div>

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium mb-1">Sucursal</label>
              <select
                className="w-full border rounded-lg p-2"
                value={data.id_sucursal}
                onChange={(e) => setData("id_sucursal", e.target.value)}
              >
                <option value="">Selecciona una sucursal…</option>
                {(sucursales || []).map((s) => (
                  <option key={s.id_sucursal} value={s.id_sucursal}>
                    {s.ciudad} — {s.direccion}
                  </option>
                ))}
              </select>
              {errors.id_sucursal && (
                <p className="text-red-600 text-sm mt-1">{errors.id_sucursal}</p>
              )}
            </div>

            {/* Cantidad y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded-lg p-2"
                  value={data.cantidad}
                  onChange={(e) => setData("cantidad", e.target.value)}
                  placeholder="1"
                />
                {errors.cantidad && (
                  <p className="text-red-600 text-sm mt-1">{errors.cantidad}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={data.fecha_sol}
                  onChange={(e) => setData("fecha_sol", e.target.value)}
                />
                {errors.fecha_sol && (
                  <p className="text-red-600 text-sm mt-1">{errors.fecha_sol}</p>
                )}
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Motivo de la Solicitud (máx. 500 caracteres)
              </label>
              <textarea
                className="w-full border rounded-lg p-2 min-h-[100px]"
                value={data.motivo}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setData("motivo", value);
                  }
                }}
                placeholder="Explica brevemente por qué necesitas este insumo…"
              />
              <div className="flex justify-between text-xs mt-1">
                {errors.motivo ? (
                  <p className="text-red-600">{errors.motivo}</p>
                ) : (
                  <p className="text-gray-500">{data.motivo.length}/500</p>
                )}
              </div>
            </div>

            {/* Urgente (solo Jefe) */}
            <div className="flex items-center gap-2">
              <input
                id="es_urgente"
                type="checkbox"
                className="h-4 w-4"
                checked={!!data.es_urgente}
                onChange={(e) => setData("es_urgente", e.target.checked)}
                disabled={!canMarkUrgent}
              />
              <label htmlFor="es_urgente" className="text-sm">
                Marcar como <b>urgente</b>
              </label>
            </div>
            {!canMarkUrgent && (
              <p className="text-xs text-gray-500">
                Solo el <b>jefe</b> puede marcar una solicitud como urgente.
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                {processing ? "Enviando…" : "Crear solicitud"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de "Enviando..." */}
      <Modal show={processing} onClose={() => {}}>
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-10 w-10 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <p className="mt-4 text-lg font-semibold text-blue-600">
            Enviando Solicitud...
          </p>
        </div>
      </Modal>

      {/* Snackbar de MUI para alerta visual */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
