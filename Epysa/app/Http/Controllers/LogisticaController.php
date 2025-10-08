<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Solicitud;
use App\Models\User;

class LogisticaController extends Controller
{
    /** Listado: ver todo lo listo para logística (aprobado por Jefe) + lo que ya está en curso. */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || ! $user->hasRole('logistica')) {
            abort(403, 'No autorizado');
        }

        $conn = DB::connection('newdb');

        // Estado "Aprobada Jefe"
        $idAprobJefe = $conn->table('Estado')
            ->whereRaw('LOWER(desc_estado) = ?', ['aprobada jefe'])
            ->value('id_estado');

        // Traemos solicitudes:
        // - con id_estado = Aprobada Jefe (aún no gestionadas por logística)
        // - o con registro en Logistica en estado pendiente / en_transito
        $rows = $conn->table('Solicitudes as s')
            ->join('Insumos as i', 'i.id_insumo', '=', 's.id_insumo')
            ->join('Usuarios as u', 'u.id_us', '=', 's.id_us')
            ->join('Sucursal as su', 'su.id_sucursal', '=', 's.id_sucursal')
            ->leftJoin('Logistica as l', 'l.id_solicitud', '=', 's.id_solicitud')
            ->leftJoin('Estado as e', 'e.id_estado', '=', 's.id_estado')
            ->where(function($w) use ($idAprobJefe) {
                $w->where('s.id_estado', $idAprobJefe)
                  ->orWhereIn('l.estado_logistica', ['pendiente','en_transito']);
            })
            ->orderByDesc('s.id_solicitud')
            ->select([
                's.id_solicitud',
                's.cantidad',
                's.fecha_sol',
                'e.desc_estado as estado_solicitud',
                'i.nombre_insumo as insumo_nombre',
                DB::raw("CONCAT(su.ciudad, ' — ', su.direccion) as sucursal_nombre"),
                'u.name as usuario_nombre',
                // Campos de logística (pueden venir null si aún no hay registro)
                'l.id_logistica',
                'l.fecha_envio',
                'l.fecha_estimada',
                'l.numero_camion',
                'l.ruta_asignada',
                'l.estado_logistica',
                'l.rechazo_motivo',
                'l.rechazado_por',
                'l.rechazado_at',
                'l.fecha_entrega_real',
            ])
            ->get();

        return Inertia::render('Logistica/Index', [
            'solicitudes' => $rows,
        ]);
    }

    /** Form de edición de una solicitud en logística */
    public function edit($id, Request $request)
    {
        $user = $request->user();
        if (!$user || ! $user->hasRole('logistica')) {
            abort(403, 'No autorizado');
        }

        $conn = DB::connection('newdb');

        $row = $conn->table('Solicitudes as s')
            ->join('Insumos as i', 'i.id_insumo', '=', 's.id_insumo')
            ->join('Usuarios as u', 'u.id_us', '=', 's.id_us')
            ->join('Sucursal as su', 'su.id_sucursal', '=', 's.id_sucursal')
            ->leftJoin('Logistica as l', 'l.id_solicitud', '=', 's.id_solicitud')
            ->leftJoin('Estado as e', 'e.id_estado', '=', 's.id_estado')
            ->where('s.id_solicitud', $id)
            ->select([
                's.id_solicitud',
                's.cantidad',
                's.fecha_sol',
                'e.desc_estado as estado_solicitud',
                'i.id_insumo',
                'i.nombre_insumo as insumo_nombre',
                DB::raw("CONCAT(su.ciudad, ' — ', su.direccion) as sucursal_nombre"),
                'u.id_us as solicitante_id',
                'u.name as usuario_nombre',

                'l.id_logistica',
                'l.fecha_envio',
                'l.fecha_estimada',
                'l.numero_camion',
                'l.ruta_asignada',
                'l.estado_logistica',
                'l.rechazo_motivo',
                'l.rechazado_por',
                'l.rechazado_at',
                'l.fecha_entrega_real',
            ])
            ->first();

        if (!$row) {
            abort(404, 'Solicitud no encontrada');
        }

        return Inertia::render('Logistica/Edit', [
            'solicitud' => $row,
        ]);
    }

    /** Guardar/actualizar datos de logística (y opcionalmente marcar en_transito) */
    public function aprobar($id, Request $request)
    {
        $user = $request->user();
        if (!$user || ! $user->hasRole('logistica')) {
            abort(403, 'No autorizado');
        }

        $data = $request->validate([
            'fecha_envio'    => ['required','date'],
            'fecha_estimada' => ['required','date','after_or_equal:fecha_envio'],
            'numero_camion'  => ['required','string','max:50'],
            'ruta_asignada'  => ['required','string','max:255'],
            'marcar_en_transito' => ['nullable','boolean'], // checkbox del form
            'motivo'         => ['nullable','string','max:255'], // motivo interno opcional
        ]);

        DB::connection('newdb')->transaction(function () use ($id, $data, $user) {
            $conn = DB::connection('newdb');

            // Verificamos que la solicitud esté al menos aprobada por Jefe
            $idAprobJefe = $conn->table('Estado')
                ->whereRaw('LOWER(desc_estado) = ?', ['aprobada jefe'])
                ->value('id_estado');

            $sol = $conn->table('Solicitudes')->where('id_solicitud', $id)->lockForUpdate()->first();
            if (!$sol) abort(404, 'Solicitud no encontrada');

            if ((int)$sol->id_estado !== (int)$idAprobJefe) {
                // Permitimos también editar si ya existe logística en curso
                $log = $conn->table('Logistica')->where('id_solicitud', $id)->first();
                if (!$log || !in_array($log->estado_logistica, ['pendiente','en_transito'], true)) {
                    abort(422, 'La solicitud no está lista para logística.');
                }
            }

            // Upsert en la tabla Logistica
            $exists = $conn->table('Logistica')->where('id_solicitud', $id)->exists();

            $payload = [
                'fecha_envio'    => $data['fecha_envio'],
                'fecha_estimada' => $data['fecha_estimada'],
                'numero_camion'  => $data['numero_camion'],
                'ruta_asignada'  => $data['ruta_asignada'],
            ];

            if ($exists) {
                $conn->table('Logistica')->where('id_solicitud', $id)->update($payload);
            } else {
                $payload['id_solicitud']   = $id;
                $payload['estado_logistica'] = 'pendiente';
                $conn->table('Logistica')->insert($payload);
            }

            // Cambio de estado logístico (opcional)
            if (!empty($data['marcar_en_transito'])) {
                $conn->table('Logistica')
                    ->where('id_solicitud', $id)
                    ->update(['estado_logistica' => 'en_transito']);
            }

            // (Opcional) notificación por retraso — si la nueva estimada > estimada anterior
            $logNow = $conn->table('Logistica')->where('id_solicitud', $id)->first();
            $logPrev = $conn->table('Logistica')->where('id_solicitud', $id)->orderByDesc('id_logistica')->skip(1)->first(); // simple placeholder; si quieres un histórico, hay que modelarlo
            if ($logPrev && $logNow && $logPrev->fecha_estimada && $logNow->fecha_estimada && $logNow->fecha_estimada > $logPrev->fecha_estimada) {
                $solicitante = User::on('newdb')->find($sol->id_us);
                if ($solicitante && $solicitante->email && class_exists(\App\Notifications\SolicitudRetrasoNotification::class)) {
                    $solicitante->notify(new \App\Notifications\SolicitudRetrasoNotification((object)$sol, $data['motivo'] ?? ''));
                }
            }
        });

        return redirect()->route('sol.logistica.edit', $id)->with('success', 'Datos de logística guardados.');
    }

    /** Rechazar desde Logística */
    public function rechazar($id, Request $request)
    {
        $user = $request->user();
        if (!$user || ! $user->hasRole('logistica')) {
            abort(403, 'No autorizado');
        }

        $data = $request->validate([
            'motivo'                => ['required','string','max:255'],
            'nueva_fecha_propuesta' => ['nullable','date'],
        ]);

        DB::connection('newdb')->transaction(function () use ($id, $data, $user) {
            $conn = DB::connection('newdb');

            // Asegurar registro en Logistica
            $exists = $conn->table('Logistica')->where('id_solicitud', $id)->exists();
            if (!$exists) {
                $conn->table('Logistica')->insert([
                    'id_solicitud'    => $id,
                    'estado_logistica'=> 'rechazado',
                    'rechazo_motivo'  => $data['motivo'],
                    'rechazado_por'   => $user->id_us,
                    'rechazado_at'    => Carbon::now(),
                    'fecha_estimada'  => $data['nueva_fecha_propuesta'] ?? null,
                ]);
            } else {
                $conn->table('Logistica')->where('id_solicitud', $id)->update([
                    'estado_logistica'=> 'rechazado',
                    'rechazo_motivo'  => $data['motivo'],
                    'rechazado_por'   => $user->id_us,
                    'rechazado_at'    => Carbon::now(),
                    'fecha_estimada'  => $data['nueva_fecha_propuesta'] ?? DB::raw('fecha_estimada'),
                ]);
            }

            // Notificar al solicitante (si existe la notificación)
            $sol = $conn->table('Solicitudes')->where('id_solicitud', $id)->first();
            if ($sol) {
                $solicitante = User::on('newdb')->find($sol->id_us);
                if ($solicitante && $solicitante->email && class_exists(\App\Notifications\SolicitudRechazadaPorLogistica::class)) {
                    $solicitante->notify(
                        new \App\Notifications\SolicitudRechazadaPorLogistica(
                            (object)$sol,
                            $data['motivo'],
                            $data['nueva_fecha_propuesta'] ?? null
                        )
                    );
                }
            }
        });

        return redirect()->route('sol.logistica.edit', $id)->with('success', 'Solicitud rechazada por Logística.');
    }
}
