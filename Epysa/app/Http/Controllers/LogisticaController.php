<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Notifications\SolicitudRechazadaPorLogistica;
use App\Notifications\SolicitudRetrasoNotification;

class LogisticaController extends Controller
{
    // Listado: Aprobada Jefe y Enviada (para seguimiento)
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || strtolower($user->rol ?? '') !== 'logistica') {
            abort(403, 'No autorizado');
        }

        $conn = DB::connection('newdb');
        $idAprobJefe = $conn->table('estado')->where('desc_estado','Aprobada Jefe')->value('id_estado');
        $idEnviada   = $conn->table('estado')->where('desc_estado','Enviada')->value('id_estado');

        $solicitudes = Solicitud::on('newdb')
            ->whereIn('id_estado', array_values(array_filter([(int)$idAprobJefe, (int)$idEnviada])))
            ->orderByDesc('id_solicitud')
            ->get([
                'id_solicitud','insumo_nombre','cantidad','sucursal_nombre','usuario_nombre',
                'eta_calculada','deadline_at','log_fecha_envio','log_fecha_estimada',
                'log_numero_camion','log_ruta_asignada','id_estado'
            ]);

        return Inertia::render('Logistica/Index', [
            'solicitudes' => $solicitudes,
        ]);
    }

    // Form de edición
    public function edit($id, Request $request)
    {
        $user = $request->user();
        if (!$user || strtolower($user->rol ?? '') !== 'logistica') {
            abort(403, 'No autorizado');
        }

        $sol = Solicitud::on('newdb')
            ->select(
                'id_solicitud','insumo_nombre','cantidad','sucursal_nombre','usuario_nombre',
                'eta_calculada','deadline_at','log_fecha_envio','log_fecha_estimada',
                'log_numero_camion','log_ruta_asignada','id_estado'
            )
            ->findOrFail($id);

        return Inertia::render('Logistica/Edit', [
            'solicitud' => $sol,
        ]);
    }

    // Aprobar (guardar info y opcional marcar Enviada)
    public function aprobar($id, Request $request)
    {
        $user = $request->user();
        if (!$user || strtolower($user->rol ?? '') !== 'logistica') {
            abort(403, 'No autorizado');
        }

        $data = $request->validate([
            'log_fecha_envio'    => ['required','date'],
            'log_fecha_estimada' => ['required','date','after_or_equal:log_fecha_envio'],
            'log_numero_camion'  => ['required','string','max:50'],
            'log_ruta_asignada'  => ['required','string','max:255'],
            'marcar_enviada'     => ['nullable','boolean'],
            'motivo'             => ['nullable','string','max:255'], // por si quieres adjuntar motivo interno
        ]);

        return DB::connection('newdb')->transaction(function () use ($id, $data) {
            $conn = DB::connection('newdb');
            $sol  = Solicitud::on('newdb')->lockForUpdate()->findOrFail($id);

            $idAprobJefe = $conn->table('estado')->where('desc_estado','Aprobada Jefe')->value('id_estado');
            $idEnviada   = $conn->table('estado')->where('desc_estado','Enviada')->value('id_estado');

            if (!in_array((int)$sol->id_estado, [(int)$idAprobJefe, (int)$idEnviada], true)) {
                abort(422, 'La solicitud no está lista para logística.');
            }

            $prevEstimada = $sol->log_fecha_estimada ?? $sol->eta_calculada;

            $updates = [
                'log_fecha_envio'    => $data['log_fecha_envio'],
                'log_fecha_estimada' => $data['log_fecha_estimada'],
                'log_numero_camion'  => $data['log_numero_camion'],
                'log_ruta_asignada'  => $data['log_ruta_asignada'],
            ];

            if (!empty($data['marcar_enviada'])) {
                $updates['id_estado'] = $idEnviada;
            }

            $sol->update($updates);

            // Notificación por atraso:
            $newEstimada = $sol->log_fecha_estimada ?? $sol->eta_calculada;
            $mustNotify = false;
            if ($sol->deadline_at && $newEstimada && $newEstimada > $sol->deadline_at) {
                $mustNotify = true;
            } elseif ($prevEstimada && $newEstimada && $newEstimada > $prevEstimada) {
                $mustNotify = true;
            }

            if ($mustNotify) {
                $solicitante = User::on('newdb')->where('id_us', $sol->id_us)->first();
                if ($solicitante && $solicitante->email) {
                    $solicitante->notify(new \App\Notifications\SolicitudRetrasoNotification($sol, $data['motivo'] ?? ''));
                    $sol->update(['retraso_notificado_at' => Carbon::now()]);
                }
            }

            return redirect()->route('sol.logistica.edit', $id)->with('success', 'Solicitud aprobada/actualizada por Logística.');
        });
    }

    // Rechazar por Logística (con motivo y nueva fecha propuesta)
    public function rechazar($id, Request $request)
    {
        $user = $request->user();
        if (!$user || strtolower($user->rol ?? '') !== 'logistica') {
            abort(403, 'No autorizado');
        }

        $data = $request->validate([
            'motivo'              => ['required','string','max:255'],
            'nueva_fecha_propuesta' => ['nullable','date'],
        ]);

        return DB::connection('newdb')->transaction(function () use ($id, $data, $user) {
            $conn = DB::connection('newdb');
            $idRechLog   = $conn->table('estado')->where('desc_estado','Rechazada Logística')->value('id_estado');

            $sol = Solicitud::on('newdb')->lockForUpdate()->findOrFail($id);

            $sol->update([
                'id_estado'          => $idRechLog,
                'log_rechazo_motivo' => $data['motivo'],
                'log_rechazado_por'  => $user->id_us,
                'log_rechazado_at'   => Carbon::now(),
                'log_fecha_estimada' => $data['nueva_fecha_propuesta'] ?? $sol->log_fecha_estimada,
            ]);

            // Notificar al solicitante
            $solicitante = User::on('newdb')->where('id_us', $sol->id_us)->first();
            if ($solicitante && $solicitante->email) {
                $solicitante->notify(new \App\Notifications\SolicitudRechazadaPorLogistica($sol, $data['motivo'], $data['nueva_fecha_propuesta'] ?? null));
            }

            return redirect()->route('sol.logistica.edit', $id)->with('success', 'Solicitud rechazada por Logística y notificada.');
        });
    }
}
