import React, { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2";

const isoToday = () => new Date().toISOString().slice(0, 10);

const showAlert = (message, type) => {
    return Swal.fire({
        icon: type === "success" ? "success" : "error",
        title: type === "success" ? "Éxito" : "Rechazada",
        text: message,
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
    });
};

export default function Edit() {
    const { solicitud } = usePage().props;

    // Form para APROBACIÓN
    const { 
        data: aprobarData, 
        setData: setAprobarData, 
        post: postAprobar, 
        processing: aprobarProcessing, 
        errors: aprobarErrors, 
        reset: resetAprobar 
    } = useForm({
        fecha_envio: solicitud?.fecha_envio || isoToday(),
        fecha_estimada: solicitud?.fecha_estimada || isoToday(),
        numero_camion: solicitud?.numero_camion || "",
        ruta_asignada: solicitud?.ruta_asignada || "",
        marcar_en_transito: false,
        motivo: "",
    });

    // Form separado para RECHAZO
    const { 
        data: rechazarData, 
        setData: setRechazarData, 
        post: postRechazar, 
        processing: rechazarProcessing, 
        errors: rechazarErrors, 
        reset: resetRechazar 
    } = useForm({
        motivo: "",
        nueva_fecha_propuesta: "",
    });

    const onAprobarYGuardar = (e) => {
        e.preventDefault();
        postAprobar(route("sol.logistica.aprobar", solicitud.id_solicitud), {
            preserveScroll: true,
            onSuccess: () => {
                showAlert("Solicitud aprobada correctamente.", "success").then(
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
        postRechazar(route("sol.logistica.rechazar", solicitud.id_solicitud), {
            preserveScroll: true,
            onSuccess: () => {
                resetRechazar();
                showAlert(
                    "Solicitud rechazada y notificada al solicitante.",
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

    const isApproved = solicitud.estado_logistica === "aprobado" || solicitud.estado_logistica === "en_transito";
    const isRejected = solicitud.estado_logistica === "rechazado";
    
    const approveButtonText = isApproved
        ? "Solicitud Aprobada"
        : aprobarProcessing
            ? "Aprobando…"
            : "Aprobar y Guardar";
    
    const approveButtonClass = isApproved || isRejected
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:opacity-90";

    const rejectButtonClass = isApproved || isRejected
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-600 hover:opacity-90";

    return (
        <AuthenticatedLayout>
            <Head title={`Logística #${solicitud.id_solicitud}`} />
            <div className="py-8 px-4 md:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* 1. DATOS DE LA SOLICITUD (ARRIBA) */}
                    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-800">
                                Solicitud de Logística ID: {solicitud.id_solicitud}
                            </h1>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                solicitud.estado_logistica === 'pendiente' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : solicitud.estado_logistica === 'en_transito'
                                    ? 'bg-blue-100 text-blue-800'
                                    : solicitud.estado_logistica === 'rechazado'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {solicitud.estado_logistica || 'Pendiente'}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700 pt-2 border-t border-gray-100">
                            <div>
                                <p className="font-semibold text-grey-500">Insumo</p>
                                <p className="font-medium">{solicitud.insumo_nombre}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500">Cantidad</p>
                                <p className="font-medium">{solicitud.cantidad}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500">Sucursal</p>
                                <p className="font-medium">{solicitud.sucursal_nombre}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500">Solicitante</p>
                                <p className="font-medium">{solicitud.usuario_nombre}</p>
                            </div>
                        </div>
                        
                        {/* Mostrar información de logística si ya existe */}
                        {(solicitud.fecha_envio || solicitud.numero_camion) && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-blue-800 mb-2">Información de Logística Actual</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    {solicitud.fecha_envio && (
                                        <div>
                                            <p className="font-semibold text-blue-600">Fecha Envío</p>
                                            <p>{new Date(solicitud.fecha_envio).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {solicitud.fecha_estimada && (
                                        <div>
                                            <p className="font-semibold text-blue-600">Fecha Estimada</p>
                                            <p>{new Date(solicitud.fecha_estimada).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {solicitud.numero_camion && (
                                        <div>
                                            <p className="font-semibold text-blue-600">N° Camión</p>
                                            <p>{solicitud.numero_camion}</p>
                                        </div>
                                    )}
                                    {solicitud.ruta_asignada && (
                                        <div>
                                            <p className="font-semibold text-blue-600">Ruta</p>
                                            <p>{solicitud.ruta_asignada}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. CONTENEDOR PRINCIPAL: APROBAR Y RECHAZAR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* A. FORMULARIO DE APROBACIÓN (IZQUIERDA) */}
                        <form onSubmit={onAprobarYGuardar} className="bg-white shadow rounded-2xl p-6 space-y-4">
                            <h2 className="text-xl font-semibold">Aprobar y Asignar Envío</h2>
                            <p className="text-sm text-gray-600">
                                Complete los detalles de envío para iniciar el proceso de logística.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Fecha de envío *
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2"
                                        value={aprobarData.fecha_envio}
                                        onChange={(e) => setAprobarData("fecha_envio", e.target.value)}
                                        disabled={isApproved || isRejected}
                                        required
                                    />
                                    {aprobarErrors.fecha_envio && (
                                        <p className="text-red-600 text-sm">{aprobarErrors.fecha_envio}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Fecha estimada de entrega (ETA) *
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2"
                                        value={aprobarData.fecha_estimada}
                                        onChange={(e) => setAprobarData("fecha_estimada", e.target.value)}
                                        disabled={isApproved || isRejected}
                                        min={aprobarData.fecha_envio}
                                        required
                                    />
                                    {aprobarErrors.fecha_estimada && (
                                        <p className="text-red-600 text-sm">{aprobarErrors.fecha_estimada}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        N° de camión *
                                    </label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={aprobarData.numero_camion}
                                        onChange={(e) => setAprobarData("numero_camion", e.target.value)}
                                        disabled={isApproved || isRejected}
                                        required
                                    />
                                    {aprobarErrors.numero_camion && (
                                        <p className="text-red-600 text-sm">{aprobarErrors.numero_camion}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Asignación de ruta *
                                    </label>
                                    <input
                                        className="w-full border rounded-lg p-2"
                                        value={aprobarData.ruta_asignada}
                                        onChange={(e) => setAprobarData("ruta_asignada", e.target.value)}
                                        disabled={isApproved || isRejected}
                                        required
                                    />
                                    {aprobarErrors.ruta_asignada && (
                                        <p className="text-red-600 text-sm">{aprobarErrors.ruta_asignada}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="marcar_en_transito"
                                        checked={aprobarData.marcar_en_transito}
                                        onChange={(e) => setAprobarData("marcar_en_transito", e.target.checked)}
                                        disabled={isApproved || isRejected}
                                        className="rounded"
                                    />
                                    <label htmlFor="marcar_en_transito" className="text-sm font-medium">
                                        Marcar como "En Tránsito" inmediatamente
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Comentario adicional (opcional)
                                    </label>
                                    <textarea
                                        className="w-full border rounded-lg p-2"
                                        value={aprobarData.motivo}
                                        onChange={(e) => setAprobarData("motivo", e.target.value)}
                                        disabled={isApproved || isRejected}
                                        rows="2"
                                        placeholder="Agregue algún comentario sobre el envío..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={aprobarProcessing || isApproved || isRejected}
                                className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition duration-150 ${approveButtonClass}`}
                            >
                                {approveButtonText}
                            </button>
                        </form>

                        {/* B. FORMULARIO DE RECHAZO (DERECHA) */}
                        <div className="bg-white shadow rounded-2xl p-6 space-y-4">
                            <h2 className="text-xl font-semibold">Rechazar Solicitud</h2>
                            <p className="text-sm text-gray-600">
                                Indique el motivo del rechazo y, opcionalmente, proponga una nueva fecha al solicitante.
                            </p>

                            <form onSubmit={onRechazar} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Motivo del rechazo *
                                    </label>
                                    <textarea
                                        className="w-full border rounded-lg p-2"
                                        value={rechazarData.motivo}
                                        onChange={(e) => setRechazarData("motivo", e.target.value)}
                                        disabled={isApproved || isRejected}
                                        rows="3"
                                        placeholder="Explique el motivo del rechazo..."
                                        required
                                    />
                                    {rechazarErrors.motivo && (
                                        <p className="text-red-600 text-sm">{rechazarErrors.motivo}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Nueva fecha propuesta (opcional)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2"
                                        value={rechazarData.nueva_fecha_propuesta}
                                        onChange={(e) => setRechazarData("nueva_fecha_propuesta", e.target.value)}
                                        disabled={isApproved || isRejected}
                                        min={isoToday()}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={rechazarProcessing || isApproved || isRejected}
                                    className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition duration-150 ${rejectButtonClass}`}
                                >
                                    {rechazarProcessing ? "Rechazando…" : "Rechazar y notificar"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}