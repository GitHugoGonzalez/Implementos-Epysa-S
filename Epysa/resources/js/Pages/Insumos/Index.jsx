import React, { useMemo } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";

/** Helper seguro para URLs con Ziggy o fallback plano (no modifica rutas) */
const safeUrl = (name, fallback, params) => {
    const buildFallback =
        typeof fallback === "function" ? fallback : () => fallback ?? "/";
    if (typeof route === "function") {
        try {
            return route(name, params);
        } catch {
            return buildFallback(params);
        }
    }
    return buildFallback(params);
};

export default function Index() {
    const {
        insumos: insumosProp,
        categorias = [],
        selectedCategorias = [],
        q = "",
        sort = "default",
    } = usePage().props;

    // Acepta array o { data: [...] }
    const insumos = Array.isArray(insumosProp?.data)
        ? insumosProp.data
        : Array.isArray(insumosProp)
        ? insumosProp
        : [];

    const formatCLP = (num) =>
        new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
        }).format(Number(num ?? 0));

    const selectedSet = useMemo(
        () => new Set([].concat(selectedCategorias || [])),
        [selectedCategorias]
    );

    const applyFilters = ({ categoriasArr, qText, sortKey } = {}) => {
        const params = {};
        const cats = categoriasArr ?? Array.from(selectedSet);
        const query = qText ?? q;
        const s = sortKey ?? sort;

        if (cats.length) params.categoria = cats; // envia categoria[]=A&categoria[]=B
        if (query) params.q = query;
        if (s && s !== "default") params.sort = s;

        router.get(safeUrl("insumos.index", "/insumos/index"), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const toggleCategoria = (cat) => {
        const next = new Set(selectedSet);
        next.has(cat) ? next.delete(cat) : next.add(cat);
        applyFilters({ categoriasArr: Array.from(next) });
    };

    const clearCategorias = () => applyFilters({ categoriasArr: [] });

    const onSearchSubmit = (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        applyFilters({ qText: form.get("q") ?? "" });
    };

    const toggleLatest = () => {
        const next = sort === "latest" ? "default" : "latest";
        applyFilters({ sortKey: next });
    };

    const stockBadge = (stock) => {
        const s = Number(stock ?? 0);
        if (s <= 0) return "bg-red-100 text-red-700";
        if (s < 10) return "bg-orange-100 text-orange-700";
        return "bg-green-100 text-green-700";
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Lista de Insumos" />
            <SimpleNav />

            <div className="mx-auto mt-7 max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <div className="sticky top-4 rounded-2xl bg-white p-4 shadow">
                            {/* Buscar */}
                            <form onSubmit={onSearchSubmit} className="mb-4">
                                <label className="mb-1 block text-sm font-medium">
                                    Buscar
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        name="q"
                                        defaultValue={q}
                                        placeholder="Nombre del insumo…"
                                        className="w-full rounded-lg border p-2"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:opacity-90"
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </form>

                            {/* Categorías */}
                            <h3 className="mb-3 text-lg font-semibold">
                                Categoría
                            </h3>
                            <div className="mb-2 flex flex-wrap gap-2">
                                <button
                                    onClick={clearCategorias}
                                    className={[
                                        "rounded-full border px-3 py-1 text-sm transition",
                                        selectedSet.size === 0
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
                                    ].join(" ")}
                                >
                                    Todas
                                </button>

                                {categorias.map((c, idx) => {
                                    const active = selectedSet.has(c);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => toggleCategoria(c)}
                                            className={[
                                                "rounded-full border px-3 py-1 text-sm transition",
                                                active
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
                                            ].join(" ")}
                                            title={c}
                                        >
                                            {c}
                                        </button>
                                    );
                                })}
                            </div>

                            
                        </div>
                    </aside>

                    {/* Main */}
                    <main className="lg:col-span-9">
                        <div className="rounded-2xl bg-white p-6 shadow">
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <h1 className="text-2xl font-semibold">
                                    Lista de Insumos
                                </h1>
                                <Link
                                    href={safeUrl(
                                        "insumos.create",
                                        "/insumos/crear"
                                    )}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-90"
                                >
                                    Agregar Insumo
                                </Link>
                            </div>

                            {/* GRID DE CARDS */}
                            {!insumos || insumos.length === 0 ? (
                                <div className="py-16 text-center text-gray-500">
                                    No hay insumos aún
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {insumos.map((insumo) => {
                                        const id =
                                            insumo.id_insumo ?? insumo.id ?? "";
                                        const nombre =
                                            insumo.nombre_insumo ??
                                            insumo.nombre ??
                                            "Sin nombre";
                                        const precio =
                                            insumo.precio_insumo ??
                                            insumo.precio ??
                                            0;
                                        const stock = insumo.stock ?? 0;
                                        const categoria =
                                            insumo.categoria ?? "";

                                        return (
                                            <article
                                                key={id}
                                                className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                                            >
                                                {/* Imagen */}
                                                <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-gray-100">
                                                    <img
                                                        src={safeUrl(
                                                            "insumos.imagen",
                                                            (pid) =>
                                                                `/insumos/${pid}/imagen`,
                                                            id
                                                        )}
                                                        alt={nombre}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "data:image/svg+xml;utf8," +
                                                                encodeURIComponent(
                                                                    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='160'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-size='16'>Sin imagen</text></svg>`
                                                                );
                                                        }}
                                                    />
                                                    {categoria && (
                                                        <span className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
                                                            {categoria}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Contenido */}
                                                <div className="space-y-3 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                                                            {nombre}
                                                        </h3>
                                                        <span className="whitespace-nowrap text-sm font-bold text-gray-900">
                                                            {formatCLP(precio)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={[
                                                                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                                stockBadge(
                                                                    stock
                                                                ),
                                                            ].join(" ")}
                                                        >
                                                            Stock: {stock}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            ID #{id}
                                                        </span>
                                                    </div>

                                                    
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
