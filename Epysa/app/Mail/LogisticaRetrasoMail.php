<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LogisticaRetrasoMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $info;
    public ?string $motivo;

    /**
     * @param array $info -> viene de datosSolicitudParaCorreo()
     */
    public function __construct(array $info, ?string $motivo = null)
    {
        $this->info = $info;
        $this->motivo = $motivo;
    }

    public function build()
    {
        return $this->subject('Logística: Actualización de fecha (retraso)')
            ->markdown('emails.logistica.retraso');
    }
}
