<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ReceptionistController extends Controller
{
    public function dashboard()
    {
        $doctors = User::where('role', User::ROLE_DOCTOR)->get();
        
        // Sample data - replace with actual database queries
        $todayAppointments = [];
        $pendingAppointments = [];
        $patients = [];
        
        return Inertia::render('Receptionist/Dashboard', [
            'doctors' => $doctors,
            'todayAppointments' => $todayAppointments,
            'pendingAppointments' => $pendingAppointments,
            'patients' => $patients,
        ]);
    }

    public function storePatient(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'password' => Hash::make('password123'), // Default password
            'role' => User::ROLE_PATIENT,
        ]);

        return redirect()->back()->with('success', 'Patient registered successfully!');
    }

    public function storeAppointment(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time' => 'required',
            'reason' => 'required|string',
        ]);

        // Create appointment logic here
        // Appointment::create($validated);

        return redirect()->back()->with('success', 'Appointment scheduled successfully!');
    }

    public function updateAppointmentStatus($id, Request $request)
    {
        $request->validate([
            'status' => 'required|in:scheduled,confirmed,completed,cancelled'
        ]);

        // Update appointment status logic here

        return redirect()->back()->with('success', 'Appointment status updated!');
    }

    public function destroyAppointment($id)
    {
        // Delete appointment logic here
        return redirect()->back()->with('success', 'Appointment cancelled successfully!');
    }
}