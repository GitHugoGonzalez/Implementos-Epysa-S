<?php

namespace App\Observers;

use App\Models\Insumo;

class InsumoObserver
{
    public function created(Insumo $insumo)
    {
        $insumo->audit('CREAR_INSUMO', null, $insumo->toArray());
    }

    public function updated(Insumo $insumo)
    {
        $insumo->audit('ACTUALIZAR_INSUMO', $insumo->getOriginal(), $insumo->getChanges());
    }

    public function deleted(Insumo $insumo)
    {
        $insumo->audit('ELIMINAR_INSUMO', $insumo->getOriginal(), null);
    }
}
