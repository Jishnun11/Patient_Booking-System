<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ForgotPasswordController;

Route::get('/', function () {
    return Inertia::render('Home');
});

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::post('/login', [LoginController::class, 'store']);

Route::post('/logout', function () {

    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/login');

});

Route::get('/forgot-password', [ForgotPasswordController::class, 'forgotPassword']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendOtp']);
Route::get('/verify-otp', [ForgotPasswordController::class, 'verifyOtpPage']);
Route::post('/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::get('/reset-password', [ForgotPasswordController::class, 'resetPasswordPage']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
