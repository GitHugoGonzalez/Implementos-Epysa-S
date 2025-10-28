<?php

namespace App\Notifications;

use App\Models\Solicitud;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SolicitudRechazadaPorLogistica extends Notification
{
    use Queueable;

    public function __construct(public Solicitud $solicitud, public ?string $motivo = null, public ?string $nuevaFecha = null)
    {
    }

    public function via($notifiable) { return ['mail']; }

    public function toMail($notifiable)
    {
        $s = $this->solicitud;
        $mail = (new MailMessage)
            ->subject('Tu solicitud fue rechazada por Logística')
            ->greeting('Hola ' . ($s->usuario_nombre ?? ''))
            ->line('Tu solicitud del insumo: ' . ($s->insumo_nombre ?? 'N/D') . ' ha sido rechazada por Logística.')
            ->when($this->motivo, fn($m) => $m->line('Motivo: ' . $this->motivo))
            ->when($this->nuevaFecha, fn($m) => $m->line('Nueva fecha propuesta: ' . $this->nuevaFecha))
            ->line('Si necesitas más detalles, comunícate con logística.');

        return $mail;
    }
}
