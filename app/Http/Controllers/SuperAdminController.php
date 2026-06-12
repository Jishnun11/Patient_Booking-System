<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    public function dashboard()
    {
        $doctors = User::where('role', User::ROLE_DOCTOR)->get();
        $receptionists = User::where('role', User::ROLE_RECEPTIONIST)->get();
        
        return Inertia::render('SuperAdmin/Dashboard', [
            'doctors' => $doctors,
            'receptionists' => $receptionists,
        ]);
    }

    public function storeDoctor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'specialization' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_DOCTOR,
        ]);

        return redirect()->back()->with('success', 'Doctor added successfully!');
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