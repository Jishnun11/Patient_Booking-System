<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Exports\PatientRegistrationExport;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PatientReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        $patients = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Receptionist/PatientReport', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'start_date', 'end_date']),
            'totalPatients' => Patient::count(),
            'todayRegistrations' => Patient::whereDate('created_at', today())->count(),
            'thisMonthRegistrations' => Patient::whereMonth('created_at', now()->month)->count(),
        ]);
    }

    public function export(Request $request)
    {
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $search = $request->search;

        $export = new PatientRegistrationExport($startDate, $endDate, $search);
        
        $fileName = 'patient_registration_report_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
        
        return Excel::download($export, $fileName);
    }

    public function exportPdf(Request $request)
    {
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $search = $request->search;

        $export = new PatientRegistrationExport($startDate, $endDate, $search);
        
        $fileName = 'patient_registration_report_' . now()->format('Y-m-d_H-i-s') . '.pdf';
        
        return Excel::download($export, $fileName, \Maatwebsite\Excel\Excel::DOMPDF);
    }
}