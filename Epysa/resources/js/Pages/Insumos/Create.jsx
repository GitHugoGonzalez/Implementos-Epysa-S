import React, { useRef, useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";
import Modal from "@/Components/Modal";
import { Snackbar, Alert } from "@mui/material"; // ✅ MUI notification

export default function Create() {
    const { data, setData, post, processing, errors, reset, transform } =
        useForm({
            nombre_insumo: "",
            stock: "",
            descripcion_insumo: "",
            precio_insumo: "",
            categoria: "",
            imagen: null,
        });

    const [preview, setPreview] = useState(null);
    const [imageError, setImageError] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false); // ✅ snackbar
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
        const cleanPrecio = onlyDigits(payload.precio_insumo);
        fd.append("nombre_insumo", payload.nombre_insumo ?? "");
        fd.append("stock", payload.stock ?? "");
        fd.append("descripcion_insumo", payload.descripcion_insumo ?? "");
        fd.append("precio_insumo", cleanPrecio || "");
        fd.append("categoria", payload.categoria ?? "");
        if (payload.imagen) fd.append("imagen", payload.imagen);
        return fd;
    });

    // ✅ Validación de imagen en front (tipo + tamaño + es realmente una imagen)
    const MAX_MB = 4;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

    const validateImage = async (file) => {
        if (!ALLOWED.includes(file.type)) {
            return "Formato no permitido. Usa JPG, PNG o WEBP.";
        }
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > MAX_MB) {
            return `La imagen supera ${MAX_MB}MB.`;
        }
        const objectUrl = URL.createObjectURL(file);
        try {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () =>
                    reject(new Error("Archivo no es una imagen válida"));
                img.src = objectUrl;
            });
        } catch (e) {
            URL.revokeObjectURL(objectUrl);
            return "El archivo no pudo leerse como imagen.";
        }
        URL.revokeObjectURL(objectUrl);
        return "";
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0] ?? null;

        if (!file) {
            setData("imagen", null);
            setPreview(null);
            setImageError("");
            return;
        }

        const err = await validateImage(file);
        if (err) {
            setImageError(err);
            setData("imagen", null);
            setPreview(null);
            if (fileRef.current) fileRef.current.value = "";
            return;
        }

        setImageError("");
        setData("imagen", file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
    };

    const submit = (e) => {
        e.preventDefault();

        if (imageError) return;

        post(route("insumos.store"), {
            onSuccess: () => {
                reset();
                setPreview(null);
                setImageError("");
                if (fileRef.current) fileRef.current.value = "";
                setSnackbarOpen(true); // ✅ mostrar notificación de éxito
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
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-4"
                        encType="multipart/form-data"
                    >
                        {/* NOMBRE */}
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
                                placeholder="Ej: Filtro de aceite 5W30"
                                maxLength={150}
                            />
                            <div className="mt-1 flex justify-between text-xs text-gray-400">
                                <span>Máx. 150 caracteres</span>
                                <span>
                                    {data.nombre_insumo?.length ?? 0}/150
                                </span>
                            </div>
                            {errors.nombre_insumo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.nombre_insumo}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* STOCK */}
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

                            {/* PRECIO */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Precio
                                </label>
                                <input
                                    type="number"
                                    step="1" // 🔹 permite cualquier valor entero (16990, 12399, etc.)
                                    min="0"
                                    className="w-full rounded-lg border p-2"
                                    value={data.precio_insumo}
                                    onChange={(e) =>
                                        setData("precio_insumo", e.target.value)
                                    }
                                    placeholder="Ej: 16990"
                                />
                                {errors.precio_insumo && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.precio_insumo}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* CATEGORÍA */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Categoría
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-lg border p-2"
                                value={data.categoria}
                                onChange={(e) =>
                                    setData("categoria", e.target.value)
                                }
                                placeholder="Ej: Mecánica, Lubricantes, Frenos..."
                                maxLength={100}
                            />
                            <div className="mt-1 flex justify-between text-xs text-gray-400">
                                <span>Máx. 100 caracteres</span>
                                <span>{data.categoria?.length ?? 0}/100</span>
                            </div>
                            {errors.categoria && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.categoria}
                                </p>
                            )}
                        </div>

                        {/* DESCRIPCIÓN */}
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
                                maxLength={500}
                            />
                            <div className="mt-1 flex justify-between text-xs text-gray-400">
                                <span>Máx. 500 caracteres</span>
                                <span>
                                    {data.descripcion_insumo?.length ?? 0}/500
                                </span>
                            </div>
                            {errors.descripcion_insumo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.descripcion_insumo}
                                </p>
                            )}
                        </div>

                        {/* IMAGEN */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Imagen (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileRef}
                                onChange={handleFile}
                                className="w-full rounded-lg border p-2"
                            />
                            {imageError && (
                                <p className="mt-1 text-sm text-red-600">
                                    {imageError}
                                </p>
                            )}
                            {errors.imagen && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.imagen}
                                </p>
                            )}

                            {preview && !imageError && (
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
                                disabled={processing || !!imageError}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {processing ? "Guardando…" : "Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de "cargando" mientras processing es true */}
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
                        Guardando insumo...
                    </p>
                </div>
            </Modal>

            {/* ✅ Snackbar de éxito MUI */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    Insumo creado correctamente.
                </Alert>
            </Snackbar>
        </div>
    );
}
