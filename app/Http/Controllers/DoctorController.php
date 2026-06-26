<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Branch;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::with(['user', 'branch', 'department']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('specialization', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $doctors = $query->orderBy('created_at', 'desc')->paginate(10);
        $branches = Branch::where('is_active', true)->get();
        $departments = Department::where('is_active', true)->get();

        // Return Inertia response for all requests
        return Inertia::render('SuperAdmin/DoctorManagement', [
            'doctors' => $doctors,
            'branches' => $branches,
            'departments' => $departments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->get('q');
        
        $doctors = Doctor::with('user')
            ->whereHas('user', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->orWhere('specialization', 'like', "%{$search}%")
            ->limit(10)
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->user->name,
                    'email' => $doctor->user->email,
                    'specialization' => $doctor->specialization,
                ];
            });

        return response()->json($doctors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'branch_id' => 'nullable|exists:branches,id',
            'department_id' => 'nullable|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => User::ROLE_DOCTOR,
            ]);

            // Create doctor profile
            Doctor::create([
                'user_id' => $user->id,
                'phone' => $validated['phone'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'is_active' => true,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Doctor added successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to add doctor: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $doctor->user_id,
            'phone' => 'nullable|string|max:20',
            'branch_id' => 'nullable|exists:branches,id',
            'department_id' => 'nullable|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Update user
            $doctor->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Update doctor profile
            $doctor->update([
                'phone' => $validated['phone'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'is_active' => $validated['is_active'] ?? $doctor->is_active,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Doctor updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update doctor: ' . $e->getMessage());
        }
    }

    public function destroy(Doctor $doctor)
    {
        try {
            DB::beginTransaction();
            
            // Delete doctor profile
            $doctor->delete();
            
            // Delete user
            $doctor->user->delete();
            
            DB::commit();

            return redirect()->back()->with('success', 'Doctor deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to delete doctor: ' . $e->getMessage());
        }
    }

    public function toggleStatus(Doctor $doctor)
    {
        try {
            $doctor->update([
                'is_active' => !$doctor->is_active
            ]);

            $status = $doctor->is_active ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "Doctor {$status} successfully!");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update doctor status: ' . $e->getMessage());
        }
    }
}