<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Sucursal;
use App\Models\Rol;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasRole('jefe')) {
            abort(403, 'No tienes permiso para acceder a la auditoría.');
        }

        // ===== Filtros =====
        $q          = trim((string) $request->get('q', ''));
        $accion     = $request->get('accion') ?: null;
        $usuario_id = $request->get('usuario_id') ?: null;
        $desde      = $request->get('desde') ?: null;
        $hasta      = $request->get('hasta') ?: null;

        // ===== Query auditoría =====
        $logs = AuditLog::on('newdb')
            ->select('Auditoria.*', 'Usuarios.name as usuario_nombre')
            ->leftJoin('Usuarios', 'Usuarios.id_us', '=', 'Auditoria.usuario_id')

            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('accion', 'like', "%{$q}%")
                        ->orWhere('valores_antes', 'like', "%{$q}%")
                        ->orWhere('valores_despues', 'like', "%{$q}%")
                        ->orWhere('Usuarios.name', 'like', "%{$q}%");
                });
            })

            ->when($accion, fn($q2) => $q2->where('accion', $accion))
            ->when($usuario_id, fn($q2) => $q2->where('usuario_id', $usuario_id))
            ->when($desde, fn($q2) => $q2->whereDate('created_at', '>=', $desde))
            ->when($hasta, fn($q2) => $q2->whereDate('created_at', '<=', $hasta))
            ->orderBy('id_audit', 'desc')
            ->paginate(15)
            ->withQueryString();

        // ===== Catálogos =====
        $rolesCatalogo = Rol::on('newdb')
            ->select('id_rol as id', 'nombre_rol as nombre')
            ->orderBy('nombre_rol')
            ->get();

        $usuariosCatalogo = User::on('newdb')
            ->select('id_us as id', 'name')
            ->orderBy('name')
            ->get();

        $sucursalesCatalogo = Sucursal::on('newdb')
            ->select(
                DB::raw('id_sucursal as id'),
                DB::raw("CONCAT(ciudad,' - ',direccion) as nombre")
            )
            ->orderBy('ciudad')
            ->get();

        $estadosCatalogo = DB::connection('newdb')
            ->table('Estado')
            ->select('id_estado as id', 'desc_estado as nombre')
            ->get();

        $insumosCatalogo = DB::connection('newdb')
            ->table('Insumos')
            ->select('id_insumo as id', 'nombre_insumo as nombre')
            ->get();

        return Inertia::render('Auditoria/Index', [
            'logs' => $logs,
            'filtros' => [
                'q'          => $q,
                'accion'     => $accion,
                'usuario_id' => $usuario_id,
                'desde'      => $desde,
                'hasta'      => $hasta,
            ],

            'sucursales' => $sucursalesCatalogo,

            'rolesCatalogo'      => $rolesCatalogo,
            'usuariosCatalogo'   => $usuariosCatalogo,
            'sucursalesCatalogo' => $sucursalesCatalogo,
            'estadosCatalogo'    => $estadosCatalogo,
            'insumosCatalogo'    => $insumosCatalogo,
        ]);
    }

    // ================== ENDPOINTS AJAX ==================

    public function opcionesRoles(Request $request)
    {
        $sucursalId = $request->query('sucursal_id');

        if (!$sucursalId) {
            return response()->json([]);
        }

        return Rol::on('newdb')
            ->join('Usuarios', 'Usuarios.id_rol', '=', 'Roles.id_rol')
            ->where('Usuarios.id_sucursal', $sucursalId)
            ->select('Roles.id_rol as id', 'Roles.nombre_rol as nombre')
            ->distinct()
            ->orderBy('Roles.nombre_rol')
            ->get();
    }

    public function opcionesUsuarios(Request $request)
    {
        $sucursalId = $request->query('sucursal_id');
        $rolId      = $request->query('rol_id');

        if (!$sucursalId || !$rolId) {
            return response()->json([]);
        }

        return User::on('newdb')
            ->where('id_sucursal', $sucursalId)
            ->where('id_rol', $rolId)
            ->select('id_us as id', 'name')
            ->orderBy('name')
            ->get();
    }

    public function opcionesAcciones(Request $request)
    {
        $usuarioId = $request->query('usuario_id');

        if (!$usuarioId) {
            return response()->json([]);
        }

        return AuditLog::on('newdb')
            ->where('usuario_id', $usuarioId)
            ->select('accion')
            ->distinct()
            ->orderBy('accion')
            ->pluck('accion');
    }
}
