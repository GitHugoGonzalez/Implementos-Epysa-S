<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LogisticaAprobadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $info;
    public ?string $comentario;

    /**
     * @param array $info -> viene de datosSolicitudParaCorreo()
     * @param string|null $comentario -> comentario opcional de logística
     */
    public function __construct(array $info, ?string $comentario = null)
    {
        $this->info = $info;
        $this->comentario = $comentario;
    }

    public function build()
    {
        return $this->subject('Logística: Solicitud aprobada y en tránsito ✅')
            ->markdown('emails.logistica.aprobada');
    }
}
