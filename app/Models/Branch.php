<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_code',
        'branch_name',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'pincode',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Many-to-many relationship with departments
    public function departments()
    {
        return $this->belongsToMany(Department::class, 'branch_department')
                    ->withPivot('is_active')
                    ->withTimestamps();
    }

    // Get active departments
    public function activeDepartments()
    {
        return $this->belongsToMany(Department::class, 'branch_department')
                    ->wherePivot('is_active', true)
                    ->withTimestamps();
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Accessor for full address
    public function getFullAddressAttribute()
    {
        return implode(', ', array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->pincode,
        ]));
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where('branch_name', 'like', "%{$search}%")
                        ->orWhere('branch_code', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('state', 'like', "%{$search}%");
        }
        return $query;
    }
}
