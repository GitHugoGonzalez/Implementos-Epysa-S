import React, { useEffect, useMemo } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2"; // 👈 agregado

export default function CreateUser() {
    const { sucursales = [], rolesPermitidos = [] } = usePage().props;

    // Normaliza roles
    const roleOptions = useMemo(() => {
        return rolesPermitidos.map((r) =>
            typeof r === "string" ? { id_rol: null, nombre_rol: r } : r
        );
    }, [rolesPermitidos]);

    const firstRole = roleOptions[0] || { id_rol: "", nombre_rol: "" };

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        id_rol: firstRole.id_rol ?? "",
        nombre_rol: firstRole.id_rol ? "" : firstRole.nombre_rol ?? "",
        id_sucursal: "",
    });

    /** Si hay error importante en email, mostrar SweetAlert */
    useEffect(() => {
        if (errors?.email) {
            Swal.fire({
                icon: "error",
                title: "Error en el email",
                text: errors.email,
                confirmButtonColor: "#d33",
            });
        }
    }, [errors?.email]);

    const submit = (e) => {
        e.preventDefault();

        post("/admin/usuarios", {
            onError: (err) => {
                Swal.fire({
                    icon: "error",
                    title: "No se pudo crear el usuario",
                    text: "Revisa los campos marcados.",
                });
            },

            onSuccess: () => {
                Swal.fire({
                    icon: "success",
                    title: "Usuario creado",
                    text: "El usuario se registró correctamente.",
                    confirmButtonColor: "#3085d6",
                });

                reset({
                    name: "",
                    email: "",
                    password: "",
                    id_rol: firstRole.id_rol ?? "",
                    nombre_rol: firstRole.id_rol
                        ? ""
                        : firstRole.nombre_rol ?? "",
                    id_sucursal: "",
                });
            },
        });
    };

    const handleChangeRol = (e) => {
        const idx = Number(e.target.value);
        const sel = roleOptions[idx] || { id_rol: "", nombre_rol: "" };

        setData("id_rol", sel.id_rol ?? "");
        setData("nombre_rol", sel.id_rol ? "" : sel.nombre_rol ?? "");
    };

    const selectedRoleIndex = (() => {
        if (data.id_rol) {
            const i = roleOptions.findIndex(
                (r) => String(r.id_rol) === String(data.id_rol)
            );
            if (i >= 0) return String(i);
        }
        if (data.nombre_rol) {
            const i = roleOptions.findIndex(
                (r) =>
                    r.nombre_rol?.toLowerCase() ===
                    data.nombre_rol?.toLowerCase()
            );
            if (i >= 0) return String(i);
        }
        return "0";
    })();

    return (
        <AuthenticatedLayout hideNav>
            <Head title="Crear usuario (Jefe)" />
            <div className="py-8 px-4 md:px-8">
                <div className="mx-auto max-w-2xl bg-white shadow rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold">Crear usuario</h1>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nombre
                            </label>
                            <input
                                className="w-full border rounded-lg p-2"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full border rounded-lg p-2"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                className="w-full border rounded-lg p-2"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Rol
                            </label>
                            <select
                                className="w-full border rounded-lg p-2"
                                value={selectedRoleIndex}
                                onChange={handleChangeRol}
                            >
                                {roleOptions.map((r, i) => (
                                    <option
                                        key={`${r.id_rol ?? r.nombre_rol}-${i}`}
                                        value={i}
                                    >
                                        {r.nombre_rol}
                                    </option>
                                ))}
                            </select>

                            {(errors.id_rol || errors.nombre_rol) && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.id_rol || errors.nombre_rol}
                                </p>
                            )}
                        </div>

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
                                    <option key={s.id_sucursal} value={s.id_sucursal}>
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

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {processing ? "Creando…" : "Crear usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
