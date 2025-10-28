<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LogisticaRechazoMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $info;
    public string $motivo;
    public ?string $nuevaFecha;

    /**
     * @param array $info  -> viene de datosSolicitudParaCorreo()
     */
    public function __construct(array $info, string $motivo, ?string $nuevaFecha = null)
    {
        $this->info = $info;
        $this->motivo = $motivo;
        $this->nuevaFecha = $nuevaFecha;
    }

    public function build()
    {
        return $this->subject('Logística: Solicitud rechazada')
            ->markdown('emails.logistica.rechazo');
    }
}
