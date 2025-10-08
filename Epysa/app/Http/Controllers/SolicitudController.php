<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use App\Models\Insumo;
use App\Models\Sucursal;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SolicitudController extends Controller
{
    public function create()
    {
        $user = Auth::user();
        $rolNombre = strtolower(trim(optional($user->rol)->nombre_rol ?? '')); // ← relación Roles
        $isBoss = ($rolNombre === 'jefe');

        $insumos = Insumo::on('newdb')
            ->select('id_insumo','nombre_insumo')
            ->orderBy('nombre_insumo')
            ->get();

        $sucursales = Sucursal::on('newdb')
            ->select('id_sucursal','direccion','ciudad')
            ->orderBy('ciudad')
            ->get();

        // ID de 'pendiente' (coincide con tus inserts)
        $idPendiente = Estado::on('newdb')
            ->whereRaw('LOWER(desc_estado) = ?', ['pendiente'])
            ->value('id_estado');

        return Inertia::render('Solicitudes/Create', [
            'insumos'          => $insumos,
            'sucursales'       => $sucursales,
            'canMarkUrgent'    => $isBoss,      // Solo jefe puede marcar urgente
            'defaultEstadoId'  => $idPendiente, // estado inicial por defecto
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $rolNombre = strtolower(trim(optional($user->rol)->nombre_rol ?? '')); // ← relación Roles

        // Permisos: operario, encargado y jefe pueden crear
        if (!in_array($rolNombre, ['operario','encargado','jefe'], true)) {
            abort(403, 'Rol no válido para crear solicitudes');
        }

        $data = $request->validate([
            'id_insumo'   => ['required','integer','exists:newdb.Insumos,id_insumo'],
            'id_sucursal' => ['required','integer','exists:newdb.Sucursal,id_sucursal'],
            'cantidad'    => ['required','integer','min:1'],
            'fecha_sol'   => ['nullable','date'],
            'es_urgente'  => ['nullable','boolean'], // checkbox en el form (solo jefe lo respeta)
        ]);

        // Estado inicial siempre 'pendiente' (según tu tabla Estado)
        $idPendiente = DB::connection('newdb')->table('Estado')
            ->whereRaw('LOWER(desc_estado) = ?', ['pendiente'])
            ->value('id_estado');

        // Solo jefe puede marcar urgente
        $flagUrgente = ($rolNombre === 'jefe' && !empty($data['es_urgente'])) ? 1 : 0;

        // Crear solicitud (solo columnas reales del esquema)
        Solicitud::on('newdb')->create([
            'id_us'       => $user->id_us,
            'id_sucursal' => $data['id_sucursal'],
            'id_insumo'   => $data['id_insumo'],
            'cantidad'    => $data['cantidad'],
            'fecha_sol'   => $data['fecha_sol'] ?: now()->toDateString(),
            'id_estado'   => $idPendiente,
            'es_urgente'  => $flagUrgente,
            // 'observaciones' => $request->input('observaciones'), // si tu form la envía
        ]);

        return redirect()->route('solicitudes.create')
            ->with('success','Solicitud creada correctamente.');
    }
}
