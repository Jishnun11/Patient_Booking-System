<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Receptionist;
use App\Models\Branch;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

class SuperAdminController extends Controller
{
    public function dashboard()
    {
        $doctors = User::where('role', User::ROLE_DOCTOR)->with('doctor')->get();
        $receptionists = Receptionist::with(['user', 'branch'])->get();
        $branches = Branch::with('departments')->orderBy('created_at', 'desc')->get();
        $departments = Department::where('is_active', true)->get();

        return Inertia::render('SuperAdmin/Dashboard', [
            'doctors' => $doctors,
            'receptionists' => $receptionists,
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    public function storeReceptionist(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_RECEPTIONIST,
        ]);

        return redirect()->back()->with('success', 'Receptionist added successfully!');
    }

    public function destroyUser(User $user)
    {
        if ($user->role === User::ROLE_SUPER_ADMIN) {
            return redirect()->back()->with('error', 'Cannot delete super admin!');
        }
        
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully!');
    }
}