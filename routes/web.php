<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\BranchController; 
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\ReceptionistController;
use App\Http\Controllers\PatientController;

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

Route::middleware(['auth'])->group(function () {
    Route::get('/change-password', [App\Http\Controllers\Auth\PasswordController::class, 'showChangePasswordForm'])->name('password.change');
    Route::post('/change-password', [App\Http\Controllers\Auth\PasswordController::class, 'updatePassword'])->name('password.update');
});

// Super Admin routes
Route::middleware(['auth', 'role:super_admin'])->prefix('super-admin')->group(function () {
    Route::get('/dashboard', [SuperAdminController::class, 'dashboard'])->name('super-admin.dashboard');
    
    // Doctor Management Routes
    Route::get('/doctors', [DoctorController::class, 'index'])->name('super-admin.doctors.index');
    Route::get('/doctors/search', [DoctorController::class, 'search'])->name('super-admin.doctors.search');
    Route::post('/doctors', [DoctorController::class, 'store'])->name('super-admin.doctors.store');
    Route::put('/doctors/{doctor}', [DoctorController::class, 'update'])->name('super-admin.doctors.update');
    Route::delete('/doctors/{doctor}', [DoctorController::class, 'destroy'])->name('super-admin.doctors.destroy');
    Route::post('/doctors/{doctor}/toggle-status', [DoctorController::class, 'toggleStatus'])->name('super-admin.doctors.toggle-status');
    
     // Receptionist Management Routes
    Route::get('/receptionists', [ReceptionistController::class, 'index'])->name('super-admin.receptionists.index');
    Route::get('/receptionists/search', [ReceptionistController::class, 'search'])->name('super-admin.receptionists.search');
    Route::post('/receptionists', [ReceptionistController::class, 'store'])->name('super-admin.receptionists.store');
    Route::put('/receptionists/{receptionist}', [ReceptionistController::class, 'update'])->name('super-admin.receptionists.update');
    Route::delete('/receptionists/{receptionist}', [ReceptionistController::class, 'destroy'])->name('super-admin.receptionists.destroy');
    Route::post('/receptionists/{receptionist}/toggle-status', [ReceptionistController::class, 'toggleStatus'])->name('super-admin.receptionists.toggle-status');
    // Receptionist routes
    // Route::post('/receptionists', [SuperAdminController::class, 'storeReceptionist'])->name('super-admin.receptionists.store');
    Route::delete('/users/{user}', [SuperAdminController::class, 'destroyUser'])->name('super-admin.users.destroy');

    // Branch routes
    Route::get('/branches', [BranchController::class, 'index'])->name('super-admin.branches.index');
    Route::get('/branches/search', [BranchController::class, 'search'])->name('super-admin.branches.search');
    Route::post('/branches', [BranchController::class, 'store'])->name('super-admin.branches.store');
    Route::put('/branches/{branch}', [BranchController::class, 'update'])->name('super-admin.branches.update');
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->name('super-admin.branches.destroy');
    Route::post('/branches/{branch}/toggle-status', [BranchController::class, 'toggleStatus'])->name('super-admin.branches.toggle-status');

    // Department routes
    Route::get('/departments', [DepartmentController::class, 'index'])->name('super-admin.departments.index');
    Route::get('/departments/search', [DepartmentController::class, 'search'])->name('super-admin.departments.search');
    Route::post('/departments', [DepartmentController::class, 'store'])->name('super-admin.departments.store');
    Route::put('/departments/{department}', [DepartmentController::class, 'update'])->name('super-admin.departments.update');
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->name('super-admin.departments.destroy');
    Route::post('/departments/{department}/toggle-status', [DepartmentController::class, 'toggleStatus'])->name('super-admin.departments.toggle-status');
});

// // Receptionist routes (for receptionist panel)
// Route::middleware(['auth', 'role:receptionist'])->prefix('receptionist')->group(function () {
//     Route::get('/dashboard', function () {
//         // You can either create a controller or use a simple Inertia render
//         return Inertia::render('Receptionist/Dashboard');})->name('receptionist.dashboard');

//         // Patient routes - make sure these are correctly defined
//     Route::get('/patients', [App\Http\Controllers\PatientController::class, 'index']);
//     Route::post('/patients', [App\Http\Controllers\PatientController::class, 'store']);
//     Route::get('/patients/{id}', [App\Http\Controllers\PatientController::class, 'show']);
//     Route::put('/patients/{id}', [App\Http\Controllers\PatientController::class, 'update']);
//     Route::delete('/patients/{id}', [App\Http\Controllers\PatientController::class, 'destroy']);
// });

// In your receptionist routes group
// Route::middleware(['auth', 'role:receptionist'])->prefix('receptionist')->group(function () {
//     Route::get('/dashboard', function () {
//         return Inertia::render('Receptionist/Dashboard');
//     })->name('receptionist.dashboard');
Route::middleware(['auth', 'role:receptionist'])->prefix('receptionist')->group(function () {
    Route::get('/dashboard', function () {
        // Fetch all necessary data
        $patients = \App\Models\Patient::latest()->get();
        // $doctors = \App\Models\Doctor::all();
        // $todayAppointments = \App\Models\Appointment::whereDate('date', today())->get();
        // $pendingAppointments = \App\Models\Appointment::where('status', 'pending')->get();
        
        return Inertia::render('Receptionist/Dashboard', [
            'patients' => $patients,
            // 'doctors' => $doctors,
            // 'todayAppointments' => $todayAppointments,
            // 'pendingAppointments' => $pendingAppointments,
            'filters' => [
                'search' => '',
                'status' => ''
            ]
        ]);
    })->name('receptionist.dashboard');
       // Patient routes
    Route::get('/patients', [PatientController::class, 'index'])->name('receptionist.patients.index');
    Route::post('/patients', [PatientController::class, 'store'])->name('receptionist.patients.store');
    Route::get('/patients/{id}', [PatientController::class, 'show'])->name('receptionist.patients.show');
    Route::put('/patients/{id}', [PatientController::class, 'update'])->name('receptionist.patients.update');
    Route::delete('/patients/{id}', [PatientController::class, 'destroy'])->name('receptionist.patients.destroy');
    Route::post('/patients/{id}/toggle-status', [PatientController::class, 'toggleStatus'])->name('receptionist.patients.toggle-status');
});

// Doctor routes (for doctor panel)
Route::middleware(['auth', 'role:doctor'])->prefix('doctor')->group(function () {
    Route::get('/dashboard', function () {
        // You can pass data here if needed
        return Inertia::render('Doctor/Dashboard');})->name('doctor.dashboard');
});
