<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MLController extends Controller
{
    /**
     * Generate training dataset using historical sliding windows.
     * Features (X): Sales in previous 30 days, Lead Time, Category.
     * Target (Y): Actual sales in the subsequent 'Lead Time' days.
     */
    public function getDataset()
    {
        $products = Product::all();
        $dataset = [];
        $windowDays = 30;

        foreach ($products as $product) {
            $leadTime = $product->lead_time_days ?: 1;
            $sales = Sale::where('product_id', $product->id)
                ->orderBy('sold_at', 'asc')
                ->get()
                ->groupBy(function($s) {
                    return Carbon::parse($s->sold_at)->format('Y-m-d');
                })
                ->map(function($rows) {
                    return $rows->sum('quantity');
                });
                
            if ($sales->isEmpty()) continue;

            $startDate = Carbon::parse($sales->keys()->first());
            $endDate = Carbon::now()->subDays($leadTime); // Ensure we have enough future days for the target

            for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
                // Calculate X1: Sales in the past $windowDays days (T-30 to T)
                $pastSales = 0;
                for ($i = 0; $i < $windowDays; $i++) {
                    $d = clone $date;
                    $d->subDays($i);
                    $pastSales += $sales->get($d->format('Y-m-d'), 0);
                }

                // Calculate Y: Sales in the next $leadTime days (T to T + leadTime)
                $futureSales = 0;
                for ($i = 1; $i <= $leadTime; $i++) {
                    $d = clone $date;
                    $d->addDays($i);
                    $futureSales += $sales->get($d->format('Y-m-d'), 0);
                }

                $dataset[] = [
                    'category' => $product->category,
                    'lead_time_days' => $leadTime,
                    'sales_past_30_days' => $pastSales,
                    'target_sales_next_lead_time' => $futureSales
                ];
            }
        }

        return response()->json($dataset);
    }
}
