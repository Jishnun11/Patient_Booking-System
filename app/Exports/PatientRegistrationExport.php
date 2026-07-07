<?php

namespace App\Exports;

use App\Models\Patient;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class PatientRegistrationExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $startDate;
    protected $endDate;
    protected $search;

    public function __construct($startDate = null, $endDate = null, $search = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->search = $search;
    }

    public function collection()
    {
        $query = Patient::query();

        if ($this->search) {
            $query->where(function($q) {
                $q->where('name', 'LIKE', "%{$this->search}%")
                  ->orWhere('email', 'LIKE', "%{$this->search}%")
                  ->orWhere('phone', 'LIKE', "%{$this->search}%")
                  ->orWhere('address', 'LIKE', "%{$this->search}%");
            });
        }

        if ($this->startDate && $this->endDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ]);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Patient Name',
            'Email',
            'Phone',
            'Address',
            'Date of Birth',
            'Gender',
            'Blood Group',
            'Registered Date',
            'Status'
        ];
    }

    public function map($patient): array
    {
        return [
            $patient->id,
            $patient->name,
            $patient->email,
            $patient->phone ?? 'N/A',
            $patient->address ?? 'N/A',
            $patient->date_of_birth ? Carbon::parse($patient->date_of_birth)->format('Y-m-d') : 'N/A',
            $patient->gender ?? 'N/A',
            $patient->blood_group ?? 'N/A',
            Carbon::parse($patient->created_at)->format('Y-m-d H:i:s'),
            $patient->status ?? 'Active'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
            'A1:J1' => ['fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E5E7EB']]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 25,
            'C' => 30,
            'D' => 20,
            'E' => 30,
            'F' => 15,
            'G' => 12,
            'H' => 15,
            'I' => 20,
            'J' => 15,
        ];
    }
}