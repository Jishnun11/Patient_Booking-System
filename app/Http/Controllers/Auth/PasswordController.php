<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    public function showChangePasswordForm()
    {
        return inertia('Auth/ChangePassword');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.current_password' => 'The current password is incorrect.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        $user = Auth::user();
        $user->password = Hash::make($request->password);
        $user->save();

        // Redirect based on user role
        if ($user->role === 'super_admin') {
            return redirect()->route('super-admin.dashboard')->with('success', 'Password changed successfully!');
        } elseif ($user->role === 'doctor') {
            return redirect('/doctor/dashboard')->with('success', 'Password changed successfully!');
        } elseif ($user->role === 'receptionist') {
            return redirect('/receptionist/dashboard')->with('success', 'Password changed successfully!');
        }
        
        return redirect('/')->with('success', 'Password changed successfully!');
    }
}