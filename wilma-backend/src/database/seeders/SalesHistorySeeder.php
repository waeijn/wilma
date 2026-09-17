<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Sale;
use Carbon\Carbon;

class SalesHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        
        if ($products->isEmpty()) {
            $this->command->info('No products found. Skipping sales seeder.');
            return;
        }

        $this->command->info('Seeding 6 months of historical sales data...');

        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(180);

        $salesToInsert = [];

        foreach ($products as $product) {
            $dailyAverage = $product->average_sales_per_week / 7;
            
            // Adjust volatility based on category
            $volatility = 0.5; // default 50% variance
            if ($product->category === 'Beverages' || $product->category === 'Snacks') {
                $volatility = 0.8; // higher variance
            } elseif ($product->category === 'Canned Goods') {
                $volatility = 0.2; // stable
            }

            for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
                // Simulate weekend spike for certain categories
                $isWeekend = $date->isWeekend();
                $multiplier = 1.0;
                
                if ($isWeekend && ($product->category === 'Beverages' || $product->category === 'Snacks')) {
                    $multiplier = 1.5;
                } elseif ($isWeekend) {
                    $multiplier = 1.1;
                }

                // Add random noise
                $noise = 1 + (mt_rand(-$volatility * 100, $volatility * 100) / 100);
                
                // Calculate quantity sold today
                $quantity = max(0, round($dailyAverage * $multiplier * $noise));

                if ($quantity > 0) {
                    $salesToInsert[] = [
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'sold_at' => clone $date,
                        'created_at' => clone $date,
                        'updated_at' => clone $date,
                    ];
                }

                // Insert in chunks to avoid memory limits
                if (count($salesToInsert) >= 1000) {
                    Sale::insert($salesToInsert);
                    $salesToInsert = [];
                }
            }
            
            // Update the product's average_sales_per_week to match the last 30 days perfectly
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $recentSales = collect($salesToInsert)->where('sold_at', '>=', $thirtyDaysAgo)->sum('quantity');
            // If the chunk was inserted, we should just query it
        }

        if (count($salesToInsert) > 0) {
            Sale::insert($salesToInsert);
        }
        
        // Recalculate true averages
        foreach ($products as $product) {
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $totalSoldLast30Days = Sale::where('product_id', $product->id)
                ->where('sold_at', '>=', $thirtyDaysAgo)
                ->sum('quantity');
                
            $weeksInPeriod = 30 / 7;
            $newAverage = round($totalSoldLast30Days / $weeksInPeriod, 2);
            $product->update(['average_sales_per_week' => $newAverage]);
        }

        $this->command->info('Sales history seeded successfully!');
    }
}
