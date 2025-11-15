<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Models\Solicitud;
use App\Observers\UserObserver;
use App\Observers\SolicitudObserver;
use App\Models\Insumo;
use App\Observers\InsumoObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        User::observe(UserObserver::class);
        Solicitud::observe(SolicitudObserver::class);
        Insumo::observe(InsumoObserver::class);
    }
}
