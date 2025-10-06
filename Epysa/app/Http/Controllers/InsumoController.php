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

    // Guardar (con manejo robusto de errores de imagen)
    public function store(Request $request)
    {
        $rules = [
            'nombre_insumo'      => ['required', 'string', 'max:100'],
            'stock'              => ['required', 'integer', 'min:0'],
            'descripcion_insumo' => ['nullable', 'string'],
            'precio_insumo'      => ['required', 'numeric', 'min:0'],
            'categoria'          => ['required', 'string', 'max:100'],
            // archivo opcional pero debe ser imagen válida y <= 4MB
            'imagen'             => ['nullable', 'file', 'image', 'mimes:jpeg,png,webp,jpg', 'max:4096'],
        ];

        $messages = [
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'Formatos permitidos: JPG, PNG o WEBP.',
            'imagen.max'   => 'La imagen no puede superar los 4MB.',
        ];

        $data = $request->validate($rules, $messages);

        $insumo = new Insumo(); // Modelo con protected $connection = 'newdb'
        $insumo->nombre_insumo      = $data['nombre_insumo'];
        $insumo->stock              = $data['stock'];
        $insumo->descripcion_insumo = $data['descripcion_insumo'] ?? null;
        $insumo->precio_insumo      = $data['precio_insumo'];
        $insumo->categoria          = $data['categoria'];

        // Manejo de imagen (opcional)
        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');

            // Chequeo extra: realmente es una imagen
            // (evita archivos renombrados con extensión válida)
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

            // Leer a BLOB con try/catch
            try {
                $insumo->imagen      = file_get_contents($file->getRealPath());
                $insumo->imagen_mime = $file->getMimeType() ?: 'application/octet-stream';
            } catch (\Throwable $e) {
                return back()
                    ->withErrors(['imagen' => 'No se pudo procesar la imagen. Intenta con un JPG/PNG/WEBP distinto.'])
                    ->withInput();
            }
        }

        $insumo->save();

        return redirect()->route('insumos.create')
            ->with('success', 'Insumo creado correctamente.');
    }

    // Servir imagen desde BLOB (seguro)
    public function imagen($id)
    {
        $insumo = Insumo::on('newdb')
            ->select('imagen', 'imagen_mime')
            ->where('id_insumo', $id)
            ->firstOrFail();

        if (!$insumo->imagen) {
            abort(404);
        }

        $mime = $insumo->imagen_mime ?: 'image/jpeg';

        return response($insumo->imagen)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'public, max-age=604800');
    }

    // Listado con filtros (texto + múltiples categorías) y orden
    public function index(Request $request)
    {
        $query = Insumo::on('newdb')
            ->select('id_insumo', 'nombre_insumo', 'stock', 'precio_insumo', 'descripcion_insumo', 'categoria');

        // Búsqueda por nombre
        if ($request->filled('q')) {
            $q = trim($request->q);
            $query->where('nombre_insumo', 'like', "%{$q}%");
        }

        // Filtro por múltiples categorías (categoria[]=A&categoria[]=B)
        $cats = $request->input('categoria', []);
        if (!is_array($cats)) {
            $cats = $cats !== '' ? [$cats] : [];
        }
        if (count($cats)) {
            $query->whereIn('categoria', $cats);
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
                'categoria'          => $i->categoria,
                'imagen_url'         => route('insumos.imagen', $i->id_insumo),
            ];
        });

        $categorias = Insumo::on('newdb')
            ->select('categoria')->distinct()->orderBy('categoria')->pluck('categoria');

        return Inertia::render('Insumos/Index', [
            'insumos'             => $insumos,
            'categorias'          => $categorias,
            'selectedCategorias'  => $cats,
            'q'                   => $request->q ?? '',
            'sort'                => $request->get('sort', 'default'),
        ]);
    }
}
