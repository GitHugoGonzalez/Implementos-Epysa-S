<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        //SOLO JEFES
        if (!auth()->user()->hasRole('jefe')) {
            abort(403, 'No tienes permiso para acceder a la auditoría.');
        }

        $q          = $request->input('q');
        $accion     = $request->input('accion');
        $usuario_id = $request->input('usuario_id');
        $desde      = $request->input('desde');
        $hasta      = $request->input('hasta');

        $logs = AuditLog::query()
            ->select('Auditoria.*', 'Usuarios.name as usuario_nombre')
            ->leftJoin('Usuarios', 'Usuarios.id_us', '=', 'Auditoria.usuario_id')
            ->when($q, fn($query) =>
                $query->where(function($q2) use ($q) {
                    $q2->where('accion', 'LIKE', "%$q%")
                       ->orWhere('valores_antes', 'LIKE', "%$q%")
                       ->orWhere('valores_despues', 'LIKE', "%$q%");
                })
            )
            ->when($accion, fn($q, $accion) =>
                $q->where('accion', $accion)
            )
            ->when($usuario_id, fn($q, $usuario_id) =>
                $q->where('usuario_id', $usuario_id)
            )
            ->when($desde, fn($q, $desde) =>
                $q->whereDate('created_at', '>=', $desde)
            )
            ->when($hasta, fn($q, $hasta) =>
                $q->whereDate('created_at', '<=', $hasta)
            )
            ->orderBy('id_audit', 'DESC')
            ->paginate(12)
            ->withQueryString();

        // Acciones disponibles para el select
        $acciones = AuditLog::select('accion')
            ->distinct()
            ->orderBy('accion')
            ->pluck('accion');

        // Usuarios para filtro
        $usuarios = User::select('id_us as id', 'name')->orderBy('name')->get();

        return Inertia::render('Auditoria/Index', [
            'logs'     => $logs,
            'filtros'  => [
                'q'          => $q,
                'accion'     => $accion,
                'usuario_id' => $usuario_id,
                'desde'      => $desde,
                'hasta'      => $hasta,
            ],
            'acciones' => $acciones,
            'usuarios' => $usuarios,
        ]);
    }
}
