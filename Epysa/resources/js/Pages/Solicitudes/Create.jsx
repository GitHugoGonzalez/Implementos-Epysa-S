import React from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";
import Modal from "@/Components/Modal";
export default function Create() {
    const { insumos, sucursales, estados, canMarkUrgent } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        id_insumo: "",
        id_sucursal: "",
        cantidad: 1,
        fecha_sol: new Date().toISOString().substring(0, 10),
        id_estado: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/solicitudes", {
            onSuccess: () =>
                reset({
                    id_insumo: "",
                    id_sucursal: "",
                    cantidad: 1,
                    fecha_sol: new Date().toISOString().substring(0, 10),
                    id_estado: "",
                }),
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 ">
            <Head title="Crear Solicitud" />
            <SimpleNav />
            <div className="py-8 px-4 md:px-8">
                <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold">
                            Solicitud de Insumo
                        </h1>
                        <Link href="/dashboard" className="text-sm underline">
                            Volver
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Insumo */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Insumo
                            </label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={data.id_insumo}
                                onChange={(e) =>
                                    setData("id_insumo", e.target.value)
                                }
                            >
                                <option value="">Selecciona un insumo…</option>
                                {insumos.map((i) => (
                                    <option
                                        key={i.id_insumo}
                                        value={i.id_insumo}
                                    >
                                        {i.nombre_insumo}
                                    </option>
                                ))}
                            </select>
                            {errors.id_insumo && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.id_insumo}
                                </p>
                            )}
                        </div>

                        {/* Sucursal */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Sucursal
                            </label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={data.id_sucursal}
                                onChange={(e) =>
                                    setData("id_sucursal", e.target.value)
                                }
                            >
                                <option value="">
                                    Selecciona una sucursal…
                                </option>
                                {sucursales.map((s) => (
                                    <option
                                        key={s.id_sucursal}
                                        value={s.id_sucursal}
                                    >
                                        {s.ciudad} — {s.direccion}
                                    </option>
                                ))}
                            </select>
                            {errors.id_sucursal && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.id_sucursal}
                                </p>
                            )}
                        </div>

                        {/* Cantidad y Fecha */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full border rounded-lg p-2"
                                    value={data.cantidad}
                                    onChange={(e) =>
                                        setData("cantidad", e.target.value)
                                    }
                                    placeholder="1"
                                />
                                {errors.cantidad && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.cantidad}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-2"
                                    value={data.fecha_sol}
                                    onChange={(e) =>
                                        setData("fecha_sol", e.target.value)
                                    }
                                />
                                {errors.fecha_sol && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.fecha_sol}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Estado (Urgente bloqueado para no-admin) */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Estado
                            </label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={data.id_estado}
                                onChange={(e) =>
                                    setData("id_estado", e.target.value)
                                }
                            >
                                <option value="">Selecciona estado…</option>
                                {estados.map((estado) => (
                                    <option
                                        key={estado.id_estado}
                                        value={estado.id_estado}
                                        disabled={
                                            estado.desc_estado === "Urgente" &&
                                            !canMarkUrgent
                                        }
                                    >
                                        {estado.desc_estado}
                                    </option>
                                ))}
                            </select>
                            {errors.id_estado && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.id_estado}
                                </p>
                            )}
                            {!canMarkUrgent && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Solo administradores pueden seleccionar{" "}
                                    <b>Urgente</b>.
                                </p>
                            )}
                        </div>

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
        </div>
    );
}
