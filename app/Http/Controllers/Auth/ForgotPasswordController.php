<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;

class ForgotPasswordController extends Controller
{
    public function forgotPassword()
    {
        return inertia('Auth/ForgotPassword');
    }

    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'Email not found'
            ]);
        }

        $otp = rand(100000, 999999);

        session([
            'reset_email' => $request->email,
            'reset_otp' => $otp
        ]);

        Mail::raw(
            "Your OTP for password reset is: $otp",
            function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Password Reset OTP');
            }
        );

        return redirect('/verify-otp');
    }

    public function verifyOtpPage()
    {
        return inertia('Auth/VerifyOtp');
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required'
        ]);

        if ($request->otp != session('reset_otp')) {
            return back()->withErrors([
                'otp' => 'Invalid OTP'
            ]);
        }

        return redirect('/reset-password');
    }

    public function resetPasswordPage()
    {
        return inertia('Auth/ResetPassword');
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6|confirmed'
        ]);

        User::where(
            'email',
            session('reset_email')
        )->update([
            'password' => Hash::make($request->password)
        ]);

        session()->forget([
            'reset_email',
            'reset_otp'
        ]);

        return redirect('/login');
    }
}