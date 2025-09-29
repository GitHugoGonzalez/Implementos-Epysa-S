<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Solicitud extends Model
{
    protected $connection = 'newdb';
    protected $table = 'solicitudes';
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = [
        'id_us',
        'usuario_nombre',
        'id_sucursal',
        'sucursal_nombre',
        'id_insumo',
        'insumo_nombre',
        'cantidad',
        'fecha_sol',
        'id_estado',
    ];

    protected $casts = ['fecha_sol' => 'date'];

    public function insumo()
    {
        return $this->belongsTo(\App\Models\Insumo::class, 'id_insumo', 'id_insumo')
            ->select(['id_insumo', 'nombre_insumo', 'precio_insumo']); // sin imagen
    }

    public function sucursal()
    {
        return $this->belongsTo(\App\Models\Sucursal::class, 'id_sucursal', 'id_sucursal')
            ->select(['id_sucursal', 'ciudad', 'direccion']);
    }

    public function estado()
    {
        return $this->belongsTo(\App\Models\Estado::class, 'id_estado', 'id_estado')
            ->select(['id_estado', 'desc_estado']);
    }
}
