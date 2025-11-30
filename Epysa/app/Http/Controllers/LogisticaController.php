<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Carbon\Carbon;

class LogisticaController extends Controller
{
    /**
     * Listado: ver todo lo listo para logística (aprobado por Jefe)
     * + lo que ya está en curso (pendiente / en_transito).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('logistica')) {
            abort(403, 'No autorizado');
        }

        $conn = DB::connection('newdb');
        $idAprobJefe = $this->estadoId('aprobado jefe');

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
                DB::raw('s.id_us as solicitante_id'),
                DB::raw('e.desc_estado as estado_solicitud'),
                DB::raw('i.nombre_insumo as insumo_nombre'),
                DB::raw("CONCAT(su.ciudad, ' — ', su.direccion) as sucursal_nombre"),
                DB::raw('u.name as usuario_nombre'),
                // Logística
                'l.id_logistica',
                'l.fecha_envio',
                'l.fecha_estimada',
                'l.numero_camion',
                'l.ruta_asignada',
                'l.estado_logistica',
                'l.rechazo_motivo',
                DB::raw('NULL as rechazado_por'), // la columna no existe en BD
                'l.rechazado_at',
                'l.fecha_entrega_real',
            ])
            ->get();

        return Inertia::render('Logistica/Index', [
            'solicitudes' => $rows,
        ]);
    }

    /** Form de edición */
    public function edit($id, Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('logistica')) {
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
                DB::raw('s.id_us as solicitante_id'),
                DB::raw('e.desc_estado as estado_solicitud'),
                'i.id_insumo',
                DB::raw('i.nombre_insumo as insumo_nombre'),
                DB::raw("CONCAT(su.ciudad, ' — ', su.direccion) as sucursal_nombre"),
                DB::raw('u.name as usuario_nombre'),
                'l.id_logistica',
                'l.fecha_envio',
                'l.fecha_estimada',
                'l.numero_camion',
                'l.ruta_asignada',
                'l.estado_logistica',
                'l.rechazo_motivo',
                DB::raw('NULL as rechazado_por'),
                'l.rechazado_at',
                'l.fecha_entrega_real',
            ])
            ->first();

        if (!$row) abort(404, 'Solicitud no encontrada');

        return Inertia::render('Logistica/Edit', [
            'solicitud' => $row,
        ]);
    }

    /**
     * Guardar/actualizar datos de logística y opcionalmente marcar en_transito.
     * Si hay retraso (fecha_estimada aumenta), notifica a aprobadores y al operario.
     */
    public function aprobar($id, Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('logistica')) {
            abort(403, 'No autorizado');
        }

        $data = $request->validate([
            'fecha_envio'        => ['required','date'],
            'fecha_estimada'     => ['required','date','after_or_equal:fecha_envio'],
            'numero_camion'      => ['required','string','max:50'],
            'ruta_asignada'      => ['required','string','max:255'],
            'marcar_en_transito' => ['nullable','boolean'],
            'motivo'             => ['nullable','string','max:255'], // comentario opcional
        ]);

        DB::connection('newdb')->transaction(function () use ($id, $data, $user) {
            $conn = DB::connection('newdb');

            $idAprobJefe = $this->estadoId('aprobado jefe');

            $sol = $conn->table('Solicitudes')->where('id_solicitud', $id)->lockForUpdate()->first();
            if (!$sol) abort(404, 'Solicitud no encontrada');

            if ((int)$sol->id_estado !== (int)$idAprobJefe) {
                $log = $conn->table('Logistica')->where('id_solicitud', $id)->first();
                if (!$log || !in_array($log->estado_logistica, ['pendiente','en_transito'], true)) {
                    abort(422, 'La solicitud no está lista para logística.');
                }
            }

            $prev = $conn->table('Logistica')->where('id_solicitud', $id)->first();

            // Upsert logística
            $payload = [
                'fecha_envio'    => $data['fecha_envio'],
                'fecha_estimada' => $data['fecha_estimada'],
                'numero_camion'  => $data['numero_camion'],
                'ruta_asignada'  => $data['ruta_asignada'],
            ];

            $esNuevaAprobacion = false;
            if ($prev) {
                $conn->table('Logistica')->where('id_solicitud', $id)->update($payload);
                // Si antes estaba rechazado y ahora se aprueba
                if ($prev->estado_logistica === 'rechazado') {
                    $esNuevaAprobacion = true;
                }
            } else {
                $payload['id_solicitud']     = $id;
                $payload['estado_logistica'] = 'pendiente';
                $conn->table('Logistica')->insert($payload);
                $esNuevaAprobacion = true;
            }

            if (!empty($data['marcar_en_transito'])) {
                $conn->table('Logistica')
                    ->where('id_solicitud', $id)
                    ->update(['estado_logistica' => 'en_transito']);
            }

            // Obtener datos actualizados para el correo
            $nowLog = $conn->table('Logistica')->where('id_solicitud', $id)->first();
            
            // Detectar retraso
            $hayRetraso = false;
            if ($prev && $prev->fecha_estimada && $nowLog->fecha_estimada) {
                $hayRetraso = (strtotime($nowLog->fecha_estimada) > strtotime($prev->fecha_estimada));
            }

            // Datos para email
            $solRow = $conn->table('Solicitudes as s')
                ->join('Insumos as i', 'i.id_insumo', '=', 's.id_insumo')
                ->join('Sucursal as su', 'su.id_sucursal', '=', 's.id_sucursal')
                ->join('Usuarios as us', 'us.id_us', '=', 's.id_us') // solicitante
                ->where('s.id_solicitud', $id)
                ->select([
                    's.id_solicitud','s.cantidad','s.fecha_sol',
                    'i.nombre_insumo',
                    DB::raw("CONCAT(su.ciudad, ' — ', su.direccion) as sucursal_nombre"),
                    'us.email as solicitante_email',
                    'us.name  as solicitante_nombre',
                ])->first();

            $info = [
                'solicitud' => [
                    'id'        => $solRow->id_solicitud,
                    'cantidad'  => $solRow->cantidad,
                    'fecha_sol' => $solRow->fecha_sol,
                ],
                'insumo'      => $solRow->nombre_insumo,
                'sucursal'    => $solRow->sucursal_nombre,
                'solicitante' => [
                    'name'  => $solRow->solicitante_nombre,
                    'email' => $solRow->solicitante_email,
                ],
                'logistica' => [
                    'fecha_envio'    => $nowLog->fecha_envio,
                    'fecha_estimada' => $nowLog->fecha_estimada,
                    'numero_camion'  => $nowLog->numero_camion,
                    'ruta_asignada'  => $nowLog->ruta_asignada,
                    'estado'         => $nowLog->estado_logistica,
                ],
                'aprobado_por' => $user->name,
            ];

            $destinatarios = $this->aprobadoresDeSolicitud($id);

            // Enviar post-commit: SOLO para nueva aprobación
            DB::afterCommit(function () use ($destinatarios, $info, $solRow, $esNuevaAprobacion) {
                // Envío de correo por NUEVA APROBACIÓN
                if ($esNuevaAprobacion) {
                    // A aprobadores
                    foreach ($destinatarios as $u) {
                        if (!$u->email) continue;
                        try {
                            Mail::to($u->email)->send(
                                new \App\Mail\LogisticaAprobacionMail($info)
                            );
                        } catch (\Throwable $e) {
                            Log::error('Error enviando correo de aprobación (aprobador)', [
                                'to' => $u->email,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                    // Al operario solicitante
                    if (!empty($solRow->solicitante_email)) {
                        try {
                            Mail::to($solRow->solicitante_email)->send(
                                new \App\Mail\LogisticaAprobacionMail($info)
                            );
                        } catch (\Throwable $e) {
                            Log::error('Error enviando correo de aprobación (solicitante)', [
                                'to' => $solRow->solicitante_email,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                }
            });
        });

        return redirect()->route('sol.logistica.edit', $id)->with('success', 'Datos de logística guardados.');
    }

    /**
     * Rechazar desde Logística:
     * - Actualiza estado_logistica = 'rechazado'
     * - Notifica aprobadores y también al operario solicitante
     */
    public function rechazar($id, Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('logistica')) {
            abort(403, 'No autorizado');
        }

        $data = $request->validate([
            'motivo'                => ['required','string','max:255'],
            'nueva_fecha_propuesta' => ['nullable','date'],
        ]);

        DB::connection('newdb')->transaction(function () use ($id, $data, $user) {
            $conn = DB::connection('newdb');

            $exists = $conn->table('Logistica')->where('id_solicitud', $id)->exists();

            // Trazabilidad sin cambiar esquema: incluir quién rechazó dentro del motivo
            $motivoConAutor = $data['motivo'].' (rechazado por '.$user->name.' #'.$user->id_us.')';

            if (!$exists) {
                $conn->table('Logistica')->insert([
                    'id_solicitud'     => $id,
                    'estado_logistica' => 'rechazado',
                    'rechazo_motivo'   => $motivoConAutor,
                    'rechazado_at'     => Carbon::now(),
                    'fecha_estimada'   => $data['nueva_fecha_propuesta'] ?? null,
                ]);
            } else {
                $conn->table('Logistica')->where('id_solicitud', $id)->update([
                    'estado_logistica' => 'rechazado',
                    'rechazo_motivo'   => $motivoConAutor,
                    'rechazado_at'     => Carbon::now(),
                    'fecha_estimada'   => $data['nueva_fecha_propuesta'] ?? DB::raw('fecha_estimada'),
                ]);
            }

            // Datos para email (aprobadores + solicitante)
            $solRow = $conn->table('Solicitudes as s')
                ->join('Insumos as i', 'i.id_insumo', '=', 's.id_insumo')
                ->join('Sucursal as su', 'su.id_sucursal', '=', 's.id_sucursal')
                ->join('Usuarios as us', 'us.id_us', '=', 's.id_us') // solicitante
                ->where('s.id_solicitud', $id)
                ->select([
                    's.id_solicitud','s.cantidad','s.fecha_sol',
                    'i.nombre_insumo',
                    DB::raw("CONCAT(su.ciudad, ' — ', su.direccion) as sucursal_nombre"),
                    'us.email as solicitante_email',
                    'us.name  as solicitante_nombre',
                ])->first();

            $info = [
                'solicitud' => [
                    'id'        => $solRow->id_solicitud,
                    'cantidad'  => $solRow->cantidad,
                    'fecha_sol' => $solRow->fecha_sol,
                ],
                'insumo'      => $solRow->nombre_insumo,
                'sucursal'    => $solRow->sucursal_nombre,
                'solicitante' => [
                    'name'  => $solRow->solicitante_nombre,
                    'email' => $solRow->solicitante_email,
                ],
            ];

            $destinatarios = $this->aprobadoresDeSolicitud($id);

            // Enviar post-commit: aprobadores + operario
            DB::afterCommit(function () use ($destinatarios, $info, $data, $solRow) {
                // Aprobadores
                foreach ($destinatarios as $u) {
                    if (!$u->email) continue;
                    try {
                        Mail::to($u->email)->send(
                            new \App\Mail\LogisticaRechazoMail(
                                $info,
                                $data['motivo'],
                                $data['nueva_fecha_propuesta'] ?? null
                            )
                        );
                    } catch (\Throwable $e) {
                        Log::error('Error enviando correo de rechazo (aprobador)', [
                            'to' => $u->email,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
                // Operario solicitante
                if (!empty($solRow->solicitante_email)) {
                    try {
                        Mail::to($solRow->solicitante_email)->send(
                            new \App\Mail\LogisticaRechazoMail(
                                $info,
                                $data['motivo'],
                                $data['nueva_fecha_propuesta'] ?? null
                            )
                        );
                    } catch (\Throwable $e) {
                        Log::error('Error enviando correo de rechazo (solicitante)', [
                            'to' => $solRow->solicitante_email,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });
        });

        return redirect()->route('sol.logistica.edit', $id)->with('success', 'Solicitud rechazada por Logística y notificada.');
    }

    // ========================
    // Helpers
    // ========================

    /** id_estado por nombre (case-insensitive) */
    private function estadoId(string $name): ?int
    {
        return DB::connection('newdb')
            ->table('Estado')
            ->whereRaw('LOWER(desc_estado) = ?', [strtolower(trim($name))])
            ->value('id_estado');
    }

    /**
     * Devuelve los usuarios (Encargado/Jefe) que aprobaron la solicitud (aprobado_at != null),
     * tomando la aprobación más reciente por tipo.
     *
     * @return \Illuminate\Support\Collection  de objetos con ->email, ->name, ->nombre_rol, ->tipo_aprobacion, etc.
     */
    private function aprobadoresDeSolicitud(int $idSolicitud)
    {
        $aprobaciones = DB::connection('newdb')->table('Aprobaciones as a')
            ->join('Usuarios as u', 'u.id_us', '=', 'a.aprobado_por')
            ->join('Roles as r', 'r.id_rol', '=', 'u.id_rol')
            ->where('a.id_solicitud', $idSolicitud)
            ->whereIn('a.tipo_aprobacion', ['Encargado', 'Jefe'])
            ->whereNotNull('a.aprobado_at')
            ->orderByDesc('a.aprobado_at')
            ->select([
                'a.tipo_aprobacion',
                'u.id_us',
                'u.name',
                'u.email',
                'r.nombre_rol',
                'a.aprobado_at',
            ])
            ->get();

        // Quedarse con 1 por tipo (la más reciente)
        $porTipo = [];
        foreach ($aprobaciones as $row) {
            $key = strtolower($row->tipo_aprobacion); // 'encargado' / 'jefe'
            if (!isset($porTipo[$key])) {
                $porTipo[$key] = $row;
            }
        }

        return collect($porTipo)->values();
    }
}