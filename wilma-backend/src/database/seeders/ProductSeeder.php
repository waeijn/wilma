<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // Beverages
            ['product_name' => 'Coca-Cola 1.5L', 'category' => 'Beverages', 'current_inventory' => 12, 'average_sales_per_week' => 25, 'lead_time_days' => 2],
            ['product_name' => 'Sprite 1.5L', 'category' => 'Beverages', 'current_inventory' => 8, 'average_sales_per_week' => 15, 'lead_time_days' => 2],
            ['product_name' => 'C2 Apple 355ml', 'category' => 'Beverages', 'current_inventory' => 30, 'average_sales_per_week' => 40, 'lead_time_days' => 1],
            ['product_name' => 'Nescafé 3-in-1 Original', 'category' => 'Beverages', 'current_inventory' => 50, 'average_sales_per_week' => 70, 'lead_time_days' => 3],
            
            // Canned Goods
            ['product_name' => '555 Sardines 155g', 'category' => 'Canned Goods', 'current_inventory' => 24, 'average_sales_per_week' => 30, 'lead_time_days' => 3],
            ['product_name' => 'Century Tuna Flakes in Oil 155g', 'category' => 'Canned Goods', 'current_inventory' => 15, 'average_sales_per_week' => 20, 'lead_time_days' => 3],
            ['product_name' => 'Argentina Corned Beef 150g', 'category' => 'Canned Goods', 'current_inventory' => 10, 'average_sales_per_week' => 18, 'lead_time_days' => 3],
            
            // Snacks & Noodles
            ['product_name' => 'Lucky Me! Pancit Canton Kalamansi', 'category' => 'Snacks & Noodles', 'current_inventory' => 60, 'average_sales_per_week' => 100, 'lead_time_days' => 2],
            ['product_name' => 'Lucky Me! Beef Mami', 'category' => 'Snacks & Noodles', 'current_inventory' => 40, 'average_sales_per_week' => 60, 'lead_time_days' => 2],
            ['product_name' => 'Magic Flakes Crackers', 'category' => 'Snacks & Noodles', 'current_inventory' => 80, 'average_sales_per_week' => 90, 'lead_time_days' => 1],
            ['product_name' => 'Piattos Cheese', 'category' => 'Snacks & Noodles', 'current_inventory' => 20, 'average_sales_per_week' => 35, 'lead_time_days' => 1],
            
            // Toiletries & Essentials
            ['product_name' => 'Palmolive Naturals Shampoo Sachet', 'category' => 'Toiletries', 'current_inventory' => 100, 'average_sales_per_week' => 120, 'lead_time_days' => 4],
            ['product_name' => 'Safeguard White Soap 60g', 'category' => 'Toiletries', 'current_inventory' => 15, 'average_sales_per_week' => 10, 'lead_time_days' => 4],
            ['product_name' => 'Surf Cherry Blossom Powder 65g', 'category' => 'Household', 'current_inventory' => 45, 'average_sales_per_week' => 50, 'lead_time_days' => 2],
            ['product_name' => 'Joy Dishwashing Liquid Sachet', 'category' => 'Household', 'current_inventory' => 30, 'average_sales_per_week' => 45, 'lead_time_days' => 2],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}