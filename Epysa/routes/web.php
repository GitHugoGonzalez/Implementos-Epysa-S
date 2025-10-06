<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InsumoController;
use App\Http\Controllers\SolicitudController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\SolicitudAprobadaController;
use App\Http\Controllers\EncargadoSolicitudesController;
use App\Http\Controllers\LogisticaController;

use Illuminate\Support\Facades\Mail;
use App\Mail\TestMail;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});



Route::middleware('auth')->group(function () {
    // Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // INSUMOS
    Route::get('/insumos/crear', [InsumoController::class, 'create'])->name('insumos.create');

    // Opción A (tu ruta actual):
    Route::get('/insumos/index', [InsumoController::class, 'index'])->name('insumos.index');

    Route::post('/insumos', [InsumoController::class, 'store'])->name('insumos.store');

    // Imagen SIN model binding (ID crudo)
    Route::get('/insumos/{id}/imagen', [InsumoController::class, 'imagen'])
        ->whereNumber('id')
        ->name('insumos.imagen');

    // SOLICITUDES
    Route::get('/solicitudes/crear', [SolicitudController::class, 'create'])->name('solicitudes.create');
    Route::post('/solicitudes', [SolicitudController::class, 'store'])->name('solicitudes.store');
    Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

    //Solicitudes aprobadas jefe
     Route::get('/aprobaciones', [SolicitudAprobadaController::class, 'index'])->name('aprobaciones.index');

    // Acciones
    Route::post('/aprobaciones/{id}/aprobar', [SolicitudAprobadaController::class, 'aprobar'])->name('aprobaciones.aprobar');
    Route::post('/aprobaciones/{id}/rechazar', [SolicitudAprobadaController::class, 'rechazar'])->name('aprobaciones.rechazar');

    //rutas protegidas admin 
    Route::get('/admin/usuarios/crear', [AdminUserController::class, 'create'])
        ->name('admin.users.create');
    Route::post('/admin/usuarios', [AdminUserController::class, 'store'])
        ->name('admin.users.store');


    //LOGISTICA
    Route::get('/logistica', [LogisticaController::class, 'index'])->name('logistica.index');

    Route::get('/solicitudes/{id}/logistica', [LogisticaController::class, 'edit'])->name('sol.logistica.edit');

    Route::post('/solicitudes/{id}/logistica/aprobar', [LogisticaController::class, 'aprobar'])->name('sol.logistica.aprobar');
    Route::post('/solicitudes/{id}/logistica/rechazar', [LogisticaController::class, 'rechazar'])->name('sol.logistica.rechazar');





    Route::get('/test-email', function () {
        Mail::to('ba.ventura@duocuc.cl')->send(new TestMail());
    return 'Correo enviado ✅';
});

});

require __DIR__.'/auth.php';
