<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Solicitud extends Model
{
    use Auditable;

    protected $connection = 'newdb';
    protected $table = 'Solicitudes';   // mismo nombre que en tu SQL
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = [
        'id_us',
        'id_sucursal',
        'id_insumo',
        'cantidad',
        'motivo',        // 👈 AGREGADO
        'fecha_sol',
        'id_estado',
        'es_urgente',
        'observaciones',
    ];

    protected $casts = [
        'fecha_sol'  => 'date',
        'es_urgente' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(\App\Models\User::class, 'id_us', 'id_us')
            ->select(['id_us','name','email']);
    }

    public function sucursal()
    {
        return $this->belongsTo(\App\Models\Sucursal::class, 'id_sucursal', 'id_sucursal')
            ->select(['id_sucursal','ciudad','direccion']);
    }

    public function insumo()
    {
        return $this->belongsTo(\App\Models\Insumo::class, 'id_insumo', 'id_insumo')
            ->select(['id_insumo','nombre_insumo','precio_insumo']);
    }

    public function estado()
    {
        return $this->belongsTo(\App\Models\Estado::class, 'id_estado', 'id_estado')
            ->select(['id_estado','desc_estado']);
    }

    public function aprobaciones()
    {
        return $this->hasMany(\App\Models\Aprobacion::class, 'id_solicitud', 'id_solicitud');
    }

    public function logistica()
    {
        return $this->hasOne(\App\Models\Logistica::class, 'id_solicitud', 'id_solicitud');
    }
}
