<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function build()
    {
        // Leer las credenciales desde el archivo .env
        $dbCredentials = [
            'DB_CONNECTION' => env('DB_CONNECTION'),
            'DB_HOST'       => env('DB_HOST'),
            'DB_PORT'       => env('DB_PORT'),
            'DB_DATABASE'   => env('DB_DATABASE'),
            'DB_USERNAME'   => env('DB_USERNAME'),
            'DB_PASSWORD'   => env('DB_PASSWORD'),
        ];

        return $this->subject('Credenciales de la Base de Datos 🚀')
                    ->view('emails.test')
                    ->with(['dbCredentials' => $dbCredentials]);
    }
}
