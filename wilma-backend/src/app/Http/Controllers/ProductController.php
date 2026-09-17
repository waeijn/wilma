<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'current_inventory' => 'required|integer|min:0',
            'average_sales_per_week' => 'required|numeric|min:0',
            'lead_time_days' => 'required|integer|min:1',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    /**
     * Store multiple resources.
     */
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.product_name' => 'required|string|max:255',
            'products.*.category' => 'required|string|max:100',
            'products.*.current_inventory' => 'required|integer|min:0',
            'products.*.average_sales_per_week' => 'required|numeric|min:0',
            'products.*.lead_time_days' => 'required|integer|min:1',
        ]);

        $products = [];
        foreach ($validated['products'] as $productData) {
            $productData['created_at'] = now();
            $productData['updated_at'] = now();
            $products[] = $productData;
        }

        Product::insert($products);

        return response()->json(['message' => count($products) . ' products imported successfully'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product_name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:100',
            'current_inventory' => 'sometimes|integer|min:0',
            'average_sales_per_week' => 'sometimes|numeric|min:0',
            'lead_time_days' => 'sometimes|integer|min:1',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}