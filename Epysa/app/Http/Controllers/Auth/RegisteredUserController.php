<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rol;       // <-- crea este modelo simple (abajo dejo snippet)
use App\Models\Sucursal;  // <-- ya lo tienes
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        // (Opcional) enviar catálogos al form de registro
        $roles = Rol::query()->select('id_rol','nombre_rol')->orderBy('nombre_rol')->get();
        $sucursales = Sucursal::query()
            ->select('id_sucursal','ciudad','direccion')
            ->orderBy('ciudad')->get();

        return Inertia::render('Auth/Register', [
            'roles' => $roles,
            'sucursales' => $sucursales,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Validamos email único en tabla "Usuarios" (misma conexión del modelo)
        // Permitimos dos variantes:
        //  - Enviar id_rol (int) y id_sucursal (int), o
        //  - Enviar rol (string) y lo mapeamos a id_rol
        $request->validate([
            'name'     => ['required','string','max:150'],
            'email'    => ['required','string','lowercase','email','max:150', Rule::unique('Usuarios','email')],
            'password' => ['required','confirmed', Rules\Password::defaults()],

            // Opción A: el front ya manda los IDs
            'id_rol'      => ['nullable','integer','exists:Roles,id_rol'],
            'id_sucursal' => ['nullable','integer','exists:Sucursal,id_sucursal'],

            // Opción B: el front manda un nombre de rol (operario/encargado/jefe/admin/logistica)
            'rol' => ['nullable','string','max:100'],
        ]);

        // Resolver id_rol
        $idRol = $request->integer('id_rol') ?: null;

        if (!$idRol && $request->filled('rol')) {
            // Mapear desde nombre_rol
            $idRol = Rol::where('nombre_rol', $request->rol)->value('id_rol');
            if (!$idRol) {
                // Si no existe el rol que vino como texto, error de validación
                return back()->withErrors([
                    'rol' => 'El rol especificado no existe en la tabla Roles.',
                ])->withInput();
            }
        }

        // Validar id_sucursal (obligatorio en el nuevo esquema)
        $idSucursal = $request->integer('id_sucursal') ?: null;
        if (!$idSucursal) {
            return back()->withErrors([
                'id_sucursal' => 'Debes seleccionar una sucursal.',
            ])->withInput();
        }

        // Crear usuario con los campos requeridos por el nuevo esquema
        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'id_rol'       => $idRol,
            'id_sucursal'  => $idSucursal,
            // 'estado_usuario' => 'activo', // tiene default, no es necesario
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
