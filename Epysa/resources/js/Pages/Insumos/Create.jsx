import React, { useRef, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create() {
  const { data, setData, post, processing, errors, reset, transform } = useForm({
    nombre_insumo: '',
    stock: '',
    descripcion_insumo: '',
    precio_insumo: '',
    imagen: null,
  });

  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  // Enviar como FormData (necesario para archivo)
  transform((payload) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, v);
    });
    return fd;
  });

  const handleFile = (e) => {
    const file = e.target.files?.[0] ?? null;
    setData('imagen', file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = (e) => {
    e.preventDefault();
    post(route('insumos.store'), {
      onSuccess: () => {
        reset();
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
      },
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <Head title="Agregar Insumo" />
      <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Agregar Insumo</h1>
          <Link href={route('dashboard')} className="text-sm underline">Volver</Link>
        </div>

        <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={data.nombre_insumo}
              onChange={(e) => setData('nombre_insumo', e.target.value)}
              placeholder="Ej: Detergente industrial"
            />
            {errors.nombre_insumo && <p className="text-red-600 text-sm mt-1">{errors.nombre_insumo}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-lg p-2"
                value={data.stock}
                onChange={(e) => setData('stock', e.target.value)}
                placeholder="0"
              />
              {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg p-2"
                value={data.precio_insumo}
                onChange={(e) => setData('precio_insumo', e.target.value)}
                placeholder="0.00"
              />
              {errors.precio_insumo && <p className="text-red-600 text-sm mt-1">{errors.precio_insumo}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full border rounded-lg p-2"
              rows={4}
              value={data.descripcion_insumo}
              onChange={(e) => setData('descripcion_insumo', e.target.value)}
              placeholder="Detalle del insumo…"
            />
            {errors.descripcion_insumo && <p className="text-red-600 text-sm mt-1">{errors.descripcion_insumo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleFile}
              className="w-full border rounded-lg p-2"
            />
            {errors.imagen && <p className="text-red-600 text-sm mt-1">{errors.imagen}</p>}

            {preview && (
              <div className="mt-3">
                <span className="block text-sm text-gray-600 mb-1">Vista previa</span>
                <img src={preview} alt="preview" className="max-h-48 rounded-lg border" />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
            >
              {processing ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
