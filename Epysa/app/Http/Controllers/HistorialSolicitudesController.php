<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Solicitud;
use App\Models\Sucursal;
use App\Models\Estado;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Log;

class HistorialSolicitudesController extends Controller
{
    public function index(Request $request)
    {
        $q        = trim((string) $request->get('q', ''));
        $sucursal = $request->get('sucursal');   // id_sucursal
        $estado   = $request->get('estado');     // id_estado

        $solicitudes = Solicitud::on('newdb')
            ->with([
                'usuario:id_us,name,email',
                'sucursal:id_sucursal,ciudad,direccion',
                'insumo:id_insumo,nombre_insumo',
                'estado:id_estado,desc_estado',
            ])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($qq) use ($q) {
                    $qq->where('id_solicitud', 'like', "%{$q}%")
                       ->orWhere('cantidad', 'like', "%{$q}%")
                       ->orWhereHas('usuario', function ($u) use ($q) {
                           $u->where('name', 'like', "%{$q}%")
                             ->orWhere('email', 'like', "%{$q}%");
                       })
                       ->orWhereHas('sucursal', function ($s) use ($q) {
                           $s->where('ciudad', 'like', "%{$q}%")
                             ->orWhere('direccion', 'like', "%{$q}%");
                       })
                       ->orWhereHas('insumo', function ($i) use ($q) {
                           $i->where('nombre_insumo', 'like', "%{$q}%");
                       })
                       ->orWhereHas('estado', function ($e) use ($q) {
                           $e->where('desc_estado', 'like', "%{$q}%");
                       });
                });
            })
            ->when(!empty($sucursal), fn($q2) => $q2->where('id_sucursal', $sucursal))
            ->when(!empty($estado),   fn($q2) => $q2->where('id_estado',   $estado))
            ->orderBy('fecha_sol', 'desc')
            ->paginate(15)
            ->withQueryString();

        $sucursales = Sucursal::on('newdb')
            ->select([
                DB::raw('id_sucursal as id'),
                DB::raw("CONCAT(ciudad, ' - ', direccion) as nombre"),
            ])
            ->orderBy('ciudad')
            ->get();

        $estados = Estado::on('newdb')
            ->select([
                DB::raw('id_estado as value'),
                DB::raw('desc_estado as label'),
            ])
            ->orderBy('desc_estado')
            ->get();

        return Inertia::render('Solicitudes/Historial', [
            'solicitudes' => $solicitudes,
            'filtros'     => [
                'q'        => $q,
                'sucursal' => $sucursal,
                'estado'   => $estado,
            ],
            'sucursales'  => $sucursales,
            'estados'     => $estados,
        ]);
    }

    /**
     * Exporta CSV sin librerías externas.
     * Genera encabezados, usa BOM UTF-8 y stream por chunks.
     */
    public function export(Request $request): StreamedResponse
    {
        $payload  = $request->only(['q','estado','sucursal']);
        $q        = trim((string) ($payload['q'] ?? ''));
        $estadoId = $payload['estado']   ?? null;
        $sucursal = $payload['sucursal'] ?? null;

        $fileName = 'historial_solicitudes_' . now()->format('Ymd_His') . '.csv';

        $response = new StreamedResponse(function () use ($q, $estadoId, $sucursal) {
            // Abrimos salida estándar
            $out = fopen('php://output', 'w');

            // BOM para que Excel reconozca UTF-8
            fwrite($out, "\xEF\xBB\xBF");

            // Encabezados
            $headers = ['Fecha', 'N° Solicitud', 'Estado', 'Sucursal', 'Solicitante', 'Correo', 'Insumo', 'Cantidad'];
            fputcsv($out, $headers, ';'); // ; suele abrir mejor en Excel versión ES/CL

            // Query base (misma que index, pero sin paginar)
            $query = Solicitud::on('newdb')
                ->with([
                    'usuario:id_us,name,email',
                    'sucursal:id_sucursal,ciudad,direccion',
                    'insumo:id_insumo,nombre_insumo',
                    'estado:id_estado,desc_estado',
                ])
                ->when($q !== '', function ($builder) use ($q) {
                    $builder->where(function ($qq) use ($q) {
                        $qq->where('id_solicitud', 'like', "%{$q}%")
                           ->orWhere('cantidad', 'like', "%{$q}%")
                           ->orWhereHas('usuario', function ($u) use ($q) {
                               $u->where('name', 'like', "%{$q}%")
                                 ->orWhere('email', 'like', "%{$q}%");
                           })
                           ->orWhereHas('sucursal', function ($s) use ($q) {
                               $s->where('ciudad', 'like', "%{$q}%")
                                 ->orWhere('direccion', 'like', "%{$q}%");
                           })
                           ->orWhereHas('insumo', function ($i) use ($q) {
                               $i->where('nombre_insumo', 'like', "%{$q}%");
                           })
                           ->orWhereHas('estado', function ($e) use ($q) {
                               $e->where('desc_estado', 'like', "%{$q}%");
                           });
                    });
                })
                ->when(!empty($sucursal), fn($q2) => $q2->where('id_sucursal', $sucursal))
                ->when(!empty($estadoId), fn($q2) => $q2->where('id_estado',   $estadoId))
                ->orderBy('id_solicitud'); // para chunk estable

            // Stream por chunks para no reventar memoria
            $query->chunk(1000, function ($rows) use ($out) {
                foreach ($rows as $row) {
                    $sucursalTxt = '';
                    if ($row->sucursal) {
                        $parts = array_filter([$row->sucursal->ciudad ?? null, $row->sucursal->direccion ?? null]);
                        $sucursalTxt = implode(' - ', $parts);
                    }

                    $csvRow = [
                        (string) $row->fecha_sol,
                        $row->id_solicitud,
                        optional($row->estado)->desc_estado,
                        $sucursalTxt,
                        optional($row->usuario)->name,
                        optional($row->usuario)->email,
                        optional($row->insumo)->nombre_insumo,
                        $row->cantidad,
                    ];

                    fputcsv($out, $csvRow, ';');
                }

                // Vaciar buffers de salida por bloque (mejora la transmisión)
                if (function_exists('flush')) {
                    flush();
                }
            });

            fclose($out);
        });

        // Headers HTTP para descarga
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="'.$fileName.'"');
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate');

        return $response;
    }
}
