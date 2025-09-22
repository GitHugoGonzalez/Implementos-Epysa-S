<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insumo extends Model
{
    protected $connection = 'newdb';   // Epysa
    protected $table = 'Insumos';      // respeta mayúscula
    protected $primaryKey = 'id_insumo';
    public $timestamps = false;

    protected $fillable = [
        'nombre_insumo',
        'stock',
        'descripcion_insumo',
        'precio_insumo',
        'imagen',
        'imagen_mime',
    ];

    protected $hidden = ['imagen']; // no enviar binario en props por defecto
}
