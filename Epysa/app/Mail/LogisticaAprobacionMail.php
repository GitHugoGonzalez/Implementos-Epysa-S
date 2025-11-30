<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LogisticaAprobacionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $info;

    public function __construct($info)
    {
        $this->info = $info;
    }

    public function build()
    {
        return $this->subject('Solicitud Aprobada por Logística - #' . $this->info['solicitud']['id'])
                    ->view('emails.logistica.aprobacion')
                    ->with('info', $this->info);
    }
}