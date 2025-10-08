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
                if (!$u) return ['user' => null];

                // Asegura que venga la relación
                $u->loadMissing('rolRef');

                $rolRow    = optional($u->rolRef);
                $rolNombre = $rolRow->nombre_rol
                    ?? (is_string($u->rol ?? null) ? $u->rol : null); // compatibilidad si guardabas string

                return [
                    'user' => [
                        'id'         => $u->id_us ?? $u->id ?? null,
                        'name'       => $u->name,
                        'email'      => $u->email,
                        'id_rol'     => $rolRow->id_rol ?? ($u->id_rol ?? null),
                        'rol_nombre' => $rolNombre, // <- scalar, listo para usar en el front
                    ],
                ];
            },
        ]);
    }
}
