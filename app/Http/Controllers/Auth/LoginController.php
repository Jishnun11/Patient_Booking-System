<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {

            $request->session()->regenerate();

             // Redirect based on role
            $user = Auth::user();
            
            if ($user->role === 'super_admin') {
                return redirect('/super-admin/dashboard');
            } elseif ($user->role === 'doctor') {
                return redirect('/doctor/dashboard');
            } elseif ($user->role === 'receptionist') {
                return redirect('/receptionist/dashboard');
            }
            return redirect('/');
        }

        return back()->withErrors([
            'email' => 'Invalid credentials.',
        ]);
    }
}