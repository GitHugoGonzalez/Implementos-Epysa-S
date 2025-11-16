import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";

const COLORS = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#f59e0b",
    "#7c3aed",
    "#0891b2",
    "#ef4444",
    "#10b981",
];

export default function Dashboard() {
    const { charts = {}, auth } = usePage().props;
    const [activeTab, setActiveTab] = useState("graficos"); // "graficos" | "tablas"

    const rawRole =
        auth?.user?.rol_nombre ??
        auth?.user?.rol?.nombre_rol ??
        auth?.user?.rolRef?.nombre_rol ??
        auth?.user?.role?.name ??
        auth?.user?.role ??
        auth?.user?.rol ??
        "";

    const role = rawRole?.toString().trim().toLowerCase();
    const isJefe = role === "jefe";
    const isEncargado = role === "encargado";
    const isLogistica = role === "logistica";

    const goAprobaciones = (e) => {
        e.preventDefault();
        router.visit("/aprobaciones", {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const goHistorial = (e) => {
        e.preventDefault();
        router.visit(route("solicitudes.historial"), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const goLogistica = (e) => {
        e.preventDefault();
        router.visit(route("logistica.index"), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const daily = charts.daily ?? [];
    const byEstado = charts.byEstado ?? [];
    const urgency = charts.urgency ?? [];
    const topInsumos = charts.topInsumos ?? [];
    const bySucursal = charts.bySucursal ?? [];
    const topCreadores = charts.topCreadores ?? [];

    return (
        <AuthenticatedLayout hideNav>
            <Head title="Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* HEADER */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">
                                Resumen de Solicitudes
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Encargado */}
                            {isEncargado && (
                                <button
                                    onClick={goAprobaciones}
                                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:opacity-90 text-sm"
                                >
                                    Ver solicitudes de operarios
                                </button>
                            )}
                            {/* Logística */}
                            {isLogistica && (
                                <button
                                    onClick={goLogistica}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90 text-sm"
                                >
                                    Ir a Logística
                                </button>
                            )}
                            {/* Jefe */}
                            {isJefe && (
                                <>
                                    <button
                                        onClick={goAprobaciones}
                                        className="px-3 py-2 bg-[#009579] text-white rounded-lg hover:opacity-90 text-sm"
                                    >
                                        Ver solicitudes
                                    </button>

                                    <button
                                        onClick={goHistorial}
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                                    >
                                        Historial de Solicitudes
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex gap-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab("graficos")}
                                className={`px-4 py-2 text-sm border-b-2 ${
                                    activeTab === "graficos"
                                        ? "border-blue-600 text-blue-600 font-semibold"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Gráficos
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("tablas")}
                                className={`px-4 py-2 text-sm border-b-2 ${
                                    activeTab === "tablas"
                                        ? "border-blue-600 text-blue-600 font-semibold"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Tablas
                            </button>
                        </nav>
                    </div>

                    {/* CONTENIDO TABS */}
                    {activeTab === "graficos" && (
                        <div className="space-y-6">
                            {/* FILA 1: Serie diaria + Urgencia */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Solicitudes por día */}
                                <div className="bg-white shadow sm:rounded-xl p-4">
                                    <h2 className="text-lg font-medium mb-2">
                                        Solicitudes por día (últimos 30 días)
                                    </h2>
                                    <div className="h-64">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <LineChart data={daily}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="fecha"
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Line
                                                    type="monotone"
                                                    dataKey="total"
                                                    stroke="#2563eb"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Urgentes vs No urgentes */}
                                <div className="bg-white shadow sm:rounded-xl p-4">
                                    <h2 className="text-lg font-medium mb-2">
                                        Urgentes vs No urgentes
                                    </h2>
                                    <div className="h-64">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart data={urgency}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="tipo" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="total"
                                                    fill="#dc2626"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* FILA 2: Estado + Sucursal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Distribución por estado */}
                                <div className="bg-white shadow sm:rounded-xl p-4">
                                    <h2 className="text-lg font-medium mb-2">
                                        Distribución por estado
                                    </h2>
                                    <div className="h-64">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={byEstado}
                                                    dataKey="total"
                                                    nameKey="estado"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={2}
                                                    label
                                                >
                                                    {byEstado.map((_, i) => (
                                                        <Cell
                                                            key={`cell-${i}`}
                                                            fill={
                                                                COLORS[
                                                                    i %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Solicitudes por sucursal */}
                                <div className="bg-white shadow sm:rounded-xl p-4">
                                    <h2 className="text-lg font-medium mb-2">
                                        Solicitudes por sucursal (30 días)
                                    </h2>
                                    <div className="h-64">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart data={bySucursal}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="sucursal_nombre"
                                                    tick={{ fontSize: 12 }}
                                                    interval={0}
                                                    angle={-15}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="total"
                                                    fill="#7c3aed"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "tablas" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* TABLA: Top creación de solicitudes */}
                            <div className="bg-white shadow sm:rounded-xl p-4">
                                <h2 className="text-lg font-medium mb-2">
                                    Top de creación de solicitudes
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 pr-4">
                                                    Usuario
                                                </th>
                                                <th className="text-left py-2 pr-4">
                                                    Rol
                                                </th>
                                                <th className="text-left py-2 pr-4">
                                                    Sucursal
                                                </th>
                                                <th className="text-right py-2">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topCreadores.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="py-4 text-center text-gray-500"
                                                    >
                                                        Sin datos de
                                                        creadores.
                                                    </td>
                                                </tr>
                                            )}
                                            {topCreadores.map((row, i) => {
                                                const isTop1 = i === 0;
                                                return (
                                                    <tr
                                                        key={i}
                                                        className={`border-b last:border-0 ${
                                                            isTop1
                                                                ? "bg-emerald-50"
                                                                : ""
                                                        }`}
                                                    >
                                                        <td
                                                            className={`py-2 pr-4 ${
                                                                isTop1
                                                                    ? "font-semibold text-emerald-800"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {row.usuario_nombre ??
                                                                row.nombre ??
                                                                "-"}
                                                        </td>
                                                        <td
                                                            className={`py-2 pr-4 ${
                                                                isTop1
                                                                    ? "text-emerald-700"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {row.rol ?? "-"}
                                                        </td>
                                                        <td
                                                            className={`py-2 pr-4 ${
                                                                isTop1
                                                                    ? "text-emerald-700"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {row.sucursal_nombre ??
                                                                "-"}
                                                        </td>
                                                        <td
                                                            className={`py-2 text-right ${
                                                                isTop1
                                                                    ? "font-bold text-emerald-800"
                                                                    : "font-semibold"
                                                            }`}
                                                        >
                                                            {row.total ?? 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* TABLA: Top insumos */}
                            <div className="bg-white shadow sm:rounded-xl p-4">
                                <h2 className="text-lg font-medium mb-2">
                                    Top 5 insumos por cantidad solicitada
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 pr-4">Insumo</th>
                                                <th className="text-right py-2 pr-4">Cantidad total</th>
                                                <th className="text-right py-2">N° solicitudes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topInsumos.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="py-4 text-center text-gray-500"
                                                    >
                                                        Sin datos de insumos.
                                                    </td>
                                                </tr>
                                            )}

                                            {topInsumos.map((row, i) => {
                                                const isTop1 = i === 0;

                                                return (
                                                    <tr
                                                        key={i}
                                                        className={`border-b last:border-0 ${
                                                            isTop1 ? "bg-emerald-50" : ""
                                                        }`}
                                                    >
                                                        <td
                                                            className={`py-2 pr-4 ${
                                                                isTop1
                                                                    ? "font-semibold text-emerald-800"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {row.insumo_nombre ?? "-"}
                                                        </td>

                                                        <td
                                                            className={`py-2 pr-4 text-right ${
                                                                isTop1
                                                                    ? "font-bold text-emerald-800"
                                                                    : "font-semibold"
                                                            }`}
                                                        >
                                                            {row.total_cant ?? 0}
                                                        </td>

                                                        <td
                                                            className={`py-2 text-right ${
                                                                isTop1 ? "text-emerald-700" : ""
                                                            }`}
                                                        >
                                                            {row.solicitudes ?? 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
