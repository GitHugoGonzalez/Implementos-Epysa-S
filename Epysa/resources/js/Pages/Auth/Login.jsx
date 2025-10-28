import { Head, Link, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), { onFinish: () => reset("password") });
    };

    return (
        <GuestLayout bare>
            <Head title="Inicio de sesión" />

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
                            ¡Bienvenid@
                            <br />
                            de vuelta!
                        </h1>

                        {status && (
                            <div className="mt-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 mb-1"
                                >
                                    Correo
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
                                    className="w-full rounded-md bg-gray-100 border border-gray-200 focus:border-gray-400 focus:ring-0 px-4 py-2.5 text-sm placeholder-gray-400"
                                    placeholder="tu@correo.co"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

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
                                    autoComplete="current-password"
                                    className="w-full rounded-md bg-gray-100 border border-gray-200 focus:border-gray-400 focus:ring-0 px-4 py-2.5 text-sm placeholder-gray-400"
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {canResetPassword && (
                                <div className="text-right">
                                    <Link
                                        href={route("password.request")}
                                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition px-4 py-3 text-white font-semibold"
                            >
                                Iniciar Sesión
                            </button>
                            <Link
                                href={route("register")}
                                className="w-full inline-flex items-center justify-center rounded-md  bg-blue-600 hover:bg-blue-700 transition px-4 py-3 text-white font-semibold mt-2 text-center"
                            >
                                Registrarse
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
