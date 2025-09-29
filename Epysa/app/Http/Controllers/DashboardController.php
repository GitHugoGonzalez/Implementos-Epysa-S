<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $conn = DB::connection('newdb');

        // 1) Conteo por día (últimos 30 días)
        $start = Carbon::today()->subDays(29)->toDateString(); // incluye hoy
        $rawDaily = $conn->table('solicitudes')
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

        // 2) Conteo por estado
        $byEstado = $conn->table('solicitudes as s')
            ->join('estado as e', 'e.id_estado', '=', 's.id_estado')
            ->select('e.desc_estado as estado', DB::raw('COUNT(*) as total'))
            ->groupBy('e.desc_estado')
            ->orderBy('total', 'desc')
            ->get();

        // 3) Top 5 insumos (por cantidad solicitada)
        $topInsumos = $conn->table('solicitudes')
            ->select('insumo_nombre', DB::raw('SUM(cantidad) as total_cant'), DB::raw('COUNT(*) as solicitudes'))
            ->groupBy('insumo_nombre')
            ->orderByDesc('total_cant')
            ->limit(5)
            ->get();

        // 4) Solicitudes por sucursal (últimos 30 días)
        $bySucursal = $conn->table('solicitudes')
            ->select('sucursal_nombre', DB::raw('COUNT(*) as total'))
            ->where('fecha_sol', '>=', $start)
            ->groupBy('sucursal_nombre')
            ->orderByDesc('total')
            ->get();

        // 5) Urgentes vs No Urgentes
        $idUrgente = $conn->table('estado')->where('desc_estado', 'Urgente')->value('id_estado');
        $urgentes = $conn->table('solicitudes')
            ->select(DB::raw('SUM(CASE WHEN id_estado = '.$conn->getPdo()->quote($idUrgente).' THEN 1 ELSE 0 END) as urgentes'),
                     DB::raw('SUM(CASE WHEN id_estado != '.$conn->getPdo()->quote($idUrgente).' THEN 1 ELSE 0 END) as no_urgentes'))
            ->first();

        return Inertia::render('Dashboard', [
            'charts' => [
                'daily'       => $dailySeries,
                'byEstado'    => $byEstado,
                'topInsumos'  => $topInsumos,
                'bySucursal'  => $bySucursal,
                'urgency'     => [
                    ['tipo' => 'Urgentes',    'total' => (int)($urgentes->urgentes ?? 0)],
                    ['tipo' => 'No urgentes', 'total' => (int)($urgentes->no_urgentes ?? 0)],
                ],
            ],
        ]);
    }
}
