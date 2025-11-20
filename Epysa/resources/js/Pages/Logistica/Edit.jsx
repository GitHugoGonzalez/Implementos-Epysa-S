import React, { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2";

const isoToday = () => new Date().toISOString().slice(0, 10);

// NOTA: Se mantiene la lógica de showAlert como estaba en tu código base
const showAlert = (message, type) => {
    return Swal.fire({
        icon: type === "success" ? "success" : "error", // Cambié 'info' a 'error' para rechazo
        title: type === "success" ? "Éxito" : "Rechazada",
        text: message,
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
    });
};

export default function Edit() {
    const { solicitud } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        fecha_envio: solicitud?.fecha_envio || isoToday(),
        fecha_estimada: solicitud?.fecha_estimada || isoToday(),
        numero_camion: solicitud?.numero_camion || "",
        ruta_asignada: solicitud?.ruta_asignada || "",
        motivo: "",
        nueva_fecha_propuesta: "",
    });

    const onAprobarYGuardar = (e) => {
        e.preventDefault();
        post(route("sol.logistica.aprobar", solicitud.id_solicitud), {
            preserveScroll: true,
            onSuccess: () => {
                showAlert(" Solicitud aprobada correctamente.", "success").then(
                    () => {
                        window.location.href = route("logistica.index");
                    }
                );
            },
            onError: () => {
                showAlert("Error al aprobar la solicitud.", "error");
            },
        });
    };

    const onRechazar = (e) => {
        e.preventDefault();
        post(route("sol.logistica.rechazar", solicitud.id_solicitud), {
            preserveScroll: true,
            preserveState: true,
            data: {
                motivo: data.motivo,
                nueva_fecha_propuesta: data.nueva_fecha_propuesta || null,
            },
            onSuccess: () => {
                reset("motivo", "nueva_fecha_propuesta");
                showAlert(
                    " Solicitud rechazada y notificada al solicitante.",
                    "error"
                ).then(() => {
                    window.location.href = route("logistica.index");
                });
            },
            onError: () => {
                showAlert("Error al rechazar la solicitud.", "error");
            },
        });
    };

    const isApproved = solicitud.estado_logistica === "aprobado";
    const approveButtonText = isApproved
        ? "Solicitud Aprobada"
        : processing
        ? "Aprobando…"
        : "Aprobar y Guardar";
    const approveButtonClass = isApproved
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:opacity-90";

    return (
        <AuthenticatedLayout>
            <Head title={`Logística #${solicitud.id_solicitud}`} />
            <div className="py-8 px-4 md:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {" "}
                    {/* Amplié el ancho a max-w-7xl para las dos columnas */}
                    {/* 1. DATOS DE LA SOLICITUD (ARRIBA) */}
                    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-800">
                                Solicitud de Logística ID:{" "}
                                {solicitud.id_solicitud}
                            </h1>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700 pt-2 border-t border-gray-100">
                            <div>
                                <p className="font-semibold text-grey-500">
                                    Insumo
                                </p>
                                <p className="font-medium">
                                    {solicitud.insumo_nombre}{" "}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500">
                                    Cantidad
                                </p>
                                <p className="font-medium">
                                    {solicitud.cantidad}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500">
                                    Sucursal
                                </p>
                                <p className="font-medium">
                                    {solicitud.sucursal_nombre}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500">
                                    Solicitante
                                </p>
                                <p className="font-medium">
                                    {solicitud.usuario_nombre}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* 2. CONTENEDOR PRINCIPAL: APROBAR (IZQUIERDA) Y RECHAZAR (DERECHA) */}
                    {/* Usamos grid-cols-2 para colocarlos uno al lado del otro en pantallas grandes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* A. FORMULARIO DE APROBACIÓN (IZQUIERDA) */}
                        <form
                            onSubmit={onAprobarYGuardar}
                            className="bg-white shadow rounded-2xl p-6 space-y-4  "
                        >
                            <h2 className="text-xl font-semibold ">
                                Aprobar y Asignar Envío
                            </h2>
                            <p className="text-sm text-gray-600">
                                Complete los detalles de envío para iniciar el
                                proceso de logística.
                            </p>

                            <div className="space-y-4">
                                {" "}
                                {/* Mantengo inputs apilados */}
                                {/* Campos de Fecha y Camión */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Fecha de envío
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2 "
                                        value={data.fecha_envio}
                                        onChange={(e) =>
                                            setData(
                                                "fecha_envio",
                                                e.target.value
                                            )
                                        }
                                        disabled={isApproved}
                                    />
                                    {errors.fecha_envio && (
                                        <p className="text-red-600 text-sm">
                                            {errors.fecha_envio}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Fecha estimada de entrega (ETA)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2 "
                                        value={data.fecha_estimada}
                                        onChange={(e) =>
                                            setData(
                                                "fecha_estimada",
                                                e.target.value
                                            )
                                        }
                                        disabled={isApproved}
                                    />
                                    {errors.fecha_estimada && (
                                        <p className="text-red-600 text-sm">
                                            {errors.fecha_estimada}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        N° de camión
                                    </label>
                                    <input
                                        className="w-full border rounded-lg p-2 "
                                        value={data.numero_camion}
                                        onChange={(e) =>
                                            setData(
                                                "numero_camion",
                                                e.target.value
                                            )
                                        }
                                        disabled={isApproved}
                                    />
                                    {errors.numero_camion && (
                                        <p className="text-red-600 text-sm">
                                            {errors.numero_camion}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Asignación de ruta
                                    </label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={data.ruta_asignada}
                                        onChange={(e) =>
                                            setData(
                                                "ruta_asignada",
                                                e.target.value
                                            )
                                        }
                                        disabled={isApproved}
                                    />
                                    {errors.ruta_asignada && (
                                        <p className="text-red-600 text-sm">
                                            {errors.ruta_asignada}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || isApproved}
                                className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition duration-150 ${approveButtonClass}`}
                            >
                                {approveButtonText}
                            </button>
                        </form>

                        {/* B. FORMULARIO DE RECHAZO (DERECHA) */}
                        <div className="bg-white shadow rounded-2xl p-6 space-y-4  ">
                            <h2 className="text-xl font-semibold ">
                                Rechazar Solicitud
                            </h2>
                            <p className="text-sm text-gray-600">
                                Indique el motivo del rechazo y, opcionalmente,
                                proponga una nueva fecha al solicitante.
                            </p>

                            <form onSubmit={onRechazar} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Motivo del rechazo (Obligatorio)
                                    </label>
                                    <input
                                        className="w-full border rounded-lg p-2 "
                                        value={data.motivo}
                                        onChange={(e) =>
                                            setData("motivo", e.target.value)
                                        }
                                        disabled={isApproved}
                                    />
                                    {errors.motivo && (
                                        <p className="text-red-600 text-sm">
                                            {errors.motivo}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Nueva fecha propuesta (opcional)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2 "
                                        value={data.nueva_fecha_propuesta}
                                        onChange={(e) =>
                                            setData(
                                                "nueva_fecha_propuesta",
                                                e.target.value
                                            )
                                        }
                                        disabled={isApproved}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || isApproved}
                                    className="w-full px-4 py-2 rounded-lg  font-semibold bg-red-600 text-white hover:opacity-90 disabled:opacity-50 transition duration-150"
                                >
                                    {processing
                                        ? "Rechazando…"
                                        : "Rechazar y notificar"}
                                </button>
                            </form>
                        </div>
                    </div>
                    {/* FIN DEL CONTENEDOR PRINCIPAL */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
