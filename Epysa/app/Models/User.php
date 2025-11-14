<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Traits\Auditable;

class User extends Authenticatable
{
    use Notifiable;
    use Auditable;

    // Conexión/tabla/PK del nuevo esquema
    protected $connection = 'newdb';
    protected $table = 'Usuarios';
    protected $primaryKey = 'id_us';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'id_rol',
        'id_sucursal',
        'fecha_creacion',
        'ultimo_login',
        'estado_usuario',
    ];

    protected $hidden = ['password'];

    // =========================
    // Relaciones
    // =========================
    public function rol()
    {
        return $this->belongsTo(\App\Models\Rol::class, 'id_rol', 'id_rol');
    }

    // Alias de compatibilidad (para código legacy que aún use rolRef)
    public function rolRef()
    {
        return $this->rol();
    }

    public function sucursal()
    {
        return $this->belongsTo(\App\Models\Sucursal::class, 'id_sucursal', 'id_sucursal');
    }

    // =========================
    // Helpers de Rol
    // =========================

    // Accesor: nombre de rol en minúsculas (ej: 'jefe', 'encargado')
    public function getRolNombreAttribute(): string
    {
        return strtolower(trim(optional($this->rol)->nombre_rol ?? ''));
    }

    // Verificación de rol para middleware/controladores
    public function hasRole(string ...$roles): bool
    {
        $actual = $this->rol_nombre;
        return collect($roles)
            ->map(fn($r) => strtolower(trim($r)))
            ->contains($actual);
    }
}
