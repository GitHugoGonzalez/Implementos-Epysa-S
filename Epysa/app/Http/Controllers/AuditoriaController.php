<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
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

        // Distintas acciones
        $acciones = AuditLog::select('accion')
            ->distinct()
            ->orderBy('accion')
            ->pluck('accion');

        // Usuarios posibles
        $usuarios = User::select('id_us as id', 'name')
            ->orderBy('name')
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
            'acciones' => $acciones,
            'usuarios' => $usuarios,
        ]);
    }
}
