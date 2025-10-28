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
use Illuminate\Validation\Rule;

class SolicitudController extends Controller
{
    public function create()
    {
        $user = Auth::user();
        if (!$user) abort(401);

        $isBoss = $user->hasRole('jefe');

        $insumos = Insumo::on('newdb')
            ->select('id_insumo','nombre_insumo')
            ->orderBy('nombre_insumo')
            ->get();

        $sucursales = Sucursal::on('newdb')
            ->select('id_sucursal','direccion','ciudad')
            ->orderBy('ciudad')
            ->get();

        $idPendiente = $this->estadoId('pendiente');

        return Inertia::render('Solicitudes/Create', [
            'insumos'          => $insumos,
            'sucursales'       => $sucursales,
            'canMarkUrgent'    => $isBoss,      // Solo jefe puede marcar urgente
            'defaultEstadoId'  => $idPendiente, // estado inicial por defecto
            'authRol'          => $user->rol_nombre,
            'authSucursalId'   => $user->id_sucursal,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) abort(401);

        // Permisos: operario, encargado y jefe pueden crear
        if (! $user->hasRole('operario','encargado','jefe')) {
            abort(403, 'Rol no válido para crear solicitudes');
        }

        $data = $request->validate([
            'id_insumo'   => ['required','integer', Rule::exists('newdb.Insumos','id_insumo')],
            'id_sucursal' => ['required','integer', Rule::exists('newdb.Sucursal','id_sucursal')],
            'cantidad'    => ['required','integer','min:1'],
            'fecha_sol'   => ['nullable','date'],
            'es_urgente'  => ['nullable','boolean'], // solo jefe lo respeta
            // 'observaciones' => ['nullable','string'], // si corresponde
        ]);

        $idPendiente = $this->estadoId('pendiente');

        // Solo jefe puede marcar urgente
        $flagUrgente = ($user->hasRole('jefe') && !empty($data['es_urgente'])) ? 1 : 0;

        Solicitud::on('newdb')->create([
            'id_us'       => $user->id_us,
            'id_sucursal' => $data['id_sucursal'],
            'id_insumo'   => $data['id_insumo'],
            'cantidad'    => $data['cantidad'],
            'fecha_sol'   => $data['fecha_sol'] ?: now()->toDateString(),
            'id_estado'   => $idPendiente,
            'es_urgente'  => $flagUrgente,
            // 'observaciones' => $request->input('observaciones'),
        ]);

        return redirect()->route('solicitudes.create')
            ->with('success','Solicitud creada correctamente.');
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
