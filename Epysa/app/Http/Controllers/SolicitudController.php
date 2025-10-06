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
        $user   = Auth::user();
        $isBoss = (strtolower(trim($user->rol ?? '')) === 'jefe');

        $insumos = Insumo::on('newdb')
            ->select('id_insumo','nombre_insumo')
            ->orderBy('nombre_insumo')
            ->get();

        $sucursales = Sucursal::on('newdb')
            ->select('id_sucursal','direccion','ciudad')
            ->orderBy('ciudad')
            ->get();

        $estados = Estado::on('newdb')
            ->select('id_estado','desc_estado')
            ->orderBy('id_estado')
            ->get();

        // IDs base
        $idPendiente = Estado::on('newdb')->where('desc_estado', 'Pendiente')->value('id_estado');

        return Inertia::render('Solicitudes/Create', [
            'insumos'          => $insumos,
            'sucursales'       => $sucursales,
            'estados'          => $estados,
            'canMarkUrgent'    => $isBoss,      // Solo jefe puede marcar urgente
            'defaultEstadoId'  => $idPendiente, // estado inicial por defecto
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $rol = strtolower($user->rol ?? '');

        $data = $request->validate([
            'id_insumo'   => ['required','integer','min:1'],
            'id_sucursal' => ['required','integer','min:1'],
            'cantidad'    => ['required','integer','min:1'],
            'fecha_sol'   => ['nullable','date'],
            'es_urgente'  => ['nullable','boolean'], // checkbox en el form
        ]);

        $conn = DB::connection('newdb');

        // Estados
        $idPendiente        = $conn->table('estado')->where('desc_estado','Pendiente')->value('id_estado');
        $idAprobEncargado   = $conn->table('estado')->where('desc_estado','Aprobada Encargado')->value('id_estado');
        $idAprobJefe        = $conn->table('estado')->where('desc_estado','Aprobada Jefe')->value('id_estado');

        // Estado inicial según rol
        if ($rol === 'operario') {
            $estadoInicial = $idPendiente;
        } elseif ($rol === 'encargado') {
            $estadoInicial = $idAprobEncargado;
        } elseif ($rol === 'jefe') {
            $estadoInicial = $idAprobJefe;
        } else {
            abort(403, 'Rol no válido para crear solicitudes');
        }

        // Solo jefe puede marcar urgente
        $flagUrgente = ($rol === 'jefe' && !empty($data['es_urgente'])) ? 1 : 0;

        // Guardar
        Solicitud::on('newdb')->create([
            'id_us'           => $user->id_us,
            'usuario_nombre'  => $user->name,
            'id_sucursal'     => $data['id_sucursal'],
            'sucursal_nombre' => $conn->table('sucursal')
                ->where('id_sucursal', $data['id_sucursal'])
                ->value(DB::raw("CONCAT(ciudad,' — ',direccion)")),
            'id_insumo'       => $data['id_insumo'],
            'insumo_nombre'   => $conn->table('Insumos')
                ->where('id_insumo', $data['id_insumo'])
                ->value('nombre_insumo'),
            'cantidad'        => $data['cantidad'],
            'fecha_sol'       => $data['fecha_sol'] ?: now()->toDateString(),
            'id_estado'       => $estadoInicial,
            'es_urgente'      => $flagUrgente,   // 👈 flag siempre presente
        ]);

        return redirect()->route('solicitudes.create')->with('success','Solicitud creada correctamente.');
    }
}
