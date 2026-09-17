<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'sold_at',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'quantity' => 'integer',
        'sold_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
