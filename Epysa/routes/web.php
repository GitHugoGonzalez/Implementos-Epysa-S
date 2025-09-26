<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InsumoController;
use App\Http\Controllers\SolicitudController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // INSUMOS
    Route::get('/insumos/crear', [InsumoController::class, 'create'])->name('insumos.create');

    // Opción A (tu ruta actual):
    Route::get('/insumos/index', [InsumoController::class, 'index'])->name('insumos.index');

    // Opción B (más estándar) — si la usas, cambia tus links a "/insumos":
    // Route::get('/insumos', [InsumoController::class, 'index'])->name('insumos.index');

    Route::post('/insumos', [InsumoController::class, 'store'])->name('insumos.store');

    // Imagen SIN model binding (ID crudo)
    Route::get('/insumos/{id}/imagen', [InsumoController::class, 'imagen'])
        ->whereNumber('id')
        ->name('insumos.imagen');

    // SOLICITUDES
    Route::get('/solicitudes/crear', [SolicitudController::class, 'create'])->name('solicitudes.create');
    Route::post('/solicitudes', [SolicitudController::class, 'store'])->name('solicitudes.store');
});

require __DIR__.'/auth.php';
