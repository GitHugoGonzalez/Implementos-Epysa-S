import React, { useRef, useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2"; // 👈 agregado

export default function Edit() {
    const { insumo, imagen } = usePage().props;

    const fileRef = useRef(null);
    const inputId = "imagen-file";

    const [data, setData] = useState({
        nombre_insumo: insumo?.nombre_insumo ?? "",
        stock: insumo?.stock ?? 0,
        descripcion_insumo: insumo?.descripcion_insumo ?? "",
        precio_insumo: insumo?.precio_insumo ?? 0,
        imagen: null,
        eliminar_imagen: false,
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const currentImageUrl = preview || imagen?.url || null;

    const setField = (k, v) => setData(prev => ({ ...prev, [k]: v }));

    const buildFormData = () => {
        const fd = new FormData();
        fd.append("_method", "PUT");
        fd.append("nombre_insumo", data.nombre_insumo ?? "");
        fd.append("stock", String(data.stock ?? 0));
        fd.append("descripcion_insumo", data.descripcion_insumo ?? "");
        fd.append("precio_insumo", String(data.precio_insumo ?? 0));
        fd.append("eliminar_imagen", data.eliminar_imagen ? "1" : "0");
        if (data.imagen instanceof File) {
            fd.append("imagen", data.imagen);
        }
        return fd;
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const fd = buildFormData();

        router.post(route("insumos.update", insumo.id_insumo), fd, {
            headers: { "X-HTTP-Method-Override": "PUT" },

            onError: (errs) => {
                setErrors(errs || {});

                Swal.fire({
                    icon: "error",
                    title: "Error al guardar",
                    text: "Revisa los campos marcados en rojo.",
                    confirmButtonColor: "#d33",
                });
            },

            onSuccess: () => {
                setPreview(null);
                setField("imagen", null);
                setField("eliminar_imagen", false);
                if (fileRef.current) fileRef.current.value = "";

                Swal.fire({
                    icon: "success",
                    title: "Guardado correctamente",
                    text: "Los cambios se han actualizado.",
                    confirmButtonColor: "#3085d6",
                });
            },

            onFinish: () => setProcessing(false),

            forceFormData: true,
            preserveScroll: true,
        });
    };

    const onPickImage = (e) => {
        const f = e.target.files?.[0] || null;
        setField("imagen", f);
        setField("eliminar_imagen", false);
        setPreview(f ? URL.createObjectURL(f) : null);
    };

    const onRemoveImage = () => {
        setField("eliminar_imagen", true);
        setField("imagen", null);
        if (fileRef.current) fileRef.current.value = "";
        setPreview(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar Insumo #${insumo?.id_insumo}`} />
            <div className="py-8 px-4 md:px-8">
                <div className="mx-auto max-w-3xl bg-white shadow rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Editar Insumo</h1>
                    </div>

                    {/* Imagen */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Imagen</label>

                        {currentImageUrl ? (
                            <div className="flex items-center gap-3">
                                <img
                                    src={currentImageUrl}
                                    alt={data.nombre_insumo || "Imagen del insumo"}
                                    className="h-24 w-24 object-cover rounded-lg border"
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                                <div className="flex gap-2">
                                    <input
                                        id={inputId}
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onPickImage}
                                    />
                                    <label
                                        htmlFor={inputId}
                                        className="px-3 py-1.5 rounded bg-amber-500 text-white hover:opacity-90 cursor-pointer"
                                    >
                                        Cambiar
                                    </label>
                                    <button
                                        type="button"
                                        onClick={onRemoveImage}
                                        className="px-3 py-1.5 rounded bg-red-600 text-white hover:opacity-90"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <input
                                    id={inputId}
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={onPickImage}
                                />
                                <label
                                    htmlFor={inputId}
                                    className="px-3 py-1.5 rounded bg-blue-600 text-white hover:opacity-90 cursor-pointer"
                                >
                                    Subir imagen
                                </label>
                                <span className="text-xs text-gray-500">JPG / PNG / WEBP (máx. 4MB)</span>
                            </div>
                        )}

                        {errors.imagen && (
                            <p className="text-red-600 text-sm">{errors.imagen}</p>
                        )}
                    </div>

                    <form onSubmit={submit} className="space-y-4">

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre</label>
                            <input
                                className="w-full border rounded-lg p-2"
                                value={data.nombre_insumo}
                                onChange={(e) => setField("nombre_insumo", e.target.value)}
                            />
                            {errors.nombre_insumo && (
                                <p className="text-red-600 text-sm">{errors.nombre_insumo}</p>
                            )}
                        </div>

                        {/* Stock + Precio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Stock</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border rounded-lg p-2"
                                    value={data.stock}
                                    onChange={(e) => setField("stock", e.target.value)}
                                />
                                {errors.stock && (
                                    <p className="text-red-600 text-sm">{errors.stock}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Precio</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full border rounded-lg p-2"
                                    value={data.precio_insumo}
                                    onChange={(e) => setField("precio_insumo", e.target.value)}
                                />
                                {errors.precio_insumo && (
                                    <p className="text-red-600 text-sm">{errors.precio_insumo}</p>
                                )}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Descripción</label>
                            <textarea
                                className="w-full border rounded-lg p-2"
                                rows={4}
                                value={data.descripcion_insumo}
                                onChange={(e) => setField("descripcion_insumo", e.target.value)}
                            />
                            {errors.descripcion_insumo && (
                                <p className="text-red-600 text-sm">{errors.descripcion_insumo}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {processing ? "Guardando…" : "Guardar cambios"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
