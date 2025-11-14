<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public function audit(string $accion, array $antes = null, array $despues = null)
    {
        AuditLog::create([
            'usuario_id'      => Auth::id(),
            'accion'          => $accion,
            'valores_antes'   => $antes,
            'valores_despues' => $despues,
            'created_at'      => now(),
        ]);
    }
}
