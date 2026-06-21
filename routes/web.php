<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\BranchController; 
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ReceptionistController;

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

// Add this after the Super Admin routes group or before it
Route::middleware(['auth'])->group(function () {
    Route::get('/change-password', [App\Http\Controllers\Auth\PasswordController::class, 'showChangePasswordForm'])->name('password.change');
    Route::post('/change-password', [App\Http\Controllers\Auth\PasswordController::class, 'updatePassword'])->name('password.update');
});

// Super Admin routes
Route::middleware(['auth', 'role:super_admin'])->prefix('super-admin')->group(function () {
    Route::get('/dashboard', [SuperAdminController::class, 'dashboard'])->name('super-admin.dashboard');
    Route::post('/doctors', [SuperAdminController::class, 'storeDoctor'])->name('super-admin.doctors.store');
    Route::post('/receptionists', [SuperAdminController::class, 'storeReceptionist'])->name('super-admin.receptionists.store');
    Route::delete('/users/{user}', [SuperAdminController::class, 'destroyUser'])->name('super-admin.users.destroy');

        // Branch routes
    Route::get('/branches', [BranchController::class, 'index'])->name('super-admin.branches.index');
    Route::get('/branches/search', [BranchController::class, 'search'])->name('super-admin.branches.search');
    Route::post('/branches', [BranchController::class, 'store'])->name('super-admin.branches.store');
    Route::put('/branches/{branch}', [BranchController::class, 'update'])->name('super-admin.branches.update');
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->name('super-admin.branches.destroy');
    Route::post('/branches/{branch}/toggle-status', [BranchController::class, 'toggleStatus'])->name('super-admin.branches.toggle-status');

        // Department routes - ADD THESE
    Route::get('/departments', [DepartmentController::class, 'index'])->name('super-admin.departments.index');
    Route::get('/departments/search', [DepartmentController::class, 'search'])->name('super-admin.departments.search');
    Route::post('/departments', [DepartmentController::class, 'store'])->name('super-admin.departments.store');
    Route::put('/departments/{department}', [DepartmentController::class, 'update'])->name('super-admin.departments.update');
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->name('super-admin.departments.destroy');
    Route::post('/departments/{department}/toggle-status', [DepartmentController::class, 'toggleStatus'])->name('super-admin.departments.toggle-status');

    // Receptionist Management Routes
    Route::get('/receptionists', [ReceptionistController::class, 'index'])->name('receptionists.index');
    Route::post('/receptionists', [ReceptionistController::class, 'store'])->name('receptionists.store');
    Route::put('/receptionists/{receptionist}', [ReceptionistController::class, 'update'])->name('receptionists.update');
    Route::delete('/receptionists/{receptionist}', [ReceptionistController::class, 'destroy'])->name('receptionists.destroy');
    Route::patch('/receptionists/{receptionist}/toggle-status', [ReceptionistController::class, 'toggleStatus'])->name('receptionists.toggle-status');

});

// Doctor routes
Route::middleware(['auth', 'role:doctor'])->prefix('doctor')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\DoctorController::class, 'dashboard'])->name('doctor.dashboard');
});
