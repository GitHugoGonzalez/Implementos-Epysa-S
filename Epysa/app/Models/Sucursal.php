<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Sucursal extends Model
{
    protected $connection = 'newdb';
    protected $table = 'Sucursal';
    protected $primaryKey = 'id_sucursal';
    public $timestamps = false;
    protected $fillable = ['direccion','ciudad'];
}
