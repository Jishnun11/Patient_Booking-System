<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::with('branches')->orderBy('created_at', 'desc')->get();
        $branches = Branch::where('is_active', true)->get();
        
        return Inertia::render('SuperAdmin/Departments', [
            'departments' => $departments,
            'branches' => $branches,
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->input('search');
        $departments = Department::with('branches')
                                ->search($search)
                                ->orderBy('created_at', 'desc')
                                ->get();
        
        return response()->json($departments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name',
            'description' => 'nullable|string',
            'head_of_department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:departments,email',
            'is_active' => 'boolean',
            'branches' => 'nullable|array',
            'branches.*' => 'exists:branches,id',
        ]);

        // Generate department code
        $departmentCode = 'DEPT-' . strtoupper(Str::random(6));
        $validated['department_code'] = $departmentCode;

        $department = Department::create($validated);

        // Attach branches if selected
        if (!empty($validated['branches'])) {
            $department->branches()->attach($validated['branches']);
        }

        return redirect()->back()->with('success', 'Department created successfully!');
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name,' . $department->id,
            'description' => 'nullable|string',
            'head_of_department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:departments,email,' . $department->id,
            'is_active' => 'boolean',
            'branches' => 'nullable|array',
            'branches.*' => 'exists:branches,id',
        ]);

        $department->update($validated);

        // Sync branches
        if (isset($validated['branches'])) {
            $department->branches()->sync($validated['branches']);
        } else {
            $department->branches()->detach();
        }

        return redirect()->back()->with('success', 'Department updated successfully!');
    }

    public function destroy(Department $department)
    {
        // Check if department has related records
        if ($department->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete department with associated users!');
        }

        // Detach all branches first
        $department->branches()->detach();
        $department->delete();

        return redirect()->back()->with('success', 'Department deleted successfully!');
    }

    public function toggleStatus(Department $department)
    {
        $department->is_active = !$department->is_active;
        $department->save();

        return redirect()->back()->with('success', 'Department status updated successfully!');
    }
}