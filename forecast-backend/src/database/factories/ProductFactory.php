<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Electronics', 'Clothing', 'Food & Beverages', 
            'Furniture', 'Tools & Hardware', 'Books & Media',
            'Toys & Games', 'Sports Equipment', 'Home & Garden',
            'Automotive', 'Health & Beauty', 'Office Supplies'
        ];
        
        $products = [
            'Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse',
            'T-Shirt', 'Jeans', 'Shoes', 'Jacket', 'Hat', 'Socks',
            'Coffee', 'Tea', 'Snacks', 'Beverages', 'Canned Goods', 'Pasta',
            'Chair', 'Desk', 'Shelf', 'Cabinet', 'Lamp', 'Sofa',
            'Hammer', 'Screwdriver', 'Drill', 'Wrench', 'Saw', 'Pliers'
        ];

        return [
            'product_name' => fake()->randomElement($categories) . ' - ' . 
                            fake()->randomElement($products) . ' ' . 
                            fake()->numberBetween(100, 999),
            'current_inventory' => fake()->numberBetween(5, 150),
            'average_sales_per_week' => fake()->randomFloat(2, 5, 80),
            'lead_time_days' => fake()->numberBetween(2, 14),
        ];
    }
}