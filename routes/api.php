<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TebuController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\KlasifikasiController;
use App\Http\Controllers\Api\HasilController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test routes
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API berjalan dengan baik'
    ]);
});

Route::get('/ping', fn() => response()->json(['status' => 'ok']));

// Auth routes
Route::post('/login', [AuthController::class, 'login']);

// Public routes - untuk dashboard (bisa diakses tanpa auth)
Route::get('/supplier', [SupplierController::class, 'index']);
Route::get('/supplier/{id}', [SupplierController::class, 'show']);
Route::post('/supplier/public', [SupplierController::class, 'store']); // Add Supplier tanpa auth
Route::get('/supplier/{id}/transaksi', [TransaksiController::class, 'bySupplier']); // Transaksi per supplier
Route::post('/transaksi/public', [TransaksiController::class, 'storePublic']); // Add Pengiriman tanpa auth
Route::put('/transaksi/{id}/status', [TransaksiController::class, 'updateStatus']); // Update status
Route::get('/hasil', [HasilController::class, 'index']);
Route::get('/hasil/{id}', [HasilController::class, 'show']);


// Protected routes - untuk CRUD operations (butuh auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // CRUD Supplier - admin only
    Route::post('/supplier', [SupplierController::class, 'store']);
    Route::put('/supplier/{id}', [SupplierController::class, 'update']);
    Route::delete('/supplier/{id}', [SupplierController::class, 'destroy']);

    // CRUD Tebu
    Route::apiResource('tebu', TebuController::class);

    // CRUD Transaksi
    Route::apiResource('transaksi', TransaksiController::class);

    // CRUD Klasifikasi
    Route::apiResource('klasifikasi', KlasifikasiController::class);

    // CRUD Hasil (create, update, delete only - read is public)
    Route::post('/hasil', [HasilController::class, 'store']);
    Route::put('/hasil/{id}', [HasilController::class, 'update']);
    Route::delete('/hasil/{id}', [HasilController::class, 'destroy']);
});
