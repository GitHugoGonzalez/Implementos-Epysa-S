<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // si usas sanctum

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ⚠️ usar la NUEVA conexión
    protected $connection = 'newdb';

    // ⚠️ tu tabla real
    protected $table = 'Usuarios';

    // ⚠️ PK real
    protected $primaryKey = 'id_us';

    // no hay created_at / updated_at en tu tabla
    public $timestamps = false;

    // si tu PK es autoincrement INT, esto está bien por defecto
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'fk_idSucursal',
    ];

    protected $hidden = [
        'password',
        
    ];

}
