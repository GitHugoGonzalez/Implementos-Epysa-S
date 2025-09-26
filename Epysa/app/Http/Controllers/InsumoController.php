<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsumoController extends Controller
{
    // Formulario
    public function create()
    {
        return Inertia::render('Insumos/Create');
    }

    // Guardar
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre_insumo'      => ['required', 'string', 'max:100'],
            'stock'              => ['required', 'integer', 'min:0'],
            'descripcion_insumo' => ['nullable', 'string'],
            'precio_insumo'      => ['required', 'numeric', 'min:0'],
            'imagen'             => ['nullable', 'file', 'image', 'mimes:jpeg,png,webp,jpg', 'max:4096'],
        ]);

        $insumo = new Insumo(); // el modelo debe tener protected $connection = 'newdb'
        $insumo->nombre_insumo      = $data['nombre_insumo'];
        $insumo->stock              = $data['stock'];
        $insumo->descripcion_insumo = $data['descripcion_insumo'] ?? null;
        $insumo->precio_insumo      = $data['precio_insumo'];

        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $insumo->imagen      = file_get_contents($file->getRealPath());
            $insumo->imagen_mime = $file->getMimeType() ?: 'application/octet-stream';
        }

        $insumo->save();

        return redirect()->route('insumos.create')
            ->with('success', 'Insumo creado correctamente.');
    }

    // Servir la imagen desde BLOB (sin Route Model Binding, y seleccionando solo columnas necesarias)
    public function imagen($id)
    {
        // Fuerza conexión y trae SOLO columnas de imagen para no arrastrar demás datos
        $insumo = Insumo::on('newdb')
            ->select('imagen', 'imagen_mime')
            ->where('id_insumo', $id)
            ->firstOrFail();

        if (!$insumo->imagen) {
            abort(404);
        }

        return response($insumo->imagen)
            ->header('Content-Type', $insumo->imagen_mime ?? 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=604800');
    }

    // Listado (NO TOCAR el BLOB: ni seleccionarlo ni leer el atributo)
    public function index()
    {
        $insumos = Insumo::on('newdb')
            ->select('id_insumo', 'nombre_insumo', 'stock', 'precio_insumo', 'descripcion_insumo')
            ->orderBy('id_insumo', 'desc')
            ->get()
            ->map(function ($i) {
                return [
                    'id_insumo'          => $i->id_insumo,
                    'nombre_insumo'      => $i->nombre_insumo,
                    'stock'              => $i->stock,
                    'precio_insumo'      => $i->precio_insumo,
                    'descripcion_insumo' => $i->descripcion_insumo,
                    // Damos SIEMPRE la URL y dejamos que la ruta responda 404 si no hay imagen.
                    'imagen_url'         => route('insumos.imagen', $i->id_insumo),
                ];
            });

        return Inertia::render('Insumos/Index', [
            'insumos' => $insumos,
        ]);
    }
}
