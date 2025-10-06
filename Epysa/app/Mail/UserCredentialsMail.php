<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $payload;

    public function __construct(array $payload)
    {
        // payload = ['name','email','plain_password','rol','sucursal','login_url']
        $this->payload = $payload;
    }

    public function build()
    {
        return $this->subject('Tus credenciales de acceso ✅')
            ->view('emails.user-credentials')
            ->with(['p' => $this->payload]);
    }
}
