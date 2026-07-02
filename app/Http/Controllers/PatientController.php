<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('patient_code', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%")
                  ->orWhere('place', 'LIKE', "%{$search}%");
            });
        }
        
        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $patients = $query->latest()->get();
        
        // Get other data for dashboard
        $doctors = \App\Models\Doctor::all();
        $todayAppointments = \App\Models\Appointment::whereDate('date', today())->get();
        $pendingAppointments = \App\Models\Appointment::where('status', 'pending')->get();
        
        // If the request is from Inertia
        return Inertia::render('Receptionist/Dashboard', [
            'patients' => $patients,
            'doctors' => $doctors,
            'todayAppointments' => $todayAppointments,
            'pendingAppointments' => $pendingAppointments,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? ''
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'age' => 'nullable|integer|min:0|max:150',
            'patient_code' => 'nullable|string|unique:patients',
            'place' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'emergency_contact' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,pending,archived'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        if (empty($request->patient_code)) {
            $request->merge([
                'patient_code' => 'PAT' . time() . rand(100, 999)
            ]);
        }

        $patient = Patient::create($request->all());
        
        // Return back with success message for Inertia
        return redirect()->back()->with('success', 'Patient registered successfully!');
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'gender' => 'nullable|in:male,female,other',
            'age' => 'nullable|integer|min:0|max:150',
            'patient_code' => 'nullable|string|unique:patients,patient_code,' . $id,
            'place' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'emergency_contact' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,pending,archived'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $patient = Patient::findOrFail($id);
        $patient->update($request->all());
        
        return redirect()->back()->with('success', 'Patient updated successfully!');
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        
        return redirect()->back()->with('success', 'Patient deleted successfully!');
    }

    public function toggleStatus($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->status = $patient->status === 'active' ? 'inactive' : 'active';
        $patient->save();
        
        return redirect()->back()->with('success', 'Patient status updated successfully!');
    }

    public function show($id)
    {
        $patient = Patient::findOrFail($id);
        return response()->json($patient);
    }
}