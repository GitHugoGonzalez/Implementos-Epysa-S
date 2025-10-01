// resources/js/Pages/Auth/Register.jsx
import { Head, Link, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        rol: "operario", // 👈 nuevo
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout bare>
            <Head title="Crear cuenta" />
            <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
                <div className="hidden md:block">
                    <img
                        src="/imagenes/implementos.jpg"
                        alt="Implementos Epysa"
                        className="h-full w-full "
                    />
                </div>

                <div className="bg-white flex items-center justify-center px-6 md:px-10">
                    <div className="w-full max-w-sm">
                        <h1 className="text-[32px] md:text-[36px] font-black text-gray-900 text-center leading-tight">
                            Crea tu cuenta
                        </h1>

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            {/* Nombre */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-semibold text-gray-700 mb-1"
                                >
                                    Nombre
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    autoComplete="name"
                                    required
                                    className="w-full rounded-md bg-gray-100 border border-gray-200 focus:border-gray-400 focus:ring-0 px-4 py-2.5 text-sm placeholder-gray-400"
                                    placeholder="Tu nombre"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 mb-1"
                                >
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    autoComplete="username"
                                    required
                                    className="w-full rounded-md bg-gray-100 border border-gray-200 focus:border-gray-400 focus:ring-0 px-4 py-2.5 text-sm placeholder-gray-400"
                                    placeholder="tu@correo.co"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Rol */}
                            <div>
                                <label
                                    htmlFor="rol"
                                    className="block text-sm font-semibold text-gray-700 mb-1"
                                >
                                    Rol
                                </label>
                                <select
                                    id="rol"
                                    name="rol"
                                    value={data.rol}
                                    onChange={(e) =>
                                        setData("rol", e.target.value)
                                    }
                                    className="w-full rounded-md bg-gray-100 border border-gray-200 focus:border-gray-400 focus:ring-0 px-4 py-2.5 text-sm"
                                    required
                                >
                                    <option value="operario">Operario</option>
                                    <option value="encargado">Encargado</option>
                                    <option value="jefe">Jefe</option>
                                    <option value="logistica">Logística</option>
                                </select>
                                {errors.rol && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.rol}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Este rol controla los permisos en la
                                    plataforma.
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700 mb-1"
                                >
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-md bg-gray-100 border border-gray-200 focus:border-gray-400 focus:ring-0 px-4 py-2.5 text-sm placeholder-gray-400"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirmación */}
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="block text-sm font-semibold text-gray-700 mb-1"
                                >
                                    Confirmar contraseña
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-md bg-gray-100 border border-gray-200 focus:border-gray-400 focus:ring-0 px-4 py-2.5 text-sm placeholder-gray-400"
                                    placeholder="••••••••"
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition px-4 py-3 text-white font-semibold"
                                >
                                    Registrarse
                                </button>

                                <div className="text-center text-sm">
                                    <span className="text-gray-600">
                                        ¿Ya tienes una cuenta?{" "}
                                    </span>
                                    <Link
                                        href={route("login")}
                                        className="text-blue-600 hover:text-blue-700 underline"
                                    >
                                        Inicia sesión
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
