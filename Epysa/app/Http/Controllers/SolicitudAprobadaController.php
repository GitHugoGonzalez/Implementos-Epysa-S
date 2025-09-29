<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SolicitudAprobadaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Solo Jefe
        if (!$user || strtolower(trim($user->rol ?? '')) !== 'jefe') {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $conn = DB::connection('newdb');

        // IDs de estados
        $idAprobada  = $conn->table('estado')->where('desc_estado', 'Aprobada')->value('id_estado');
        $idRechazada = $conn->table('estado')->where('desc_estado', 'Rechazada')->value('id_estado');

        // Filtro opcional ?estado=aprobada|rechazada|todas (default: todas)
        $filtro = strtolower($request->query('estado', 'todas'));
        $ids = [];
        if ($filtro === 'aprobada' && $idAprobada) {
            $ids = [$idAprobada];
        } elseif ($filtro === 'rechazada' && $idRechazada) {
            $ids = [$idRechazada];
        } else {
            // todas (aprobada + rechazada)
            $ids = array_values(array_filter([$idAprobada, $idRechazada], fn($v) => !is_null($v)));
        }

        $solicitudes = Solicitud::on('newdb')
            ->from('solicitudes as s')
            ->leftJoin('estado as e', 'e.id_estado', '=', 's.id_estado')
            ->when(!empty($ids), function ($q) use ($ids) {
                $q->whereIn('s.id_estado', $ids);
            })
            ->orderBy('s.fecha_sol', 'desc')
            ->get([
                's.id_solicitud',
                's.usuario_nombre',
                's.sucursal_nombre',
                's.insumo_nombre',
                's.cantidad',
                's.fecha_sol',
                's.id_estado',
                DB::raw('e.desc_estado as estado'),
            ]);

        return Inertia::render('Jefe/SolicitudesAprobadas', [
            'solicitudes' => $solicitudes,
            'filtro'      => $filtro,
            'debug'       => [
                'idAprobada' => $idAprobada,
                'idRechazada'=> $idRechazada,
                'total'      => $solicitudes->count(),
            ],
        ]);
    }

    public function aprobar($id)
    {
        $user = Auth::user();
        if (!$user || strtolower(trim($user->rol ?? '')) !== 'jefe') {
            abort(403, 'No autorizado.');
        }

        $conn = DB::connection('newdb');
        $idAprobada = $conn->table('estado')->where('desc_estado','Aprobada')->value('id_estado');

        $sol = Solicitud::on('newdb')->findOrFail($id);
        $sol->id_estado = (int) $idAprobada;
        $sol->save();

        return to_route('jefe.solicitudes.aprobadas')->with('success', 'Solicitud aprobada.');
    }

    public function rechazar($id)
    {
        $user = Auth::user();
        if (!$user || strtolower(trim($user->rol ?? '')) !== 'jefe') {
            abort(403, 'No autorizado.');
        }

        $conn = DB::connection('newdb');
        $idRechazada = $conn->table('estado')->where('desc_estado','Rechazada')->value('id_estado');

        $sol = Solicitud::on('newdb')->findOrFail($id);
        $sol->id_estado = (int) $idRechazada;
        $sol->save();

        return to_route('jefe.solicitudes.aprobadas')->with('success', 'Solicitud rechazada.');
    }
}
