<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    protected $connection = 'newdb';
    protected $table = 'estado';
    protected $primaryKey = 'id_estado';
    public $timestamps = false;

    protected $fillable = ['desc_estado'];
}
