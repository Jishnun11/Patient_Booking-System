<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'patient_code',
        'name',
        'phone',
        'email',
        'address',
        'gender',
        'blood_group',
        'age',
        'place',
        'date_of_birth',
        'emergency_contact',
        'status'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
}