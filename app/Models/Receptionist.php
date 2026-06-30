<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receptionist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'branch_id',
        'shift',
        'status'
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with Branch
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    // Accessor to get name from user relationship
    public function getNameAttribute()
    {
        return $this->user->name ?? null;
    }

    // Accessor to get email from user relationship
    public function getEmailAttribute()
    {
        return $this->user->email ?? null;
    }

    // Scope for active receptionists
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    // Scope for inactive receptionists
    public function scopeInactive($query)
    {
        return $query->where('status', false);
    }
}