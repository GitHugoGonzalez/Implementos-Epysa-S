<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $connection = 'newdb';
    protected $table = 'Usuarios';
    protected $primaryKey = 'id_us';
    public $timestamps = false;

    protected $fillable = [
        'name','email','password','id_rol','id_sucursal',
        'fecha_creacion','ultimo_login','estado_usuario',
    ];

    protected $hidden = ['password'];

public function rolRef() { return $this->belongsTo(\App\Models\Rol::class, 'id_rol', 'id_rol'); }
}
