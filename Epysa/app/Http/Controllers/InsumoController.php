<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InsumoController extends Controller
{
    // Formulario
    public function create()
    {
        return Inertia::render('Insumos/Create');
    }

    // Guardar (imagen va a Insumo_Imagen)
    public function store(Request $request)
    {
        $rules = [
            'nombre_insumo'      => ['required', 'string', 'max:150'],
            'stock'              => ['required', 'integer', 'min:0'],
            'descripcion_insumo' => ['nullable', 'string'],
            'precio_insumo'      => ['required', 'numeric', 'min:0'],
            // ya no existe 'categoria' en la tabla
            'imagen'             => ['nullable', 'file', 'image', 'mimes:jpeg,png,webp,jpg', 'max:4096'],
        ];

        $messages = [
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'Formatos permitidos: JPG, PNG o WEBP.',
            'imagen.max'   => 'La imagen no puede superar los 4MB.',
        ];

        $data = $request->validate($rules, $messages);

        // Crear insumo (tabla: Insumos)
        $insumo = new Insumo(); // Modelo con $connection='newdb' y $table='Insumos'
        $insumo->nombre_insumo      = $data['nombre_insumo'];
        $insumo->stock              = $data['stock'];
        $insumo->descripcion_insumo = $data['descripcion_insumo'] ?? null;
        $insumo->precio_insumo      = $data['precio_insumo'];
        $insumo->save();

        // Imagen opcional → guardar en Insumo_Imagen
        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');

            try {
                $info = @getimagesize($file->getRealPath());
                if ($info === false) {
                    return back()
                        ->withErrors(['imagen' => 'El archivo no es una imagen válida.'])
                        ->withInput();
                }
            } catch (\Throwable $e) {
                return back()
                    ->withErrors(['imagen' => 'No se pudo validar la imagen. Intenta con otro archivo.'])
                    ->withInput();
            }

            try {
                DB::connection('newdb')->table('Insumo_Imagen')->insert([
                    'id_insumo' => $insumo->id_insumo,
                    'imagen'    => file_get_contents($file->getRealPath()),
                    'mime'      => $file->getMimeType() ?: 'application/octet-stream',
                ]);
            } catch (\Throwable $e) {
                // si falla la imagen, el insumo ya quedó creado; solo avisamos
                return redirect()
                    ->route('insumos.create')
                    ->with('warning', 'Insumo creado, pero no se pudo guardar la imagen.');
            }
        }

        return redirect()->route('insumos.create')
            ->with('success', 'Insumo creado correctamente.');
    }

    // Servir imagen desde la tabla Insumo_Imagen
    public function imagen($id)
    {
        $row = DB::connection('newdb')->table('Insumo_Imagen')
            ->where('id_insumo', $id)
            ->orderByDesc('id_imagen')
            ->first();

        if (!$row || !$row->imagen) {
            abort(404);
        }

        $mime = $row->mime ?: 'image/jpeg';

        return response($row->imagen)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'public, max-age=604800');
    }

    // Listado (sin 'categoria' porque no existe en el esquema)
    public function index(Request $request)
    {
        $query = Insumo::on('newdb')
            ->select('id_insumo', 'nombre_insumo', 'stock', 'precio_insumo', 'descripcion_insumo');

        // Búsqueda por nombre
        if ($request->filled('q')) {
            $q = trim($request->q);
            $query->where('nombre_insumo', 'like', "%{$q}%");
        }

        // Orden
        if ($request->get('sort') === 'latest') {
            $query->orderByDesc('id_insumo');
        } else {
            $query->orderBy('id_insumo', 'desc');
        }

        $insumos = $query->get()->map(function ($i) {
            return [
                'id_insumo'          => $i->id_insumo,
                'nombre_insumo'      => $i->nombre_insumo,
                'stock'              => $i->stock,
                'precio_insumo'      => $i->precio_insumo,
                'descripcion_insumo' => $i->descripcion_insumo,
                // url para la última imagen (si existe)
                'imagen_url'         => route('insumos.imagen', $i->id_insumo),
            ];
        });

        // como ya no hay 'categoria' en la BD, devolvemos vacío para no romper el front
        $categorias = [];

        return Inertia::render('Insumos/Index', [
            'insumos'             => $insumos,
            'categorias'          => $categorias,
            'selectedCategorias'  => [], // ya no aplica
            'q'                   => $request->q ?? '',
            'sort'                => $request->get('sort', 'default'),
        ]);
    }
}
