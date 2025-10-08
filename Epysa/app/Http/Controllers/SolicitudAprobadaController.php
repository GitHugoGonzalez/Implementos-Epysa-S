<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Estado;
use App\Models\Aprobaciones;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SolicitudAprobadaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        // normaliza el rol desde distintos posibles campos/relaciones
        $rol = strtolower(
            $user->rol_nombre
            ?? ($user->rol->nombre_rol ?? '')
            ?? ($user->role->name ?? '')
            ?? ($user->rol ?? '')
        );

        // Estados según flujo
        $idPendiente      = Estado::on('newdb')->where('desc_estado', 'Pendiente')->value('id_estado');
        $idAprobEncargado = Estado::on('newdb')->where('desc_estado', 'Aprobada Encargado')->value('id_estado');
        $idAprobJefe      = Estado::on('newdb')->where('desc_estado', 'Aprobada Jefe')->value('id_estado');

        $q = trim((string) $request->get('q', ''));

        $query = Solicitud::on('newdb')
            ->with([
                'usuario:id_us,name,email',
                'sucursal:id_sucursal,ciudad,direccion',
                'insumo:id_insumo,nombre_insumo',
                'estado:id_estado,desc_estado',
            ]);

        // qué ve cada rol
        if ($rol === 'encargado') {
            $query->where('id_estado', $idPendiente);
        } elseif ($rol === 'jefe') {
            $query->where('id_estado', $idAprobEncargado);
        } elseif ($rol === 'logistica') {
            $query->where('id_estado', $idAprobJefe);
        } else {
            $query->whereRaw('1=0');
        }

        // búsqueda
        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('id_solicitud', 'like', "%{$q}%")
                   ->orWhere('cantidad', 'like', "%{$q}%")
                   ->orWhereHas('usuario', fn($u) => $u->where('name','like',"%{$q}%")->orWhere('email','like',"%{$q}%"))
                   ->orWhereHas('sucursal', fn($s) => $s->where('ciudad','like',"%{$q}%")->orWhere('direccion','like',"%{$q}%"))
                   ->orWhereHas('insumo', fn($i) => $i->where('nombre_insumo','like',"%{$q}%"))
                   ->orWhereHas('estado', fn($e) => $e->where('desc_estado','like',"%{$q}%"));
            });
        }

        $solicitudes = $query
            ->orderBy('fecha_sol', 'desc')
            ->paginate(15)
            ->withQueryString();

        // 👇 AQUI el cambio clave: renderiza tu componente real
        return Inertia::render('Aprobar', [
            'solicitudes' => $solicitudes,
            'rol'         => $rol,
        ]);
    }

    public function aprobar($id)
    {
        $user = Auth::user();
        $rol  = strtolower(
            $user->rol_nombre
            ?? ($user->rol->nombre_rol ?? '')
            ?? ($user->role->name ?? '')
            ?? ($user->rol ?? '')
        );

        $sol = Solicitud::on('newdb')->lockForUpdate()->findOrFail($id);

        DB::connection('newdb')->transaction(function () use ($sol, $rol, $user) {
            $idAprobEncargado = Estado::on('newdb')->where('desc_estado','Aprobada Encargado')->value('id_estado');
            $idAprobJefe      = Estado::on('newdb')->where('desc_estado','Aprobada Jefe')->value('id_estado');

            if ($rol === 'encargado') {
                $sol->id_estado = $idAprobEncargado;
            } elseif ($rol === 'jefe') {
                $sol->id_estado = $idAprobJefe;
            } elseif ($rol === 'logistica') {
                // aquí podrías transicionar a logística/“en tránsito”
            } else {
                abort(403, 'No autorizado.');
            }

            $sol->save();

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
        $rol  = strtolower(
            $user->rol_nombre
            ?? ($user->rol->nombre_rol ?? '')
            ?? ($user->role->name ?? '')
            ?? ($user->rol ?? '')
        );
        $motivo = trim((string) $request->get('motivo', ''));

        $sol = Solicitud::on('newdb')->lockForUpdate()->findOrFail($id);

        DB::connection('newdb')->transaction(function () use ($sol, $rol, $user, $motivo) {
            $idRechazada = Estado::on('newdb')->where('desc_estado','Rechazada')->value('id_estado');

            if (!in_array($rol, ['encargado','jefe','logistica'])) {
                abort(403, 'No autorizado.');
            }

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
}
