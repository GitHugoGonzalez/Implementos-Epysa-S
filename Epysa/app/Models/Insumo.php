<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Insumo extends Model
{
    use Auditable;
    
    protected $connection = 'newdb';
    protected $table = 'Insumos';
    protected $primaryKey = 'id_insumo';
    public $timestamps = false;
    protected $fillable = ['nombre_insumo','stock','descripcion_insumo','precio_insumo','prep_minutos','transporte_minutos','sla_dias_habiles'];
}
