import React, { useRef, useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";
import Modal from "@/Components/Modal";
export default function Create() {
    const { data, setData, post, processing, errors, reset, transform } =
        useForm({
            nombre_insumo: "",
            stock: "",
            descripcion_insumo: "",
            precio_insumo: "", // guardaremos "9990" (sin formato) para CLP
            imagen: null,
        });

    const [preview, setPreview] = useState(null);
    const fileRef = useRef(null);

    // Helpers CLP
    const onlyDigits = (str) => (str || "").toString().replace(/\D/g, "");
    const formatCLP = (val) => {
        const digits = onlyDigits(val);
        if (!digits) return "";
        return new Intl.NumberFormat("es-CL").format(Number(digits));
    };

    // Enviar como FormData (necesario para archivo)
    transform((payload) => {
        const fd = new FormData();
        // Enviamos precio_insumo sin formato (solo dígitos)
        const cleanPrecio = onlyDigits(payload.precio_insumo);
        fd.append("nombre_insumo", payload.nombre_insumo ?? "");
        fd.append("stock", payload.stock ?? "");
        fd.append("descripcion_insumo", payload.descripcion_insumo ?? "");
        fd.append("precio_insumo", cleanPrecio || ""); // "9990"
        if (payload.imagen) fd.append("imagen", payload.imagen);
        return fd;
    });

    const handleFile = (e) => {
        const file = e.target.files?.[0] ?? null;
        setData("imagen", file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("insumos.store"), {
            onSuccess: () => {
                reset();
                setPreview(null);
                if (fileRef.current) fileRef.current.value = "";
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Agregar Insumo" />
            <SimpleNav />
            <div className="py-8 px-4 md:px-8">
                <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">
                            Agregar Insumo
                        </h1>
                        <Link
                            href={route("dashboard")}
                            className="text-sm underline"
                        >
                            Volver
                        </Link>
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-4"
                        encType="multipart/form-data"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Nombre
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-lg border p-2"
                                value={data.nombre_insumo}
                                onChange={(e) =>
                                    setData("nombre_insumo", e.target.value)
                                }
                                placeholder="Ej: Detergente industrial"
                            />
                            {errors.nombre_insumo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.nombre_insumo}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full rounded-lg border p-2"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData("stock", e.target.value)
                                    }
                                    placeholder="0"
                                />
                                {errors.stock && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.stock}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Precio
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full rounded-lg border p-2"
                                    value={data.precio_insumo}
                                    onChange={(e) =>
                                        setData("precio_insumo", e.target.value)
                                    }
                                    placeholder="0.00"
                                />
                                {errors.precio_insumo && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.precio_insumo}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Descripción
                            </label>
                            <textarea
                                className="w-full rounded-lg border p-2"
                                rows={4}
                                value={data.descripcion_insumo}
                                onChange={(e) =>
                                    setData(
                                        "descripcion_insumo",
                                        e.target.value
                                    )
                                }
                                placeholder="Detalle del insumo…"
                            />
                            {errors.descripcion_insumo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.descripcion_insumo}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Imagen (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileRef}
                                onChange={handleFile}
                                className="w-full rounded-lg border p-2 "
                            />
                            {errors.imagen && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.imagen}
                                </p>
                            )}

                            {preview && (
                                <div className="mt-3">
                                    <span className="mb-1 block text-sm text-gray-600">
                                        Vista previa
                                    </span>
                                    <img
                                        src={preview}
                                        alt="preview"
                                        className="max-h-48 rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {processing ? "Guardando…" : "Guardar"}
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
                        Insumo agregado exitosamente...
                    </p>
                </div>
            </Modal>
        </div>
    );
}
