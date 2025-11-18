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
        // Protección Jefe
        if (!auth()->user()->hasRole('jefe')) {
            abort(403, 'No tienes permiso para acceder a la auditoría.');
        }

        // ======== Filtros recibidos del frontend ========
        $q          = trim((string) $request->get('q', ''));
        $accion     = $request->get('accion') ?: null;
        $usuario_id = $request->get('usuario_id') ?: null;
        $desde      = $request->get('desde') ?: null;
        $hasta      = $request->get('hasta') ?: null;

        // ======== Query base ========
        $logs = AuditLog::on('newdb')
            ->select('Auditoria.*', 'Usuarios.name as usuario_nombre')
            ->leftJoin('Usuarios', 'Usuarios.id_us', '=', 'Auditoria.usuario_id')

            // Filtro general q (texto)
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('accion', 'like', "%{$q}%")
                        ->orWhere('valores_antes', 'like', "%{$q}%")
                        ->orWhere('valores_despues', 'like', "%{$q}%")
                        ->orWhereHas('usuario', function ($u) use ($q) {
                            $u->where('name', 'like', "%{$q}%");
                        });
                });
            })

            // Acción específica
            ->when($accion, fn($q2) => $q2->where('accion', $accion))

            // Usuario
            ->when($usuario_id, fn($q2) => $q2->where('usuario_id', $usuario_id))

            // Fecha desde
            ->when($desde, fn($q2) => $q2->whereDate('created_at', '>=', $desde))

            // Fecha hasta
            ->when($hasta, fn($q2) => $q2->whereDate('created_at', '<=', $hasta))

            ->orderBy('id_audit', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Sucursales para el primer filtro (cargadas una sola vez)
        $sucursales = Sucursal::on('newdb')
            ->select(
                DB::raw('id_sucursal as id'),
                DB::raw("CONCAT(ciudad, ' - ', direccion) as nombre")
            )
            ->orderBy('ciudad')
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
            // Solo necesitamos sucursales aquí, lo demás se obtiene vía AJAX
            'sucursales' => $sucursales,
        ]);
    }

    // ================== ENDPOINTS AJAX ==================

    // 1) Roles disponibles en una sucursal (solo los que tengan usuarios ahí)
    public function opcionesRoles(Request $request)
    {
        $sucursalId = $request->query('sucursal_id');

        if (!$sucursalId) {
            return response()->json([]);
        }

        $roles = Rol::on('newdb')
            ->join('Usuarios', 'Usuarios.id_rol', '=', 'Roles.id_rol')
            ->where('Usuarios.id_sucursal', $sucursalId)
            ->select('Roles.id_rol as id', 'Roles.nombre_rol as nombre')
            ->distinct()
            ->orderBy('Roles.nombre_rol')
            ->get();

        return response()->json($roles);
    }

    // 2) Usuarios según sucursal + rol
    public function opcionesUsuarios(Request $request)
    {
        $sucursalId = $request->query('sucursal_id');
        $rolId      = $request->query('rol_id');

        if (!$sucursalId || !$rolId) {
            return response()->json([]);
        }

        $usuarios = User::on('newdb')
            ->where('id_sucursal', $sucursalId)
            ->where('id_rol', $rolId)
            ->select('id_us as id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($usuarios);
    }

    // 3) Acciones distintas realizadas por un usuario
    public function opcionesAcciones(Request $request)
    {
        $usuarioId = $request->query('usuario_id');

        if (!$usuarioId) {
            return response()->json([]);
        }

        $acciones = AuditLog::on('newdb')
            ->where('usuario_id', $usuarioId)
            ->select('accion')
            ->distinct()
            ->orderBy('accion')
            ->pluck('accion');

        return response()->json($acciones);
    }
}
