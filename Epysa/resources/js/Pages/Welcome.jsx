// resources/js/Pages/Welcome.jsx
import React from "react";
import { Head } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Head title="Bienvenido | Implementos Epysa S.A." />

            {/* Navbar unificada */}
            <SimpleNav />

            {/* HERO */}
            <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-blue-900">
                <div
                    className="absolute inset-0 opacity-20"
                    aria-hidden="true"
                    style={{
                        backgroundImage: "url('/imagenes/hero_trucks.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="max-w-3xl text-white">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Implementos Epysa S.A.
                        </h1>
                        <p className="mt-4 text-lg opacity-95">
                            Más de 27 años impulsando el transporte con
                            repuestos, insumos y accesorios para camiones,
                            buses, remolques y maquinaria. Cobertura omnicanal
                            en Chile, Perú y España.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href="https://www.implementos.cl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl bg-white px-5 py-3 font-semibold text-blue-600 ring-1 ring-white/60 hover:bg-blue-300/10 hover:text-white transition"
                            >
                                implementos.cl
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* ¿QUIÉNES SOMOS? */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-start gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="text-2xl font-bold">
                                ¿Quiénes somos?
                            </h2>
                            <p className="mt-4 leading-relaxed text-gray-700">
                                Somos una empresa con más de 27 años en el rubro
                                del Transporte, comercializando partes, piezas y
                                accesorios para camiones, buses y remolques.
                                Nacimos en Chile desde el Grupo Epysa y contamos
                                con la representación de marcas líderes como
                                <span className="font-semibold">
                                    {" "}
                                    Randon
                                </span> y{" "}
                                <span className="font-semibold">Marcopolo</span>
                                . Ofrecemos un servicio centrado en el cliente
                                mediante tres canales:{" "}
                                <span className="font-medium">Tienda</span>,
                                <span className="font-medium"> Terreno</span> y{" "}
                                <span className="font-medium">Digital</span>,
                                con envíos a domicilio y retiro en tienda.
                            </p>
                            <p className="mt-4 leading-relaxed text-gray-700">
                                Nuestra red de tiendas se extiende desde Arica a
                                Punta Arenas en Chile, además de 13 tiendas
                                operando en Perú y nuevas aperturas en España.
                                Nos mueve la excelencia de servicio, la
                                disponibilidad y la mejor relación
                                precio–calidad.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACTO RÁPIDO */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">
                            <h3 className="text-lg font-semibold">
                                Ventas telefónicas
                            </h3>
                            <p className="mt-1 text-2xl font-extrabold">
                                800 330 088
                            </p>
                            <p className="mt-2 text-sm text-white/80">
                                Lunes a sábado
                            </p>
                        </div>
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold">WhatsApp</h3>
                            <p className="mt-1 text-2xl font-extrabold text-blue-700">
                                +56 9 3263 3571
                            </p>
                            <p className="mt-2 text-sm text-gray-600">
                                Escríbenos para cotizaciones y seguimiento.
                            </p>
                        </div>
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold">Sitio web</h3>
                            <a
                                href="https://www.implementos.cl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block font-semibold text-blue-700 underline"
                            >
                                www.implementos.cl
                            </a>
                            <p className="mt-2 text-sm text-gray-600">
                                Compra online y retiro en tienda.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t bg-white py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <p className="text-sm text-gray-600">
                        © {new Date().getFullYear()} Implementos Epysa S.A.
                        Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                        <a
                            href="https://www.implementos.cl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-700"
                        >
                            implementos.cl
                        </a>
                        <span className="hidden text-gray-300 sm:inline">
                            •
                        </span>
                        <a href="tel:800330088" className="hover:text-blue-700">
                            800 330 088
                        </a>
                        <span className="hidden text-gray-300 sm:inline">
                            •
                        </span>
                        <a
                            href="https://wa.me/56932633571"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-700"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
