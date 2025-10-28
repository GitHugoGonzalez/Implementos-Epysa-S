<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Insumo extends Model
{
    protected $connection = 'newdb';
    protected $table = 'Insumos';
    protected $primaryKey = 'id_insumo';
    public $timestamps = false;
    protected $fillable = ['nombre_insumo','stock','descripcion_insumo','precio_insumo','prep_minutos','transporte_minutos','sla_dias_habiles'];
}
