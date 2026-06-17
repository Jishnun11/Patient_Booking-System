<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::with('departments')->orderBy('created_at', 'desc')->get();
        $departments = Department::where('is_active', true)->get();
        
        return Inertia::render('SuperAdmin/Branches', [
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->input('search');
        $branches = Branch::with('departments')
                         ->search($search)
                         ->orderBy('created_at', 'desc')
                         ->get();
        
        return response()->json($branches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_name' => 'required|string|max:255|unique:branches,branch_name',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:branches,email',
            'address' => 'required|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'is_active' => 'boolean',
            'departments' => 'nullable|array',
            'departments.*' => 'exists:departments,id',
        ]);

        // Generate branch code
        $branchCode = 'BR-' . strtoupper(Str::random(6));
        $validated['branch_code'] = $branchCode;

        $branch = Branch::create($validated);

        // Attach departments if selected
        if (!empty($validated['departments'])) {
            $branch->departments()->attach($validated['departments']);
        }

        return redirect()->back()->with('success', 'Branch created successfully!');
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'branch_name' => 'required|string|max:255|unique:branches,branch_name,' . $branch->id,
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:branches,email,' . $branch->id,
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:10',
            'is_active' => 'boolean',
            'departments' => 'nullable|array',
            'departments.*' => 'exists:departments,id',
        ]);

        $branch->update($validated);

        // Sync departments
        if (isset($validated['departments'])) {
            $branch->departments()->sync($validated['departments']);
        } else {
            $branch->departments()->detach();
        }

        return redirect()->back()->with('success', 'Branch updated successfully!');
    }

    public function destroy(Branch $branch)
    {
        // // Check if branch has related records
        // if ($branch->users()->count() > 0) {
        //     return redirect()->back()->with('error', 'Cannot delete branch with associated users!');
        // }

        // Detach all departments first
        $branch->departments()->detach();
        $branch->delete();

        return redirect()->back()->with('success', 'Branch deleted successfully!');
    }

    public function toggleStatus(Branch $branch)
    {
        $branch->is_active = !$branch->is_active;
        $branch->save();

        return redirect()->back()->with('success', 'Branch status updated successfully!');
    }
}