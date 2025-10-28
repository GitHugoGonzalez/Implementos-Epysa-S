<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InsumoController extends Controller
{
    // ========= CREAR =========
    public function create()
    {
        return Inertia::render('Insumos/Create');
    }

    public function store(Request $request)
    {
        $rules = [
            'nombre_insumo'      => ['required', 'string', 'max:150'],
            'stock'              => ['required', 'integer', 'min:0'],
            'descripcion_insumo' => ['nullable', 'string'],
            'precio_insumo'      => ['required', 'numeric', 'min:0'],
            'categoria'          => ['nullable', 'string', 'max:100'],
            'imagen'             => ['nullable', 'file', 'image', 'mimes:jpeg,png,webp,jpg', 'max:4096'],
        ];

        $data = $request->validate($rules);

        $insumo = new Insumo();
        $insumo->setConnection('newdb');
        $insumo->nombre_insumo      = $data['nombre_insumo'];
        $insumo->stock              = $data['stock'];
        $insumo->descripcion_insumo = $data['descripcion_insumo'] ?? null;
        $insumo->precio_insumo      = $data['precio_insumo'];
        $insumo->categoria          = $data['categoria'] ?? null;
        $insumo->save();

        // Imagen opcional
        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $conn = DB::connection('newdb');
            $conn->table('Insumo_Imagen')->insert([
                'id_insumo' => $insumo->id_insumo,
                'imagen'    => file_get_contents($file->getRealPath()),
                'mime'      => $file->getMimeType() ?: 'application/octet-stream',
            ]);
        }

        return redirect()->route('insumos.index')->with('success', 'Insumo creado correctamente.');
    }

    // ========= IMAGEN =========
    public function imagen($id)
    {
        $row = DB::connection('newdb')->table('Insumo_Imagen')
            ->where('id_insumo', $id)
            ->orderByDesc('id_imagen')
            ->first();

        if (!$row || !$row->imagen) abort(404);

        $mime = $row->mime ?: 'image/jpeg';

        return response($row->imagen)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'public, max-age=604800');
    }

    // ========= LISTADO =========
    public function index(Request $request)
    {
        $query = Insumo::on('newdb')
            ->select('id_insumo', 'nombre_insumo', 'stock', 'precio_insumo', 'descripcion_insumo', 'categoria');

        if ($request->filled('q')) {
            $q = trim($request->q);
            $query->where('nombre_insumo', 'like', "%{$q}%");
        }

        $query->orderByDesc('id_insumo');

        $insumos = $query->get()->map(function ($i) {
            $img = DB::connection('newdb')->table('Insumo_Imagen')
                ->where('id_insumo', $i->id_insumo)
                ->select('id_imagen')
                ->orderByDesc('id_imagen')
                ->first();

            $urlBase = route('insumos.imagen', $i->id_insumo);
            $imagenUrl = $img ? ($urlBase . '?v=' . $img->id_imagen) : null;

            return [
                'id_insumo'          => $i->id_insumo,
                'nombre_insumo'      => $i->nombre_insumo,
                'stock'              => $i->stock,
                'precio_insumo'      => $i->precio_insumo,
                'descripcion_insumo' => $i->descripcion_insumo,
                'categoria'          => $i->categoria,
                'imagen_url'         => $imagenUrl,
            ];
        });

        return Inertia::render('Insumos/Index', [
            'insumos' => $insumos,
            'q'       => $request->q ?? '',
        ]);
    }

    // ========= EDITAR =========
    public function edit(int $id)
    {
        $conn = DB::connection('newdb');
        $insumo = $conn->table('Insumos')->where('id_insumo', $id)->first();

        if (!$insumo) abort(404, 'Insumo no encontrado');

        $imagen = $conn->table('Insumo_Imagen')
            ->where('id_insumo', $id)
            ->select('id_imagen', 'mime')
            ->orderByDesc('id_imagen')
            ->first();

        return Inertia::render('Insumos/Edit', [
            'insumo' => $insumo,
            'imagen' => $imagen ? [
                'id_imagen' => $imagen->id_imagen,
                'mime'      => $imagen->mime,
                'url'       => route('insumos.imagen', $id) . '?v=' . $imagen->id_imagen,
            ] : null,
        ]);
    }

    // ========= ACTUALIZAR =========
    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'nombre_insumo'      => ['required','string','max:150'],
            'stock'              => ['required','integer','min:0'],
            'descripcion_insumo' => ['nullable','string'],
            'precio_insumo'      => ['required','numeric','min:0'],
            'categoria'          => ['nullable','string','max:100'],
            'imagen'             => ['nullable','file','image','mimes:jpeg,png,webp,jpg','max:4096'],
        ]);

        $conn = DB::connection('newdb');
        $exists = $conn->table('Insumos')->where('id_insumo', $id)->exists();
        if (!$exists) abort(404, 'Insumo no encontrado');

        $conn->transaction(function () use ($conn, $data, $request, $id) {
            $conn->table('Insumos')->where('id_insumo', $id)->update([
                'nombre_insumo'      => $data['nombre_insumo'],
                'stock'              => $data['stock'],
                'descripcion_insumo' => $data['descripcion_insumo'] ?? null,
                'precio_insumo'      => $data['precio_insumo'],
                'categoria'          => $data['categoria'] ?? null,
            ]);

            if ($request->hasFile('imagen')) {
                $file = $request->file('imagen');
                $conn->table('Insumo_Imagen')->where('id_insumo', $id)->delete();
                $conn->table('Insumo_Imagen')->insert([
                    'id_insumo' => $id,
                    'imagen'    => file_get_contents($file->getRealPath()),
                    'mime'      => $file->getMimeType() ?: 'application/octet-stream',
                ]);
            }
        });

        return redirect()->route('insumos.index')->with('success', 'Insumo actualizado correctamente.');
    }

    // ========= ELIMINAR (guarda en historial) =========
    public function destroy(Request $request, int $id)
    {
        $conn = DB::connection('newdb');

        $insumo = $conn->table('Insumos')
            ->where('id_insumo', $id)
            ->select('id_insumo', 'nombre_insumo', DB::raw('COALESCE(fecha_creacion, NOW()) as fecha_creacion'))
            ->first();

        if (!$insumo) {
            return redirect()->route('insumos.index')
                ->with('error', 'El insumo no existe o ya fue eliminado.');
        }

        // Confirmación por nombre
        $input = (string) $request->input('confirm_name', '');
        $norm = fn(string $s) => preg_replace('/\s+/u', ' ', trim(mb_strtolower($s, 'UTF-8')));
        if ($norm($input) === '' || $norm($input) !== $norm((string)$insumo->nombre_insumo)) {
            return back()->with('error', 'Debes escribir exactamente el nombre del insumo para confirmar la eliminación.');
        }

        // Control de dependencias: no se puede eliminar si hay solicitudes
        $totalSolicitudes = (int) $conn->table('Solicitudes')->where('id_insumo', $id)->count();
        if ($totalSolicitudes > 0) {
            return back()->with('error', "No se puede eliminar: hay {$totalSolicitudes} solicitud(es) asociada(s) a este insumo.");
        }

        try {
            $conn->transaction(function () use ($conn, $insumo, $id, $request) {
                // Guardar en historial
                $motivo = $request->input('motivo_eliminacion');
                $conn->table('Historial_Insumos')->insert([
                    'nombre_insumo'      => $insumo->nombre_insumo,
                    'fecha_creacion'     => $insumo->fecha_creacion,
                    'fecha_eliminacion'  => now(),
                    'motivo_eliminacion' => $motivo ?: null,
                ]);

                // Borrar imagen primero
                $conn->table('Insumo_Imagen')->where('id_insumo', $id)->delete();

                // Borrar insumo
                $conn->table('Insumos')->where('id_insumo', $id)->delete();
            });

            return redirect()->route('insumos.index')->with('success', 'Insumo eliminado y registrado en historial.');
        } catch (\Throwable $e) {
            Log::error('[Insumos] Error al eliminar', [
                'id_insumo' => $id,
                'exception' => $e,
            ]);
            return back()->with('error', 'Error al eliminar: ' . $e->getMessage());
        }
    }
}
