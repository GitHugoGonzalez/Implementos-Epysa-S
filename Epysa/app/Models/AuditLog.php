<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $connection = 'newdb';
    protected $table = 'Auditoria';
    protected $primaryKey = 'id_audit';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'accion',
        'valores_antes',
        'valores_despues',
        'created_at'
    ];

    protected $casts = [
        'valores_antes' => 'array',
        'valores_despues' => 'array'
    ];

    // =========================================================
    // RELACIONES
    // =========================================================
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id_us');
    }
}
