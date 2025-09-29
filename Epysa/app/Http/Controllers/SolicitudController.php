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

        // IDs clave para que el front muestre/controle estados
        $idPendiente = Estado::on('newdb')->where('desc_estado', 'Pendiente')->value('id_estado');
        $idUrgente   = Estado::on('newdb')->where('desc_estado', 'Urgente')->value('id_estado');

        return Inertia::render('Solicitudes/Create', [
            'insumos'          => $insumos,
            'sucursales'       => $sucursales,
            'estados'          => $estados,
            'canMarkUrgent'    => $isBoss,      // Solo jefe puede seleccionar "Urgente"
            'defaultEstadoId'  => $idPendiente, // Para setear el valor por defecto en el form
            'urgentEstadoId'   => $idUrgente,   // Para bloquear/habilitar la opción Urgente
        ]);
    }

    public function store(Request $request)
    {
        $user   = Auth::user();
        $isBoss = (strtolower(trim($user->rol ?? '')) === 'jefe');

        $data = $request->validate([
            'id_insumo'   => ['required','integer','min:1'],
            'id_sucursal' => ['required','integer','min:1'],
            'cantidad'    => ['required','integer','min:1'],
            'fecha_sol'   => ['nullable','date'],
            'id_estado'   => ['required','integer','min:1'],
        ]);

        $conn = DB::connection('newdb');

        // Traer registros para desnormalizar nombres
        $ins = $conn->table('Insumos')
            ->select('id_insumo','nombre_insumo')
            ->where('id_insumo', $data['id_insumo'])
            ->first();

        $suc = $conn->table('sucursal')
            ->select('id_sucursal','ciudad','direccion')
            ->where('id_sucursal', $data['id_sucursal'])
            ->first();

        $est = $conn->table('estado')
            ->select('id_estado','desc_estado')
            ->where('id_estado', $data['id_estado'])
            ->first();

        $errors = [];
        if (!$ins) $errors['id_insumo']   = 'El insumo seleccionado no existe.';
        if (!$suc) $errors['id_sucursal'] = 'La sucursal seleccionada no existe.';
        if (!$est) $errors['id_estado']   = 'El estado seleccionado no existe.';
        if (!empty($errors)) return back()->withErrors($errors)->withInput();

        // IDs de estados clave
        $idUrgente   = $conn->table('estado')->where('desc_estado','Urgente')->value('id_estado');
        $idPendiente = $conn->table('estado')->where('desc_estado','Pendiente')->value('id_estado');

        // Si NO es jefe, no puede dejar "Urgente" — forzar a "Pendiente"
        if (!$isBoss && $idUrgente && intval($data['id_estado']) === intval($idUrgente)) {
            if ($idPendiente) {
                $data['id_estado'] = $idPendiente;
            }
        }

        // Nombres desnormalizados (guardados en la tabla)
        $usuarioNombre  = $user->name; // Usuarios.name
        $sucursalNombre = $suc->ciudad.' — '.$suc->direccion;
        $insumoNombre   = $ins->nombre_insumo;

        // Insertar solicitud
        Solicitud::on('newdb')->create([
            'id_us'           => $user->id_us,
            'usuario_nombre'  => $usuarioNombre,
            'id_sucursal'     => (int)$data['id_sucursal'],
            'sucursal_nombre' => $sucursalNombre,
            'id_insumo'       => (int)$data['id_insumo'],
            'insumo_nombre'   => $insumoNombre,
            'cantidad'        => (int)$data['cantidad'],
            'fecha_sol'       => $data['fecha_sol'] ?: now()->toDateString(),
            'id_estado'       => (int)$data['id_estado'],
        ]);

        return redirect('/solicitudes/crear')->with('success', 'Solicitud creada correctamente.');
    }
}
