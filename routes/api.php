<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TebuController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\KlasifikasiController;
use App\Http\Controllers\Api\HasilController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API Resource Routes for Sistem Klasifikasi Kualitas Tebu
Route::apiResource('supplier', SupplierController::class);
Route::apiResource('tebu', TebuController::class);
Route::apiResource('transaksi', TransaksiController::class);
Route::apiResource('klasifikasi', KlasifikasiController::class);
Route::apiResource('hasil', HasilController::class);
