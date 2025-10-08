<?php

namespace App\Http\Controllers;

use App\Models\User;       // <-- usa tu modelo real
use App\Models\Sucursal;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserCredentialsMail;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    // Solo Jefe puede crear
    public function create(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->hasRole('jefe')) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $sucursales = Sucursal::on('newdb')
            ->select('id_sucursal','ciudad','direccion')
            ->orderBy('ciudad')
            ->get();

        // Traer roles desde BD (evita hardcode)
        $rolesPermitidos = Rol::on('newdb')
            ->whereIn(DB::raw('LOWER(nombre_rol)'), ['operario','encargado','jefe','logistica'])
            ->orderBy('nombre_rol')
            ->get(['id_rol','nombre_rol']);

        return Inertia::render('Admin/Users/Create', [
            'sucursales'      => $sucursales,
            'rolesPermitidos' => $rolesPermitidos, // [{id_rol, nombre_rol}]
        ]);
    }

    // Solo Jefe puede guardar
    public function store(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser || !$authUser->hasRole('jefe')) {
            abort(403, 'No tienes permisos para realizar esta acción.');
        }

        // Permitimos crear Operario o Encargado (ajusta si quieres incluir Logística)
        $rolesValidos = Rol::on('newdb')
            ->whereIn(DB::raw('LOWER(nombre_rol)'), ['operario','encargado'])
            ->pluck('id_rol','nombre_rol'); // ['operario'=>id, 'encargado'=>id]

        $data = $request->validate([
            'name'        => ['required','string','max:150'],
            'email'       => ['required','email','max:150'],
            'password'    => ['required','string','min:8'],
            // Front puede enviar 'nombre_rol' o 'id_rol' — soportamos ambos:
            'nombre_rol'  => ['nullable','string'],
            'id_rol'      => [
                'nullable',
                'integer',
                // apunta explícitamente a la conexión 'newdb'
                Rule::exists('newdb.Roles', 'id_rol'),
            ],
            'id_sucursal' => [
                'required',
                'integer',
                Rule::exists('newdb.Sucursal', 'id_sucursal'),
            ],
        ]);

        // Resolver id_rol
        $idRol = $data['id_rol'] ?? null;
        if (!$idRol && !empty($data['nombre_rol'])) {
            $lookup = strtolower(trim($data['nombre_rol']));
            $idRol = $rolesValidos[$lookup] ?? null;
        }
        if (!$idRol) {
            return back()->withErrors(['id_rol' => 'Rol no permitido para creación.'])->withInput();
        }

        // Unicidad por email en 'newdb'
        $emailExists = User::query()->where('email', $data['email'])->exists(); // el modelo ya usa newdb
        if ($emailExists) {
            return back()->withErrors(['email' => 'El correo ya está registrado.'])->withInput();
        }

        $plainPassword = $data['password'];

        $nuevo = new User();
        // no necesitas setConnection, el modelo ya está en 'newdb'
        $nuevo->name           = $data['name'];
        $nuevo->email          = $data['email'];
        $nuevo->password       = Hash::make($plainPassword);
        $nuevo->id_rol         = $idRol; // ✔ ahora FK
        $nuevo->id_sucursal    = (int) $data['id_sucursal'];
        $nuevo->estado_usuario = 'activo';
        $nuevo->save();

        // Para el correo
        $rolNombre = optional($nuevo->rol)->nombre_rol;
        $suc = optional($nuevo->sucursal);
        $sucursalLabel = $suc ? "{$suc->ciudad} – {$suc->direccion}" : null;

        $payload = [
            'name'           => $nuevo->name,
            'email'          => $nuevo->email,
            'plain_password' => $plainPassword,
            'rol'            => $rolNombre,
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

        return redirect()->route('admin.users.create')
            ->with('success', 'Usuario creado y credenciales enviadas por correo ✅');
    }

    // Listado: Jefe o Logística
    public function index(Request $request)
    {
        $auth = $request->user();
        if (!$auth || ! $auth->hasRole('jefe','logistica')) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }

        $q = trim((string) $request->query('q', ''));

        $usersQuery = DB::connection('newdb')
            ->table('Usuarios as u')
            ->join('Roles as r', 'r.id_rol', '=', 'u.id_rol')
            ->leftJoin('Sucursal as s', 's.id_sucursal', '=', 'u.id_sucursal')
            ->select([
                'u.id_us as id',
                'u.name',
                'u.email',
                'r.nombre_rol as rol',       // ✔ string para el front
                'u.id_sucursal',
                's.ciudad',
                's.direccion',
                'u.estado_usuario',
            ]);

        if ($q !== '') {
            $usersQuery->where(function($s) use ($q) {
                $s->where('u.name', 'like', "%{$q}%")
                  ->orWhere('u.email', 'like', "%{$q}%")
                  ->orWhere('r.nombre_rol', 'like', "%{$q}%")
                  ->orWhere('s.ciudad', 'like', "%{$q}%");
            });
        }

        $users = $usersQuery
            ->orderByDesc('u.id_us')
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
            'canDelete'  => $auth->hasRole('jefe','logistica'),
            'authRol'    => $auth->rol_nombre, // 'jefe','logistica', etc.
        ]);
    }

    // Eliminar: Jefe o Logística
    public function destroy(Request $request, int $id)
    {
        $auth = $request->user();
        if (!$auth || ! $auth->hasRole('jefe','logistica')) {
            abort(403, 'No tienes permisos para realizar esta acción.');
        }

        $user = User::query()->find($id);
        if (!$user) {
            return back()->with('error', 'El usuario no existe o ya fue eliminado.');
        }

        if (strcasecmp($auth->email, $user->email) === 0) {
            return back()->with('error', 'No puedes eliminar tu propio usuario.');
        }

        // ¿Tiene dependencias? (Solicitudes, Aprobaciones, Logistica, Auditoria, Notificaciones)
        $conn = DB::connection('newdb');
        $tieneDeps = $conn->table('Solicitudes')->where('id_us', $id)->exists()
            || $conn->table('Aprobaciones')->where('aprobado_por', $id)->exists()
            || $conn->table('Logistica')->where('rechazado_por', $id)->exists()
            || $conn->table('Auditoria')->where('last_modified_by', $id)->exists()
            || $conn->table('Notificaciones')->where('id_usuario', $id)->exists();

        if ($tieneDeps) {
            // Política segura: no borrar duro si hay relaciones
            return back()->with('error', 'No se puede eliminar: el usuario tiene registros asociados.');
        }

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }
}
