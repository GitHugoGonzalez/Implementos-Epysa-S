import React from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CreateUser() {
  const { sucursales = [], rolesPermitidos = [] } = usePage().props;

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    rol: rolesPermitidos[0] ?? "operario",
    fk_idSucursal: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post("/admin/usuarios", {
      onSuccess: () => reset({ name: "", email: "", password: "", rol: rolesPermitidos[0] ?? "operario", fk_idSucursal: "" }),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Crear usuario (Jefe)" />
      <div className="py-8 px-4 md:px-8">
        <div className="mx-auto max-w-2xl bg-white shadow rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Crear usuario</h1>
            <Link href="/dashboard" className="text-sm underline">Volver</Link>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input className="w-full border rounded-lg p-2" value={data.name} onChange={e => setData("name", e.target.value)} />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full border rounded-lg p-2" value={data.email} onChange={e => setData("email", e.target.value)} />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input type="password" className="w-full border rounded-lg p-2" value={data.password} onChange={e => setData("password", e.target.value)} />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select className="w-full border rounded-lg p-2" value={data.rol} onChange={e => setData("rol", e.target.value)}>
                {rolesPermitidos.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sucursal</label>
              <select className="w-full border rounded-lg p-2" value={data.fk_idSucursal} onChange={e => setData("fk_idSucursal", e.target.value)}>
                <option value="">Selecciona una sucursal…</option>
                {sucursales.map(s => (
                  <option key={s.id_sucursal} value={s.id_sucursal}>
                    {s.ciudad} — {s.direccion}
                  </option>
                ))}
              </select>
              {errors.fk_idSucursal && <p className="text-red-600 text-sm mt-1">{errors.fk_idSucursal}</p>}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50">
                {processing ? "Creando…" : "Crear usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
