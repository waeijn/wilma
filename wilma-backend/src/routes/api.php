<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Product API Routes
Route::post('/products/bulk', [ProductController::class, 'bulkStore']);
Route::apiResource('products', ProductController::class);

// Sales API Routes
Route::post('/sales', [SaleController::class, 'store']);
Route::get('/products/{product}/sales', [SaleController::class, 'index']);

// ML Data Route
Route::get('/ml/dataset', [\App\Http\Controllers\MLController::class, 'getDataset']);