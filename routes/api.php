<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TebuController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\KlasifikasiController;
use App\Http\Controllers\Api\HasilController;
// use App\Http\Controllers\AuthController; // DINONAKTIFKAN

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Test routes
Route::get('/test', function () {
    return response()->json(['status' => 'success', 'message' => 'API berjalan dengan baik']);
});
Route::get('/ping', fn() => response()->json(['status' => 'ok']));

// // Auth routes — DINONAKTIFKAN
// Route::post('/login', [AuthController::class, 'login']);

// ── Supplier ──
Route::get('/supplier',              [SupplierController::class, 'index']);
Route::get('/supplier/{id}',         [SupplierController::class, 'show']);
Route::post('/supplier',             [SupplierController::class, 'store']);
Route::post('/supplier/public',      [SupplierController::class, 'store']);  // alias publik
Route::put('/supplier/{id}',         [SupplierController::class, 'update']);
Route::delete('/supplier/{id}',      [SupplierController::class, 'destroy']);

// ── Tebu ──
Route::apiResource('tebu', TebuController::class);

// ── Transaksi ──
Route::get('/transaksi/diproses',       [TransaksiController::class, 'getDiproses']);
Route::get('/supplier/{id}/transaksi',  [TransaksiController::class, 'bySupplier']);
Route::post('/transaksi/public',        [TransaksiController::class, 'storePublic']);
Route::put('/transaksi/{id}/status',    [TransaksiController::class, 'updateStatus']);
Route::put('/transaksi/{id}/status-antrian', [TransaksiController::class, 'updateStatusAntrian']);
Route::get('/transaksi/{id}',           [TransaksiController::class, 'show']);
Route::put('/transaksi/{id}',           [TransaksiController::class, 'update']);
Route::delete('/transaksi/{id}',        [TransaksiController::class, 'destroy']);
Route::post('/transaksi',               [TransaksiController::class, 'store']);
Route::get('/transaksi',                [TransaksiController::class, 'index']);

use App\Http\Controllers\Api\DashboardController;

// ── Dashboard ──
Route::get('/dashboard/kualitas', [DashboardController::class, 'getKualitasTahunan']);

// ── Klasifikasi ──
Route::apiResource('klasifikasi', KlasifikasiController::class);

// ── Hasil ──
Route::get('/hasil',              [HasilController::class, 'index']);
Route::get('/hasil/{id}',         [HasilController::class, 'show']);
Route::post('/hasil',             [HasilController::class, 'store']);
Route::put('/hasil/{id}',         [HasilController::class, 'update']);
Route::delete('/hasil/{id}',      [HasilController::class, 'destroy']);
