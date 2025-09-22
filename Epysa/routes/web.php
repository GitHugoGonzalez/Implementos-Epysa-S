<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InsumoController;


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
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/insumos/crear', [InsumoController::class, 'create'])->name('insumos.create');
    Route::get('/insumos/index', [InsumoController::class, 'index'])->name('insumos.index');
    Route::post('/insumos', [InsumoController::class, 'store'])->name('insumos.store');
    Route::get('/insumos/{insumo}/imagen', [InsumoController::class, 'imagen'])->name('insumos.imagen');
});

require __DIR__.'/auth.php';
