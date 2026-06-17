<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_code',
        'department_name',
        'description',
        'head_of_department',
        'phone',
        'email',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Many-to-many relationship with branches
    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_department')
                    ->withPivot('is_active')
                    ->withTimestamps();
    }

    // Get active branches for this department
    public function activeBranches()
    {
        return $this->belongsToMany(Branch::class, 'branch_department')
                    ->wherePivot('is_active', true)
                    ->withTimestamps();
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('department_name', 'like', "%{$search}%")
                     ->orWhere('department_code', 'like', "%{$search}%")
                     ->orWhere('head_of_department', 'like', "%{$search}%");
    }
}