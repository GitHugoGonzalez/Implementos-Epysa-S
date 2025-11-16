<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Conexión (asegúrate que 'newdb' apunta a la BD Epysa)
        $conn = DB::connection('newdb');

        // 1) Serie diaria (últimos 30 días)
        $start = Carbon::today()->subDays(29)->toDateString(); // incluye hoy

        $rawDaily = $conn->table('Solicitudes')
            ->select('fecha_sol', DB::raw('COUNT(*) as total'))
            ->where('fecha_sol', '>=', $start)
            ->groupBy('fecha_sol')
            ->orderBy('fecha_sol')
            ->get()
            ->keyBy('fecha_sol');

        // Rellenar días faltantes con 0
        $dailySeries = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $dailySeries[] = [
                'fecha' => $date,
                'total' => (int)($rawDaily[$date]->total ?? 0),
            ];
        }

        // 2) Conteo por estado (JOIN Estado)
        $byEstado = $conn->table('Solicitudes as s')
            ->join('Estado as e', 'e.id_estado', '=', 's.id_estado')
            ->select('e.desc_estado as estado', DB::raw('COUNT(*) as total'))
            ->groupBy('e.desc_estado')
            ->orderBy('total', 'desc')
            ->get();

        // 3) Top 5 insumos por cantidad (JOIN Insumos)
        $topInsumos = $conn->table('Solicitudes as s')
            ->join('Insumos as i', 'i.id_insumo', '=', 's.id_insumo')
            ->select(
                'i.nombre_insumo as insumo_nombre',
                DB::raw('SUM(s.cantidad) as total_cant'),
                DB::raw('COUNT(*) as solicitudes')
            )
            ->groupBy('i.nombre_insumo')
            ->orderByDesc('total_cant')
            ->limit(5)
            ->get();

        // 4) Solicitudes por sucursal (JOIN Sucursal)
        $bySucursal = $conn->table('Solicitudes as s')
            ->join('Sucursal as su', 'su.id_sucursal', '=', 's.id_sucursal')
            ->where('s.fecha_sol', '>=', $start)
            ->select(
                DB::raw("CONCAT(su.ciudad, ' - ', su.direccion) as sucursal_nombre"),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('sucursal_nombre')
            ->orderByDesc('total')
            ->get();

        // 5) Urgentes vs No Urgentes (flag es_urgente en Solicitudes)
        $urgentes = $conn->table('Solicitudes')
            ->selectRaw('
                SUM(CASE WHEN es_urgente = 1 THEN 1 ELSE 0 END) as urgentes,
                SUM(CASE WHEN es_urgente = 0 OR es_urgente IS NULL THEN 1 ELSE 0 END) as no_urgentes
            ')
            ->first();

        // 6) Top de creación de solicitudes (por usuario)
        $topCreadores = $conn->table('Solicitudes as s')
            ->join('Usuarios as u', 'u.id_us', '=', 's.id_us')
            ->join('Roles as r', 'r.id_rol', '=', 'u.id_rol')
            ->join('Sucursal as su', 'su.id_sucursal', '=', 'u.id_sucursal')
            ->select(
                'u.name as usuario_nombre',
                'r.nombre_rol as rol',
                DB::raw("CONCAT(su.ciudad, ' - ', su.direccion) as sucursal_nombre"),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('u.name', 'r.nombre_rol', 'sucursal_nombre')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'charts' => [
                'daily'        => $dailySeries,
                'byEstado'     => $byEstado,
                'topInsumos'   => $topInsumos,
                'bySucursal'   => $bySucursal,
                'urgency'      => [
                    [
                        'tipo'  => 'Urgentes',
                        'total' => (int)($urgentes->urgentes ?? 0),
                    ],
                    [
                        'tipo'  => 'No urgentes',
                        'total' => (int)($urgentes->no_urgentes ?? 0),
                    ],
                ],
                'topCreadores' => $topCreadores,
            ],
        ]);
    }
}
