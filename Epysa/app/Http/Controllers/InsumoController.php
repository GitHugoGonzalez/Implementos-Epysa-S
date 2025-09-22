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

        $insumo = new Insumo();
        $insumo->nombre_insumo      = $data['nombre_insumo'];
        $insumo->stock              = $data['stock'];
        $insumo->descripcion_insumo = $data['descripcion_insumo'] ?? null;
        $insumo->precio_insumo      = $data['precio_insumo'];

        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $insumo->imagen = file_get_contents($file->getRealPath());
            $insumo->imagen_mime = $file->getMimeType() ?: 'application/octet-stream';
        }

        $insumo->save(); // usa connection del modelo (newdb)

        return redirect()->route('insumos.create')
            ->with('success', 'Insumo creado correctamente.');
    }

    // Servir la imagen desde BLOB
    public function imagen(Insumo $insumo)
    {
        if (!$insumo->imagen) {
            abort(404);
        }

        return response($insumo->imagen)
            ->header('Content-Type', $insumo->imagen_mime ?? 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=604800');
    }

    public function index()
    {
        $insumos = Insumo::select(
            'id_insumo',
            'nombre_insumo',
            'stock',
            'precio_insumo',
            'descripcion_insumo'
        )
        ->orderBy('id_insumo', 'desc')
        ->get()
        ->map(function ($insumo) {
            return [
            'id_insumo'         => $insumo->id_insumo,
            'nombre_insumo'     => $insumo->nombre_insumo,
            'stock'             => $insumo->stock,
            'precio_insumo'     => $insumo->precio_insumo,
            'descripcion_insumo'=> $insumo->descripcion_insumo,
            'imagen_url'        => $insumo->imagen ? route('insumos.imagen', $insumo->id_insumo) : null,
        ];
    });

    return Inertia::render('Insumos/Index', [
        'insumos' => $insumos,
    ]);
}
}
