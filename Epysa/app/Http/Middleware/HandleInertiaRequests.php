<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => function () use ($request) {
                $u = $request->user();

                if (!$u) {
                    return ['user' => null];
                }

                // Carga perezosa de relaciones (rol estándar + fallback)
                $u->loadMissing(['rol', 'rolRef']);

                // Resolver fila de rol con prioridad a la relación 'rol'
                $rolRow = $u->relationLoaded('rol') && $u->rol ? $u->rol : $u->rolRef;

                // Nombre de rol consistente (minúsculas)
                $rolNombre = strtolower(trim(
                    $rolRow->nombre_rol
                    ?? ($u->rol ?? '')            // compat: si antes guardabas string en users.rol
                ));

                return [
                    'user' => [
                        'id'         => $u->id_us ?? $u->id ?? null,
                        'name'       => $u->name,
                        'email'      => $u->email,
                        'id_rol'     => $rolRow->id_rol ?? ($u->id_rol ?? null),
                        'rol_nombre' => $rolNombre ?: null,
                    ],

                    // Flags útiles directo al front (evita repetir lógica en cada página)
                    'authRol'   => $u->rol_nombre,                       // p.ej. 'jefe'
                    'can'       => [
                        'verUsuarios'    => $u->hasRole('jefe','logistica'),
                        'crearUsuarios'  => $u->hasRole('jefe'),
                        'aprobar'        => $u->hasRole('encargado','jefe'),
                        'verLogistica'   => $u->hasRole('logistica','jefe'),
                    ],
                ];
            },
        ]);
    }
}
