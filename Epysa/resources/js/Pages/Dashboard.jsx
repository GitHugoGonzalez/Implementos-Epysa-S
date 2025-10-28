import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
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
    const { charts, auth } = usePage().props;

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

    return (
        <AuthenticatedLayout hideNav>
            <Head title="Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">
                                Resumen de Solicitudes
                            </h1>
                        </div>

                        {/* Encargado */}
                        {isEncargado && (
                            <button
                                onClick={goAprobaciones}
                                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:opacity-90"
                            >
                                Ver solicitudes de operarios
                            </button>
                        )}
                        {/* Logística */}
                        {isLogistica && (
                            <button
                                onClick={goLogistica}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90"
                            >
                                Ir a Logística
                            </button>
                        )}
                        {/* Jefe */}
                        {isJefe && (
                            <div className="flex gap-2">
                                <button
                                    onClick={goAprobaciones}
                                    className="px-3 py-2 bg-[#009579] text-white rounded-lg hover:opacity-90"
                                >
                                    Ver solicitudes
                                </button>

                                <button
                                    onClick={goHistorial}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    Historial de Solicitudes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 1) Serie diaria (últimos 30 días) */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white shadow sm:rounded-xl p-4">
                            <h2 className="text-lg font-medium mb-2">
                                Solicitudes por día (últimos 30 días)
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={charts?.daily ?? []}>
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
                    </div>

                    {/* 2) Estado (pie) + Urgentes vs No (barras) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow sm:rounded-xl p-4">
                            <h2 className="text-lg font-medium mb-2">
                                Distribución por estado
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts?.byEstado ?? []}
                                            dataKey="total"
                                            nameKey="estado"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            label
                                        >
                                            {(charts?.byEstado ?? []).map(
                                                (_, i) => (
                                                    <Cell
                                                        key={`cell-${i}`}
                                                        fill={
                                                            COLORS[
                                                                i %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white shadow sm:rounded-xl p-4">
                            <h2 className="text-lg font-medium mb-2">
                                Urgentes vs No urgentes
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts?.urgency ?? []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tipo" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#dc2626" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 3) Top insumos y Por sucursal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow sm:rounded-xl p-4">
                            <h2 className="text-lg font-medium mb-2">
                                Top 5 insumos por cantidad solicitada
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts?.topInsumos ?? []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="insumo_nombre"
                                            tick={{ fontSize: 12 }}
                                            interval={0}
                                            angle={-15}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="total_cant"
                                            name="Cantidad total"
                                            fill="#16a34a"
                                        />
                                        <Bar
                                            dataKey="solicitudes"
                                            name="N° solicitudes"
                                            fill="#2563eb"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white shadow sm:rounded-xl p-4">
                            <h2 className="text-lg font-medium mb-2">
                                Solicitudes por sucursal (30 días)
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts?.bySucursal ?? []}>
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
                                        <Bar dataKey="total" fill="#7c3aed" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
