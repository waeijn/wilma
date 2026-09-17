<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SaleController extends Controller
{
    /**
     * Log a new sale for a product.
     *
     * Creates a sale record, decrements inventory,
     * and recalculates the average_sales_per_week from the last 30 days.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Check if there's enough inventory
        if ($product->current_inventory < $validated['quantity']) {
            return response()->json([
                'message' => 'Not enough inventory. Current stock: ' . $product->current_inventory,
            ], 422);
        }

        // Create the sale record
        $sale = Sale::create([
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
            'sold_at' => Carbon::now(),
        ]);

        // Decrement inventory
        $product->decrement('current_inventory', $validated['quantity']);

        // Recalculate average_sales_per_week from the last 30 days
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $totalSoldLast30Days = Sale::where('product_id', $product->id)
            ->where('sold_at', '>=', $thirtyDaysAgo)
            ->sum('quantity');

        // 30 days ≈ 4.2857 weeks
        $weeksInPeriod = 30 / 7;
        $newAverage = round($totalSoldLast30Days / $weeksInPeriod, 2);

        $product->update(['average_sales_per_week' => $newAverage]);

        // Reload the product with the updated values
        $product->refresh();

        return response()->json([
            'message' => 'Sale logged successfully',
            'sale' => $sale,
            'product' => $product,
            'average_sales_per_week' => $newAverage,
        ], 201);
    }
    public function index(Product $product)
    {
        $sales = Sale::where('product_id', $product->id)
            ->where('sold_at', '>=', Carbon::now()->subDays(30))
            ->orderBy('sold_at', 'asc')
            ->get();
            
        $dailySales = $sales->groupBy(function($sale) {
            return Carbon::parse($sale->sold_at)->format('Y-m-d');
        })->map(function ($row) {
            return $row->sum('quantity');
        });

        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $chartData[] = [
                'date' => Carbon::parse($date)->format('M d'),
                'quantity' => $dailySales->get($date, 0)
            ];
        }

        return response()->json($chartData);
    }
}
