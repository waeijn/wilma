<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;  // Make sure this line exists

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Product API Routes - Use the full namespace
Route::apiResource('products', ProductController::class);