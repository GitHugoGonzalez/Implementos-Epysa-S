<?php

namespace App\Notifications;

use App\Models\Solicitud;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SolicitudRetrasoNotification extends Notification
{
    use Queueable;

    public function __construct(public Solicitud $solicitud, public string $motivo = '')
    {
    }

    public function via($notifiable) { return ['mail']; }

    public function toMail($notifiable)
    {
        $s = $this->solicitud;
        return (new MailMessage)
            ->subject('Actualización: posible retraso en tu solicitud')
            ->greeting('Hola ' . ($s->usuario_nombre ?? ''))
            ->line('Tu solicitud con insumo: ' . ($s->insumo_nombre ?? 'N/D') . ' ha sido actualizada.')
            ->line('Fecha estimada de entrega: ' . ($s->log_fecha_estimada ?? $s->eta_calculada ?? 'N/D'))
            ->line('Fecha límite (SLA): ' . ($s->deadline_at ?? 'N/D'))
            ->when(!empty($this->motivo), fn($m) => $m->line('Motivo: ' . $this->motivo))
            ->line('Gracias por tu paciencia.');
    }
}
