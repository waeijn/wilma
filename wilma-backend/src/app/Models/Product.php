<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'category',
        'current_inventory',
        'average_sales_per_week',
        'lead_time_days',
    ];

    protected $casts = [
        'current_inventory' => 'integer',
        'average_sales_per_week' => 'decimal:2',
        'lead_time_days' => 'integer',
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}