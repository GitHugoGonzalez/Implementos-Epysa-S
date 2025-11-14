<?php

namespace App\Observers;

use App\Models\Solicitud;

class SolicitudObserver
{
    public function created(Solicitud $sol)
    {
        $sol->audit('CREAR_SOLICITUD', null, $sol->toArray());
    }

    public function updated(Solicitud $sol)
    {
        $sol->audit('ACTUALIZAR_SOLICITUD', $sol->getOriginal(), $sol->getChanges());
    }
}
