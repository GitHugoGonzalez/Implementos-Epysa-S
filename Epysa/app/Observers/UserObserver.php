<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    public function created(User $user)
    {
        $user->audit('CREAR_USUARIO', null, $user->toArray());
    }

    public function updated(User $user)
    {
        $user->audit('ACTUALIZAR_USUARIO', $user->getOriginal(), $user->getChanges());
    }

    public function deleted(User $user)
    {
        $user->audit('ELIMINAR_USUARIO', $user->getOriginal(), null);
    }
}
