<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor', 'doctor.user']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('patient_code', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                })->orWhereHas('doctor.user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        $appointments = $query->orderBy('date', 'desc')
                             ->orderBy('time', 'desc')
                             ->paginate(10)
                             ->through(function ($appointment) {
                                 return [
                                     'id' => $appointment->id,
                                     'patient_id' => $appointment->patient_id,
                                     'patient_name' => $appointment->patient->name ?? 'Unknown',
                                     'patient_code' => $appointment->patient->patient_code ?? 'N/A',
                                     'patient_phone' => $appointment->patient->phone ?? 'N/A',
                                     'doctor_id' => $appointment->doctor_id,
                                     'doctor_name' => $appointment->doctor->user->name ?? 'Unknown',
                                     'doctor_specialization' => $appointment->doctor->specialization ?? 'General',
                                     'date' => $appointment->date->format('Y-m-d'),
                                     'time' => $appointment->time instanceof \DateTime ? $appointment->time->format('H:i') : date('H:i', strtotime($appointment->time)),
                                     'status' => $appointment->status,
                                     'reason' => $appointment->reason,
                                     'notes' => $appointment->notes,
                                     'cancellation_reason' => $appointment->cancellation_reason,
                                 ];
                             });

        // Get patients and doctors for dropdowns
        $patients = Patient::select('id', 'name', 'patient_code')->orderBy('name')->get();
        
        $doctors = Doctor::with('user:id,name')
            ->select('id', 'user_id', 'specialization')
            ->where('is_active', true)
            ->orderBy('user_id')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->user ? $doctor->user->name : 'Unknown',
                    'specialization' => $doctor->specialization ?? 'General'
                ];
            });

        return Inertia::render('Receptionist/AppointmentManagement', [
            'appointments' => $appointments,
            'patients' => $patients,
            'doctors' => $doctors,
            'filters' => $request->only(['search', 'status', 'date', 'patient_id', 'doctor_id'])
        ]);
    }

    public function create()
    {
        $patients = Patient::select('id', 'name', 'patient_code')->orderBy('name')->get();
        $doctors = Doctor::with('user:id,name')
            ->select('id', 'user_id', 'specialization')
            ->where('is_active', true)
            ->orderBy('user_id')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->user ? $doctor->user->name : 'Unknown',
                    'specialization' => $doctor->specialization ?? 'General'
                ];
            });

        return Inertia::render('Receptionist/AppointmentForm', [
            'patients' => $patients,
            'doctors' => $doctors,
            'appointment' => null,
            'isEditing' => false
        ]);
    }

    public function edit(Appointment $appointment)
    {
        $patients = Patient::select('id', 'name', 'patient_code')->orderBy('name')->get();
        $doctors = Doctor::with('user:id,name')
            ->select('id', 'user_id', 'specialization')
            ->where('is_active', true)
            ->orderBy('user_id')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->user ? $doctor->user->name : 'Unknown',
                    'specialization' => $doctor->specialization ?? 'General'
                ];
            });

        return Inertia::render('Receptionist/AppointmentForm', [
            'patients' => $patients,
            'doctors' => $doctors,
            'appointment' => [
                'id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'date' => $appointment->date->format('Y-m-d'),
                'time' => $appointment->time instanceof \DateTime ? $appointment->time->format('H:i') : date('H:i', strtotime($appointment->time)),
                'reason' => $appointment->reason,
                'notes' => $appointment->notes,
            ],
            'isEditing' => true
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500'
        ]);

        // Format time properly
        $validated['time'] = date('H:i:s', strtotime($validated['time']));

        // Check if doctor is available at that time
        $isAvailable = $this->isDoctorAvailable(
            $validated['doctor_id'],
            $validated['date'],
            $validated['time']
        );

        if (!$isAvailable) {
            return redirect()->back()
                ->withErrors(['time' => 'Doctor is not available at this time.'])
                ->withInput();
        }

        $appointment = Appointment::create($validated);

        return redirect()->route('receptionist.appointments.index')
                         ->with('success', 'Appointment scheduled successfully!');
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500'
        ]);

        // Format time properly
        $validated['time'] = date('H:i:s', strtotime($validated['time']));

        // Check if doctor is available at that time (excluding current appointment)
        $isAvailable = $this->isDoctorAvailable(
            $validated['doctor_id'],
            $validated['date'],
            $validated['time'],
            $appointment->id
        );

        if (!$isAvailable) {
            return redirect()->back()
                ->withErrors(['time' => 'Doctor is not available at this time.'])
                ->withInput();
        }

        // Check if appointment is being rescheduled
        $isRescheduled = $appointment->date != $validated['date'] || 
                        $appointment->time != $validated['time'];

        if ($isRescheduled && $appointment->status !== 'cancelled') {
            $appointment->status = 'rescheduled';
            $appointment->rescheduled_at = now();
        }

        $appointment->update($validated);

        return redirect()->route('receptionist.appointments.index')
                         ->with('success', 'Appointment updated successfully!');
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:scheduled,confirmed,completed,cancelled,rescheduled',
            'cancellation_reason' => 'nullable|string|max:500'
        ]);

        if ($validated['status'] === 'cancelled') {
            $appointment->cancellation_reason = $validated['cancellation_reason'] ?? null;
            $appointment->cancelled_at = now();
            $appointment->cancelled_by = auth()->id();
        }

        $appointment->status = $validated['status'];
        $appointment->save();

        $message = $validated['status'] === 'cancelled' 
            ? 'Appointment cancelled successfully!' 
            : 'Appointment status updated successfully!';

        return redirect()->back()->with('success', $message);
    }

    public function destroy(Appointment $appointment)
    {
        if ($appointment->status === 'cancelled') {
            $appointment->delete();
            return redirect()->back()->with('success', 'Appointment deleted successfully!');
        }

        return redirect()->back()->with('error', 'Only cancelled appointments can be deleted.');
    }

    public function checkDoctorAvailability(Request $request)
    {
        $doctorId = $request->doctor_id;
        $date = $request->date;
        $time = $request->time;
        $excludeId = $request->exclude_id;

        $available = $this->isDoctorAvailable($doctorId, $date, $time, $excludeId);

        return response()->json(['available' => $available]);
    }

    /**
     * Check if a doctor is available at a specific date and time
     */
    private function isDoctorAvailable($doctorId, $date, $time, $excludeId = null)
    {
        // Convert time if needed
        if (!str_contains($time, ':')) {
            $time = date('H:i:s', strtotime($time));
        }

        $query = Appointment::where('doctor_id', $doctorId)
                           ->whereDate('date', $date)
                           ->whereTime('time', $time)
                           ->whereIn('status', ['scheduled', 'confirmed', 'rescheduled']);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return !$query->exists();
    }

    public function getDoctorAvailableSlots(Request $request)
    {
        $doctorId = $request->doctor_id;
        $date = $request->date;
        $excludeId = $request->exclude_id;

        if (!$doctorId || !$date) {
            return response()->json(['available_slots' => []]);
        }

        $query = Appointment::where('doctor_id', $doctorId)
                           ->whereDate('date', $date)
                           ->whereIn('status', ['scheduled', 'confirmed', 'rescheduled']);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $existingAppointments = $query->pluck('time')
                                      ->map(function ($time) {
                                          if ($time instanceof \DateTime) {
                                              return $time->format('H:i');
                                          }
                                          return date('H:i', strtotime($time));
                                      })
                                      ->toArray();

        // Generate available time slots (9 AM to 6 PM, 30-min intervals)
        $allSlots = [];
        $start = strtotime('09:00');
        $end = strtotime('18:00');

        while ($start < $end) {
            $slot = date('H:i', $start);
            if (!in_array($slot, $existingAppointments)) {
                $allSlots[] = $slot;
            }
            $start = strtotime('+30 minutes', $start);
        }

        return response()->json(['available_slots' => $allSlots]);
    }
}