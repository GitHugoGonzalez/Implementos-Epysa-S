<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SolicitudAprobadaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        // Rol normalizado (del accessor en User)
        $rol = $user->rol_nombre; // 'encargado' | 'jefe' | 'logistica' | ...

        // Estados relevantes (case-insensitive)
        $idPendiente       = $this->estadoId('pendiente');
        $idAprobEncargado  = $this->estadoId('aprobada encargado');
        $idAprobJefe       = $this->estadoId('aprobada jefe');

        $q = trim((string) $request->get('q', ''));

        // Eager loading de relaciones definidas en el modelo Solicitud
        $query = Solicitud::on('newdb')->with([
            'usuario:id_us,name,email',
            'sucursal:id_sucursal,ciudad,direccion',
            'insumo:id_insumo,nombre_insumo',
            'estado:id_estado,desc_estado',
        ]);

        // Bandeja según rol
        if ($user->hasRole('encargado')) {
            // Encargado revisa PENDIENTE (las hechas por Operario)
            $query->where('id_estado', $idPendiente);
        } elseif ($user->hasRole('jefe')) {
            // Jefe revisa APROBADA ENCARGADO (operario→encargado→jefe) y también las creadas por Encargado (que saltan a esta etapa)
            $query->where('id_estado', $idAprobEncargado);
        } elseif ($user->hasRole('logistica')) {
            // Logística revisa APROBADA JEFE (operario/encargado→jefe→logística y las creadas por Jefe que saltan aquí)
            $query->where('id_estado', $idAprobJefe);
        } else {
            // Otros roles no ven nada
            $query->whereRaw('1=0');
        }

        // Búsqueda
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
            // Estados de transición
            $idPendiente       = $this->estadoId('pendiente');
            $idAprobEncargado  = $this->estadoId('aprobada encargado');
            $idAprobJefe       = $this->estadoId('aprobada jefe');

            // Bloquear fila
            $sol = Solicitud::on('newdb')
                ->where('id_solicitud', $id)
                ->lockForUpdate()
                ->firstOrFail();

            // Transición según rol y estado actual
            if ($rol === 'encargado') {
                // Encargado aprueba solo si está en Pendiente
                if ((int)$sol->id_estado !== (int)$idPendiente) {
                    abort(422, 'La solicitud no está en estado Pendiente.');
                }
                $sol->id_estado = $idAprobEncargado;

            } elseif ($rol === 'jefe') {
                // Jefe aprueba solo si viene de Aprobada Encargado
                if ((int)$sol->id_estado !== (int)$idAprobEncargado) {
                    abort(422, 'La solicitud no está en estado Aprobada por Encargado.');
                }
                $sol->id_estado = $idAprobJefe;

            } elseif ($rol === 'logistica') {
                // Logística aprueba solo si viene de Aprobada Jefe
                if ((int)$sol->id_estado !== (int)$idAprobJefe) {
                    abort(422, 'La solicitud no está en estado Aprobada por Jefe.');
                }
                // Aquí podrías iniciar el registro en tabla Logistica si quieres.
                // DB::connection('newdb')->table('Logistica')->insert([
                //     'id_solicitud'     => $sol->id_solicitud,
                //     'estado_logistica' => 'pendiente',
                // ]);
                // O mantener solo el registro de aprobación y dejar que Logística la gestione en su módulo.
            } else {
                abort(403, 'No autorizado.');
            }

            $sol->save();

            // Bitácora en Aprobaciones
            DB::connection('newdb')->table('Aprobaciones')->insert([
                'id_solicitud'    => $sol->id_solicitud,
                'tipo_aprobacion' => $rol === 'encargado' ? 'Encargado' : ($rol === 'jefe' ? 'Jefe' : 'Supervisor'),
                'aprobado_por'    => $user->id_us,
                'aprobado_at'     => now(),
                'rechazo_motivo'  => null,
            ]);
        });

        return back()->with('success', 'Solicitud aprobada.');
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
                ->firstOrFail();

            $idRechazada = $this->estadoId('rechazada');

            $sol->id_estado = $idRechazada;
            if ($motivo !== '') {
                $sol->observaciones = $motivo;
            }
            $sol->save();

            DB::connection('newdb')->table('Aprobaciones')->insert([
                'id_solicitud'    => $sol->id_solicitud,
                'tipo_aprobacion' => $rol === 'encargado' ? 'Encargado' : ($rol === 'jefe' ? 'Jefe' : 'Supervisor'),
                'aprobado_por'    => $user->id_us,
                'aprobado_at'     => null,
                'rechazo_motivo'  => $motivo ?: 'Rechazado sin motivo',
            ]);
        });

        return back()->with('success', 'Solicitud rechazada.');
    }

    // ========================
    // Helpers
    // ========================

    /** Devuelve el id_estado por nombre (case-insensitive). */
    private function estadoId(string $name): ?int
    {
        return Estado::on('newdb')
            ->whereRaw('LOWER(desc_estado) = ?', [strtolower(trim($name))])
            ->value('id_estado');
    }
}
