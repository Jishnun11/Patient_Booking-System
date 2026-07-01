<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Receptionist;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ReceptionistController extends Controller
{
    /**
     * Display a listing of receptionists with search and filter
     */
    public function index(Request $request)
    {
        $query = Receptionist::with(['user', 'branch']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            })->orWhere('phone', 'LIKE', "%{$search}%");
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('status', true);
            } elseif ($request->status === 'inactive') {
                $query->where('status', false);
            }
        }

        $receptionists = $query->orderBy('created_at', 'desc')->paginate(10);
        
        // Get branches for dropdown
        $branches = Branch::where('status', true)->get();

        return Inertia::render('SuperAdmin/ReceptionistManagement', [
            'receptionists' => $receptionists,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Store a newly created receptionist
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'branch_id' => 'nullable|exists:branches,id',
            'shift' => 'nullable|string|in:morning,evening,night',
            'status' => 'boolean',
        ]);

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_RECEPTIONIST,
        ]);

        // Create receptionist profile
        $receptionist = Receptionist::create([
            'user_id' => $user->id,
            'phone' => $validated['phone'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'shift' => $validated['shift'] ?? null,
            'status' => $validated['status'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Receptionist added successfully!');
    }

    /**
     * Update the specified receptionist
     */
    public function update(Request $request, Receptionist $receptionist)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($receptionist->user_id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'branch_id' => 'nullable|exists:branches,id',
            'shift' => 'nullable|string|in:morning,evening,night',
            'status' => 'boolean',
        ]);

        // Update user
        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $receptionist->user->update($userData);

        // Update receptionist profile
        $receptionist->update([
            'phone' => $validated['phone'] ?? null,
            'branch_id' => $validated['branch_id'] ?? null,
            'shift' => $validated['shift'] ?? null,
            'status' => $validated['status'] ?? $receptionist->status,
        ]);

        return redirect()->back()->with('success', 'Receptionist updated successfully!');
    }

    /**
     * Toggle receptionist status (activate/deactivate)
     */
    public function toggleStatus(Receptionist $receptionist)
    {
        $receptionist->update([
            'status' => !$receptionist->status
        ]);

        $status = $receptionist->status ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Receptionist {$status} successfully!");
    }

    /**
     * Remove the specified receptionist
     */
    public function destroy(Receptionist $receptionist)
    {
        $user = $receptionist->user;
        $receptionist->delete();
        $user->delete();

        return redirect()->back()->with('success', 'Receptionist deleted successfully!');
    }

    /**
     * Search receptionists (for API/autocomplete)
     */
    public function search(Request $request)
    {
        $search = $request->get('q');
        $receptionists = Receptionist::with('user')
            ->whereHas('user', function ($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
            })
            ->orWhere('phone', 'LIKE', "%{$search}%")
            ->where('status', true)
            ->limit(10)
            ->get()
            ->map(function ($receptionist) {
                return [
                    'id' => $receptionist->id,
                    'name' => $receptionist->user->name,
                    'email' => $receptionist->user->email,
                    'phone' => $receptionist->phone,
                ];
            });

        return response()->json($receptionists);
    }
}