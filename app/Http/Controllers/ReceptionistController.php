<?php
// app/Http/Controllers/ReceptionistController.php

namespace App\Http\Controllers;

use App\Models\Receptionist;
use App\Models\User;
use App\Models\Branch;
use App\Http\Requests\Receptionist\StoreReceptionistRequest;
use App\Http\Requests\Receptionist\UpdateReceptionistRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ReceptionistController extends Controller
{
    /**
     * Display a listing of the receptionists.
     */
    public function index(Request $request)
    {
        $query = Receptionist::with(['branch', 'user']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by branch
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // Filter by shift
        if ($request->filled('shift')) {
            $query->where('shift', $request->shift);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $receptionists = $query->orderBy('created_at', 'desc')->paginate(10);
        $branches = Branch::where('is_active', true)->get();

        return Inertia::render('SuperAdmin/ReceptionistManagement', [
            'receptionists' => $receptionists,
            'branches' => $branches,
            'filters' => $request->only(['search', 'branch_id', 'shift', 'status']),
        ]);
    }

    /**
     * Store a newly created receptionist.
     */
    public function store(StoreReceptionistRequest $request)
    {
        try {
            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => User::ROLE_RECEPTIONIST,
            ]);

            // Create receptionist profile
            $receptionist = Receptionist::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'shift' => $request->shift,
                'branch_id' => $request->branch_id,
                'is_active' => true,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Receptionist added successfully! User account created with email: ' . $user->email);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create receptionist: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified receptionist.
     */
    public function update(UpdateReceptionistRequest $request, Receptionist $receptionist)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validated();
            
            // Handle is_active checkbox
            $validated['is_active'] = $request->has('is_active') ? true : false;
            
            // Update receptionist
            $receptionist->update($validated);

            // Update associated user
            if ($receptionist->user) {
                $userData = [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                ];

                // Update password if provided
                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }

                $receptionist->user->update($userData);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Receptionist updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update receptionist: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified receptionist.
     */
    public function destroy(Receptionist $receptionist)
    {
        try {
            DB::beginTransaction();

            // Delete the associated user
            if ($receptionist->user) {
                $receptionist->user->delete();
            }

            // Delete the receptionist
            $receptionist->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Receptionist deleted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to delete receptionist: ' . $e->getMessage());
        }
    }

    /**
     * Toggle receptionist status.
     */
    public function toggleStatus(Receptionist $receptionist)
    {
        try {
            $receptionist->update([
                'is_active' => !$receptionist->is_active
            ]);

            // Update user status if needed (you might want to add an is_active field to users table)
            // Or just leave as is

            $status = $receptionist->is_active ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "Receptionist {$status} successfully!");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to toggle status: ' . $e->getMessage());
        }
    }
}