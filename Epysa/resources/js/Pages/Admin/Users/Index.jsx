import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index() {
  const { users, q, sucursales, canDelete } = usePage().props;
  const [query, setQuery] = useState(q || "");
  const [deletingId, setDeletingId] = useState(null); // para deshabilitar botón durante el delete

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("admin.users.index"), { q: query }, { preserveState: true, replace: true });
  };

  const confirmDelete = (id, name) => {
    if (!canDelete || !id) return;

    const msg =
      `¿Eliminar al usuario "${name}"?\n\n` +
      `• Esta acción no se puede deshacer.\n` +
      `• Si el usuario tiene solicitudes, igualmente se eliminará y verás un aviso.`;

    if (!window.confirm(msg)) return;

    setDeletingId(id);
    router.delete(route("admin.users.destroy", id), {
      preserveScroll: true,
      onFinish: () => setDeletingId(null),
    });
  };

  const fmtSucursal = (fk) => {
    if (!fk || !sucursales || !sucursales[fk]) return "—";
    const s = sucursales[fk];
    return `${s.ciudad} — ${s.direccion}`;
  };

  return (
    <AuthenticatedLayout hideNav>
      <Head title="Gestión de Usuarios" />
      <div className="py-8 px-4 md:px-8">
        <div className="mx-auto max-w-6xl bg-white shadow rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  className="border rounded-lg p-2 w-64"
                  placeholder="Buscar por nombre, email o rol…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90">
                  Buscar
                </button>
              </form>
              <Link
                href={route("admin.users.create")}
                className="px-3 py-2 rounded-lg bg-green-600 text-white hover:opacity-90"
              >
                Crear usuario
              </Link>
            </div>
          </div>

          {/* Flash messages */}
          <FlashMessages />

          <div className="overflow-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Nombre</Th>
                  <Th>Email</Th>
                  <Th>Rol</Th>
                  <Th>Sucursal</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {users.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No hay usuarios que coincidan con tu búsqueda.
                    </td>
                  </tr>
                )}

                {users.data.map((u) => (
                  <tr key={u.id} className="border-t">
                    <Td>{u.name}</Td>
                    <Td>{u.email}</Td>
                    <Td className="capitalize">{u.rol || "—"}</Td>
                    <Td>{fmtSucursal(u.fk_idSucursal)}</Td>
                    <Td align="right">
                      {canDelete && (
                        <button
                          onClick={() => confirmDelete(u.id, u.name)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
                          disabled={deletingId === u.id}
                          title="Eliminar usuario"
                        >
                          {deletingId === u.id ? "Eliminando…" : "Eliminar"}
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination links={users.links} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function Th({ children, className = "" }) {
  return <th className={`text-left font-medium px-4 py-3 ${className}`}>{children}</th>;
}
function Td({ children, align = "left" }) {
  return <td className={`px-4 py-3 text-gray-800 ${align === "right" ? "text-right" : ""}`}>{children}</td>;
}

function Pagination({ links = [] }) {
  if (!links || links.length <= 3) return null;
  return (
    <div className="flex gap-2 items-center justify-end mt-4">
      {links.map((l, i) => (
        <Link
          key={i}
          href={l.url || ""}
          preserveScroll
          className={`px-3 py-1.5 rounded border ${
            l.active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-50"
          } ${!l.url ? "opacity-50 pointer-events-none" : ""}`}
          dangerouslySetInnerHTML={{ __html: l.label }}
        />
      ))}
    </div>
  );
}

/** Ahora soporta flash.warning (amarillo) además de success/error */
function FlashMessages() {
  const { flash } = usePage().props;
  if (!flash) return null;
  return (
    <div className="space-y-2 mb-4">
      {flash.success && (
        <div className="px-4 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200">
          {flash.success}
        </div>
      )}
      {flash.warning && (
        <div className="px-4 py-2 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
          ⚠️ {flash.warning}
        </div>
      )}
      {flash.error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {flash.error}
        </div>
      )}
    </div>
  );
}
