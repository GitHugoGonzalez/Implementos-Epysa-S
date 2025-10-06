import React, { useMemo } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import SimpleNav from "@/Components/SimpleNav";

export default function Index() {
  const {
    insumos,
    categorias = [],
    // props que llegan del backend
    selectedCategorias = [], // array de strings
    q = "",
    sort = "default",
  } = usePage().props;

  const formatCLP = (num) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(num);

  // normalizamos a array por si viene string
  const selectedSet = useMemo(() => new Set([].concat(selectedCategorias || [])), [selectedCategorias]);

  const applyFilters = ({ categoriasArr, qText, sortKey } = {}) => {
    const params = {};
    const cats = categoriasArr ?? Array.from(selectedSet);
    const query = qText ?? q;
    const s = sortKey ?? sort;

    if (cats.length) params.categoria = cats; // envia categoria[]=A&categoria[]=B
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
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Head title="Lista de Insumos" />
      <SimpleNav />

      <div className="mx-auto mt-7 max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sidebar izquierdo */}
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

              {/* Categorías */}
              <h3 className="mb-3 text-lg font-semibold">Categoría</h3>

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

              {/* Switch “lo.último” */}
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="lg:col-span-9">
            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Lista de Insumos</h1>
                <Link
                  href={route("insumos.create")}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-90"
                >
                  Agregar Insumo
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="rounded-lg bg-blue-600 text-white">
                    <tr>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Imagen</th>
                      <th className="border p-2">Nombre</th>
                      <th className="border p-2">Stock</th>
                      <th className="border p-2">Precio</th>
                      <th className="border p-2">Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumos.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">
                          No hay insumos aún
                        </td>
                      </tr>
                    )}

                    {insumos.map((insumo) => (
                      <tr key={insumo.id_insumo} className="font-medium hover:bg-gray-50">
                        <td className="border p-2 text-center">{insumo.id_insumo}</td>
                        <td className="border p-2 text-center">
                          <img
                            src={route("insumos.imagen", insumo.id_insumo)}
                            alt={insumo.nombre_insumo}
                            className="mx-auto h-14 rounded object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </td>
                        <td className="border p-2">{insumo.nombre_insumo}</td>
                        <td className="border p-2 text-center">{insumo.stock}</td>
                        <td className="border p-2 text-right">{formatCLP(insumo.precio_insumo)}</td>
                        <td className="border p-2 text-center">{insumo.categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
