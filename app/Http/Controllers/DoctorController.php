<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    public function dashboard()
    {
        $doctor = Auth::user();
        
        // Sample data - you can replace with actual database queries
        $appointments = [
            // You can fetch from appointments table
        ];
        
        $patients = [
            // You can fetch patients assigned to this doctor
        ];
        
        $todayAppointments = [
            // You can fetch today's appointments
        ];
        
        return Inertia::render('Doctor/Dashboard', [
            'appointments' => $appointments,
            'patients' => $patients,
            'todayAppointments' => $todayAppointments,
        ]);
    }
}