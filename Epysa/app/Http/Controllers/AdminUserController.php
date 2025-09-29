<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    // ✅ Requiere login (agrega ->middleware('auth') en rutas) y valida rol aquí
    public function create(Request $request)
    {
        $user = $request->user();
        if (!$user || strtolower($user->rol) !== 'jefe') {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $sucursales = Sucursal::on('newdb')
            ->select('id_sucursal', 'ciudad', 'direccion')
            ->orderBy('ciudad')
            ->get();

        // Solo estos roles puede crear el jefe
        $rolesPermitidos = ['operario', 'encargado'];

        return Inertia::render('Admin/Users/Create', [
            'sucursales'      => $sucursales,
            'rolesPermitidos' => $rolesPermitidos,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || strtolower($user->rol) !== 'jefe') {
            abort(403, 'No tienes permisos para realizar esta acción.');
        }

        $rolesPermitidos = ['operario', 'encargado'];

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'email'         => ['required', 'email', 'max:100'],
            'password'      => ['required', 'string', 'min:8'],
            'rol'           => ['required', 'in:' . implode(',', $rolesPermitidos)],
            'fk_idSucursal' => ['required', 'integer', 'min:1'],
        ]);

        // Email único en la conexión correcta
        $emailExists = User::on('newdb')->where('email', $data['email'])->exists();
        if ($emailExists) {
            return back()->withErrors(['email' => 'El correo ya está registrado.'])->withInput();
        }

        $nuevo = new User();
        $nuevo->setConnection('newdb'); // por si acaso
        $nuevo->name          = $data['name'];
        $nuevo->email         = $data['email'];
        $nuevo->password      = Hash::make($data['password']);
        $nuevo->rol           = $data['rol'];
        $nuevo->fk_idSucursal = (int) $data['fk_idSucursal'];
        $nuevo->save();

        return redirect('/admin/usuarios/crear')->with('success', 'Usuario creado correctamente.');
    }
}
