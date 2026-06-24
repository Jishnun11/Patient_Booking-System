<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'department_id',
        'phone',
        'specialization',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // Accessor for full name
    public function getFullNameAttribute()
    {
        return $this->user->name;
    }

    // Accessor for email
    public function getEmailAttribute()
    {
        return $this->user->email;
    }
}