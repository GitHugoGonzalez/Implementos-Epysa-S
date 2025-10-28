import React, { useMemo } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";

export default function Index() {
  const {
    insumos: insumosProp,
    categorias = [],
    selectedCategorias = [],
    q = "",
    sort = "default",
    auth,
  } = usePage().props;

  const role = (auth?.user?.rol_nombre ?? "").toString().trim().toLowerCase();
  const canManage = role === "jefe" || role === "encargado";

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

    if (cats.length) params.categoria = cats;
    if (query) params.q = query;
    if (s && s !== "default") params.sort = s;

    router.get(route("insumos.index"), params, {
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

  // 🔒 Confirmación por NOMBRE EXACTO y envío de confirm_name al backend
  const onDelete = (id, nombre) => {
    if (!id) return;

    const typed = prompt(
      `Para confirmar la eliminación, escribe EXACTAMENTE el nombre del insumo:\n\n${nombre}`
    );

    if (typed == null) return; // Cancelado

    // Enviamos confirm_name al backend (el back hace validación robusta)
    router.delete(route("insumos.destroy", id), {
      data: { confirm_name: typed },
      preserveScroll: true,
    });
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
                <label className="mb-1 block text-sm font-medium">Buscar</label>
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

              {/* Orden */}
              <button
                onClick={toggleLatest}
                className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                title="Alternar orden por más recientes"
              >
                Orden: {sort === "latest" ? "Más recientes" : "Por ID descendente"}
              </button>

              {/* Categorías (placeholder) */}
              <h3 className="mt-4 mb-2 text-sm font-semibold text-gray-600">Categoría</h3>
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
                <h1 className="text-2xl font-semibold">Lista de Insumos</h1>

                {canManage && (
                  <Link
                    href={route("insumos.create")}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-90"
                  >
                    Agregar Insumo
                  </Link>
                )}
              </div>

              {/* GRID DE CARDS */}
              {!insumos || insumos.length === 0 ? (
                <div className="py-16 text-center text-gray-500">No hay insumos aún</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {insumos.map((insumo) => {
                    const id = insumo.id_insumo ?? insumo.id ?? "";
                    const nombre = insumo.nombre_insumo ?? insumo.nombre ?? "Sin nombre";
                    const precio = insumo.precio_insumo ?? insumo.precio ?? 0;
                    const stock = insumo.stock ?? 0;
                    const imgUrl = insumo.imagen_url || route("insumos.imagen", id);

                    return (
                      <article
                        key={id}
                        className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                      >
                        {/* Imagen */}
                        <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-gray-100">
                          <img
                            src={imgUrl}
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
                                stockBadge(stock),
                              ].join(" ")}
                            >
                              Stock: {stock}
                            </span>
                            <span className="text-xs text-gray-500">ID #{id}</span>
                          </div>

                          {/* Acciones */}
                          {canManage && (
                            <div className="flex items-center justify-end gap-2 pt-2">
                              <Link
                                href={route("insumos.edit", id)}
                                className="px-3 py-1.5 rounded bg-amber-500 text-white hover:opacity-90"
                              >
                                Editar
                              </Link>
                              <button
                                onClick={() => onDelete(id, nombre)}
                                className="px-3 py-1.5 rounded bg-red-600 text-white hover:opacity-90"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
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
