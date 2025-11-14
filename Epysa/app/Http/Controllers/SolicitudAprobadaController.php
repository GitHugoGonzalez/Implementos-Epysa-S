<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Carbon\Carbon;

class SolicitudAprobadaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        $rol = $user->rol_nombre;

        $idPendiente      = $this->estadoIdOrFail('pendiente');
        $idAprobEncargado = $this->estadoIdOrFail('aprobado encargado');
        $idAprobJefe      = $this->estadoIdOrFail('aprobado jefe');

        $q = trim((string) $request->get('q', ''));

        $query = Solicitud::on('newdb')->with([
            'usuario:id_us,name,email',
            'sucursal:id_sucursal,ciudad,direccion',
            'insumo:id_insumo,nombre_insumo',
            'estado:id_estado,desc_estado',
        ]);

        if ($user->hasRole('encargado')) {
            $query->where('id_estado', $idPendiente);
        } elseif ($user->hasRole('jefe')) {
            $query->where('id_estado', $idAprobEncargado);
        } elseif ($user->hasRole('logistica')) {
            $query->where('id_estado', $idAprobJefe);
        } else {
            $query->whereRaw('1=0');
        }

        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('id_solicitud', 'like', "%{$q}%")
                   ->orWhere('cantidad', 'like', "%{$q}%")
                   ->orWhereHas('usuario', function ($u) use ($q) {
                        $u->where('name','like',"%{$q}%")
                          ->orWhere('email','like',"%{$q}%");
                   })
                   ->orWhereHas('sucursal', function ($s) use ($q) {
                        $s->where('ciudad','like',"%{$q}%")
                          ->orWhere('direccion','like',"%{$q}%");
                   })
                   ->orWhereHas('insumo', function ($i) use ($q) {
                        $i->where('nombre_insumo','like',"%{$q}%");
                   })
                   ->orWhereHas('estado', function ($e) use ($q) {
                        $e->where('desc_estado','like',"%{$q}%");
                   });
            });
        }

        $solicitudes = $query
            ->orderBy('fecha_sol', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Solicitudes/Aprobar', [
            'solicitudes' => $solicitudes,
            'rol'         => $rol,
        ]);
    }

    public function aprobar($id)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        if (! $user->hasRole('encargado','jefe','logistica')) {
            abort(403, 'No autorizado.');
        }

        $rol = $user->rol_nombre;

        DB::connection('newdb')->transaction(function () use ($id, $rol, $user) {
            $idPendiente      = $this->estadoIdOrFail('pendiente');
            $idAprobEncargado = $this->estadoIdOrFail('aprobado encargado');
            $idAprobJefe      = $this->estadoIdOrFail('aprobado jefe');

            $sol = Solicitud::on('newdb')
                ->where('id_solicitud', $id)
                ->lockForUpdate()
                ->with(['usuario:id_us,name,email', 'insumo:id_insumo,nombre_insumo'])
                ->firstOrFail();

            if ($rol === 'encargado') {
                if ((int)$sol->id_estado !== (int)$idPendiente) {
                    abort(422, 'La solicitud no está en estado Pendiente.');
                }
                $sol->id_estado = $idAprobEncargado;
            } elseif ($rol === 'jefe') {
                if ((int)$sol->id_estado !== (int)$idAprobEncargado) {
                    abort(422, 'La solicitud no está en estado Aprobado Encargado.');
                }
                $sol->id_estado = $idAprobJefe;
            } elseif ($rol === 'logistica') {
                if ((int)$sol->id_estado !== (int)$idAprobJefe) {
                    abort(422, 'La solicitud no está en estado Aprobado Jefe.');
                }
            } else {
                abort(403, 'No autorizado.');
            }

            $sol->save();

            $sol->audit(
                'APROBAR_SOLICITUD_' . strtoupper($rol),
                 $sol->getOriginal(),
                $sol->getChanges()
            );

            $sol->audit(
                'RECHAZAR_SOLICITUD_' . strtoupper($rol),
                $sol->getOriginal(),
                $sol->getChanges()
            );



            DB::connection('newdb')->table('Aprobaciones')->insert([
                'id_solicitud'    => $sol->id_solicitud,
                'tipo_aprobacion' => ucfirst($rol),
                'aprobado_por'    => $user->id_us,
                'aprobado_at'     => now(),
                'rechazo_motivo'  => null,
            ]);

            // Enviar correo al operario luego del commit
            DB::afterCommit(function () use ($sol, $rol, $user) {
                try {
                    Mail::to($sol->usuario->email)->send(
                        new \App\Mail\SolicitudAprobadaMail($sol, $rol, $user)
                    );
                } catch (\Throwable $e) {
                    \Log::error('Error enviando correo de aprobación', [
                        'to' => $sol->usuario->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            });
        });

        return back()->with('success', 'Solicitud aprobada y notificada al operario.');
    }

    public function rechazar(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        if (! $user->hasRole('encargado','jefe','logistica')) {
            abort(403, 'No autorizado.');
        }

        $rol    = $user->rol_nombre;
        $motivo = trim((string) $request->get('motivo', ''));

        DB::connection('newdb')->transaction(function () use ($id, $rol, $user, $motivo) {
            $sol = Solicitud::on('newdb')
                ->where('id_solicitud', $id)
                ->lockForUpdate()
                ->with(['usuario:id_us,name,email', 'insumo:id_insumo,nombre_insumo'])
                ->firstOrFail();

            if ($rol === 'encargado') {
                $idRechazo = $this->estadoIdOrFail('rechazado encargado');
            } elseif ($rol === 'jefe') {
                $idRechazo = $this->estadoIdOrFail('rechazado jefe');
            } else {
                $idRechazo = $this->estadoIdOrFail('rechazado logística');
            }

            $sol->id_estado = $idRechazo;
            if ($motivo !== '') {
                $sol->observaciones = $motivo;
            }
            $sol->save();

            DB::connection('newdb')->table('Aprobaciones')->insert([
                'id_solicitud'    => $sol->id_solicitud,
                'tipo_aprobacion' => ucfirst($rol),
                'aprobado_por'    => $user->id_us,
                'aprobado_at'     => null,
                'rechazo_motivo'  => $motivo !== '' ? $motivo : 'Rechazado sin motivo',
            ]);

            // Enviar correo al operario luego del commit
            DB::afterCommit(function () use ($sol, $rol, $user, $motivo) {
                try {
                    Mail::to($sol->usuario->email)->send(
                        new \App\Mail\SolicitudRechazadaMail($sol, $rol, $user, $motivo)
                    );
                } catch (\Throwable $e) {
                    \Log::error('Error enviando correo de rechazo', [
                        'to' => $sol->usuario->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            });
        });

        return back()->with('success', 'Solicitud rechazada y notificada al operario.');
    }

    // ========================
    // Helpers
    // ========================

    private function estadoIdOrFail(string $name): int
    {
        $id = Estado::on('newdb')
            ->whereRaw('LOWER(desc_estado) = ?', [strtolower(trim($name))])
            ->value('id_estado');

        if (!$id) {
            abort(422, 'Estado no encontrado: '.$name);
        }
        return (int)$id;
    }
}
