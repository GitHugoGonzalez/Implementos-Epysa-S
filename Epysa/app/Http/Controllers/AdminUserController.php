<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Sucursal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserCredentialsMail;
use Inertia\Inertia;

class AdminUserController extends Controller
{
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

        $rolesPermitidos = ['operario', 'encargado', 'jefe','logistica'];

        return Inertia::render('Admin/Users/Create', [
            'sucursales'      => $sucursales,
            'rolesPermitidos' => $rolesPermitidos,
        ]);
    }

    public function store(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser || strtolower($authUser->rol) !== 'jefe') {
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

        $plainPassword = $data['password'];

        // Unicidad por email en 'newdb'
        $emailExists = User::on('newdb')->where('email', $data['email'])->exists();
        if ($emailExists) {
            return back()->withErrors(['email' => 'El correo ya está registrado.'])->withInput();
        }

        // Crear usuario (tabla con PK id_us y sin created_at)
        $nuevo = new User();
        $nuevo->setConnection('newdb');
        $nuevo->name          = $data['name'];
        $nuevo->email         = $data['email'];
        $nuevo->password      = Hash::make($plainPassword);
        $nuevo->rol           = $data['rol'];
        $nuevo->fk_idSucursal = (int) $data['fk_idSucursal'];
        $nuevo->save();

        $sucursalLabel = null;

        $payload = [
            'name'           => $nuevo->name,
            'email'          => $nuevo->email,
            'plain_password' => $plainPassword,
            'rol'            => $nuevo->rol ?? null,
            'sucursal'       => $sucursalLabel,
            'login_url'      => rtrim(config('app.url'), '/') . '/login',
        ];

        try {
            Mail::to($nuevo->email)
                ->bcc(config('mail.from.address'))
                ->send(new UserCredentialsMail($payload));
        } catch (\Throwable $e) {
            \Log::error('❌ Falló el envío de credenciales', [
                'to'    => $nuevo->email,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Usuario creado, pero falló el envío de correo: '.$e->getMessage());
        }

        return redirect('/admin/usuarios/crear')->with('success', 'Usuario creado y credenciales enviadas por correo ✅');
    }

    public function index(Request $request)
    {
        $auth = $request->user();
        if (!$auth || !in_array(strtolower($auth->rol), ['jefe','logistica'])) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $q = trim((string) $request->query('q', ''));

        // 👇 No hay created_at y la PK es id_us
        $usersQuery = User::on('newdb')
            ->from('Usuarios') // si tu tabla real es 'Usuarios'
            ->select([
                'id_us as id',     // alias para el frontend
                'name',
                'email',
                'rol',
                'fk_idSucursal',
            ]);

        if ($q !== '') {
            $usersQuery->where(function($s) use ($q) {
                $s->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('rol', 'like', "%{$q}%");
            });
        }

        $users = $usersQuery
            ->orderBy('id_us','desc')   // 👈 ordenar por PK
            ->paginate(10)
            ->withQueryString();

        $sucursales = Sucursal::on('newdb')
            ->select('id_sucursal','ciudad','direccion')
            ->get()
            ->keyBy('id_sucursal');

        return Inertia::render('Admin/Users/Index', [
            'users'      => $users,
            'q'          => $q,
            'sucursales' => $sucursales,
            'canDelete'  => in_array(strtolower($auth->rol), ['jefe','logistica']),
            'authRol'    => strtolower($auth->rol),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $auth = $request->user();
        if (!$auth || !in_array(strtolower($auth->rol), ['jefe','logistica'])) {
            abort(403, 'No tienes permisos para realizar esta acción.');
        }

        // Busca por id_us (no por id)
        $user = User::on('newdb')
            ->from('Usuarios') // si tu tabla es 'Usuarios'
            ->where('id_us', $id)
            ->firstOrFail();

        // No permitir eliminarse a sí mismo (comparando por email, más seguro entre conexiones)
        if (strcasecmp($auth->email, $user->email) === 0) {
            return back()->with('error', 'No puedes eliminar tu propio usuario.');
        }

        // Regla: logística no puede eliminar a jefe
        if (strtolower($auth->rol) === 'logistica' && strtolower($user->rol) === 'jefe') {
            return back()->with('error', 'No puedes eliminar usuarios con rol Jefe.');
        }

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }
}
