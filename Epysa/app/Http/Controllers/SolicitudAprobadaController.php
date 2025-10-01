<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SolicitudAprobadaController extends Controller
{
    /**
     * Muestra las solicitudes según el rol:
     * - Encargado: ve Pendientes
     * - Jefe: ve Aprobadas por Encargado
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        $rol = strtolower(trim($user->rol ?? ''));

        if (!in_array($rol, ['encargado', 'jefe'], true)) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $conn = DB::connection('newdb');

        // Estados por rol
        if ($rol === 'encargado') {
            $estadoFiltro = $conn->table('estado')->where('desc_estado', 'Pendiente')->value('id_estado');
        } else { // jefe
            $estadoFiltro = $conn->table('estado')->where('desc_estado', 'Aprobada Encargado')->value('id_estado');
        }

        $solicitudes = Solicitud::on('newdb')
            ->from('solicitudes as s')
            ->leftJoin('estado as e', 'e.id_estado', '=', 's.id_estado')
            ->when($estadoFiltro, fn($q) => $q->where('s.id_estado', $estadoFiltro))
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

        return Inertia::render('Solicitudes/Aprobar', [
            'solicitudes' => $solicitudes,
            'rol'         => $rol,
        ]);
    }

    /**
     * Aprobar según rol:
     * - Encargado: Pendiente -> Aprobada Encargado
     * - Jefe: Aprobada Encargado -> Aprobada Jefe
     */
    public function aprobar($id)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        $rol = strtolower(trim($user->rol ?? ''));
        if (!in_array($rol, ['encargado', 'jefe'], true)) {
            abort(403, 'No autorizado.');
        }

        return DB::connection('newdb')->transaction(function () use ($id, $rol, $user) {
            $conn = DB::connection('newdb');

            // IDs de estado que vamos a usar
            $idPendiente       = $conn->table('estado')->where('desc_estado','Pendiente')->value('id_estado');
            $idAprobEncargado  = $conn->table('estado')->where('desc_estado','Aprobada Encargado')->value('id_estado');
            $idAprobJefe       = $conn->table('estado')->where('desc_estado','Aprobada Jefe')->value('id_estado');

            $sol = Solicitud::on('newdb')->lockForUpdate()->findOrFail($id);

            if ($rol === 'encargado') {
                if ((int)$sol->id_estado !== (int)$idPendiente) {
                    abort(422, 'La solicitud no está en estado Pendiente.');
                }

                $sol->id_estado = (int)$idAprobEncargado;
                // opcional: marca quién y cuándo aprobó
                $sol->encargado_aprobado_por = $user->id_us ?? null;
                $sol->encargado_aprobado_at  = Carbon::now();
            } else { // jefe
                if ((int)$sol->id_estado !== (int)$idAprobEncargado) {
                    abort(422, 'La solicitud no está Aprobada por Encargado.');
                }

                $sol->id_estado        = (int)$idAprobJefe;
                $sol->jefe_aprobado_por= $user->id_us ?? null;
                $sol->jefe_aprobado_at = Carbon::now();
                // si quieres, aquí puedes setear confirmado_at/eta/deadline (lo dejamos fuera para centrarnos en el flujo)
            }

            $sol->save();

            return back()->with('success', 'Solicitud aprobada correctamente.');
        });
    }

    /**
     * Rechazar según rol:
     * - Encargado: Pendiente -> Rechazada Encargado
     * - Jefe: Aprobada Encargado -> Rechazada Jefe
     */
    public function rechazar($id, Request $request)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        $rol = strtolower(trim($user->rol ?? ''));
        if (!in_array($rol, ['encargado', 'jefe'], true)) {
            abort(403, 'No autorizado.');
        }

        $motivo = $request->input('motivo');

        return DB::connection('newdb')->transaction(function () use ($id, $rol, $motivo, $user) {
            $conn = DB::connection('newdb');

            $idPendiente        = $conn->table('estado')->where('desc_estado','Pendiente')->value('id_estado');
            $idAprobEncargado   = $conn->table('estado')->where('desc_estado','Aprobada Encargado')->value('id_estado');
            $idRechEncargado    = $conn->table('estado')->where('desc_estado','Rechazada Encargado')->value('id_estado');
            $idRechJefe         = $conn->table('estado')->where('desc_estado','Rechazada Jefe')->value('id_estado');

            $sol = Solicitud::on('newdb')->lockForUpdate()->findOrFail($id);

            if ($rol === 'encargado') {
                if ((int)$sol->id_estado !== (int)$idPendiente) {
                    abort(422, 'La solicitud no está en estado Pendiente.');
                }
                $sol->id_estado = (int)$idRechEncargado;
            } else { // jefe
                if ((int)$sol->id_estado !== (int)$idAprobEncargado) {
                    abort(422, 'La solicitud no está Aprobada por Encargado.');
                }
                $sol->id_estado = (int)$idRechJefe;
                $sol->jefe_rechazo_motivo = $motivo;
            }

            $sol->save();

            return back()->with('success', 'Solicitud rechazada.');
        });
    }
}
