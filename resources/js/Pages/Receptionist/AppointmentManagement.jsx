// resources/js/Pages/Receptionist/AppointmentManagement.jsx
import { router, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

export default function AppointmentManagement({ appointments: initialAppointments, patients, doctors, filters: initialFilters }) {
    const { flash, props } = usePage();
    const serverErrors = props?.errors || {};
    
    const [validationErrors, setValidationErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "");
    const [selectedStatus, setSelectedStatus] = useState(initialFilters?.status || "");
    const [selectedDate, setSelectedDate] = useState(initialFilters?.date || "");
    const [selectedPatient, setSelectedPatient] = useState(initialFilters?.patient_id || "");
    const [selectedDoctor, setSelectedDoctor] = useState(initialFilters?.doctor_id || "");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusAppointment, setStatusAppointment] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [cancellationReason, setCancellationReason] = useState("");
    
    // Initialize appointments state properly
    const [appointments, setAppointments] = useState(() => {
        if (!initialAppointments) return [];
        
        if (Array.isArray(initialAppointments)) {
            return initialAppointments;
        }
        
        if (initialAppointments.data) {
            return initialAppointments.data;
        }
        
        return [];
    });
    
    const [pagination, setPagination] = useState(() => {
        if (!initialAppointments) {
            return {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
                from: 0,
                to: 0,
                links: []
            };
        }
        
        if (initialAppointments.data) {
            return {
                current_page: initialAppointments.current_page || 1,
                last_page: initialAppointments.last_page || 1,
                per_page: initialAppointments.per_page || 10,
                total: initialAppointments.total || 0,
                from: initialAppointments.from || 0,
                to: initialAppointments.to || 0,
                links: initialAppointments.links || []
            };
        }
        
        return {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: initialAppointments.length || 0,
            from: 1,
            to: initialAppointments.length || 0,
            links: []
        };
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const isInitialRender = useRef(true);
    const debounceTimer = useRef(null);

    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        date: "",
        time: "",
        reason: "",
        notes: "",
    });

    // Fetch appointments with filters - MODIFIED to preserve sidebar
    const fetchAppointments = (search = searchTerm, status = selectedStatus, date = selectedDate, patient = selectedPatient, doctor = selectedDoctor) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        setIsLoading(true);
        
        const params = {};
        if (search && search.trim() !== '') params.search = search.trim();
        if (status && status.trim() !== '') params.status = status.trim();
        if (date && date.trim() !== '') params.date = date.trim();
        if (patient && patient.trim() !== '') params.patient_id = patient.trim();
        if (doctor && doctor.trim() !== '') params.doctor_id = doctor.trim();

        router.get(
            '/receptionist/appointments',
            params,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                // REMOVE the 'only' option to keep full page layout with sidebar
                // only: ['appointments', 'filters'],
                onSuccess: (page) => {
                    const appointmentsData = page.props.appointments;
                    console.log("Fetched appointments:", appointmentsData);
                    
                    if (Array.isArray(appointmentsData)) {
                        setAppointments(appointmentsData);
                        setPagination({
                            current_page: 1,
                            last_page: 1,
                            per_page: appointmentsData.length,
                            total: appointmentsData.length,
                            from: 1,
                            to: appointmentsData.length,
                            links: []
                        });
                    } else if (appointmentsData && appointmentsData.data) {
                        setAppointments(appointmentsData.data);
                        setPagination({
                            current_page: appointmentsData.current_page || 1,
                            last_page: appointmentsData.last_page || 1,
                            per_page: appointmentsData.per_page || 10,
                            total: appointmentsData.total || 0,
                            from: appointmentsData.from || 0,
                            to: appointmentsData.to || 0,
                            links: appointmentsData.links || []
                        });
                    } else {
                        setAppointments([]);
                    }
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error('Error fetching appointments:', errors);
                    setIsLoading(false);
                }
            }
        );
    };

    // Handle filter changes with debounce
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchAppointments(searchTerm, selectedStatus, selectedDate, selectedPatient, selectedDoctor);
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchTerm, selectedStatus, selectedDate, selectedPatient, selectedDoctor]);

    // Fetch available slots
    const fetchAvailableSlots = async () => {
        if (!formData.doctor_id || !formData.date) {
            setAvailableSlots([]);
            return;
        }
        
        setLoadingSlots(true);
        try {
            const response = await fetch(
                `/receptionist/appointments/available-slots?doctor_id=${formData.doctor_id}&date=${formData.date}&exclude_id=${editingId || ''}`
            );
            const data = await response.json();
            setAvailableSlots(data.available_slots || []);
        } catch (error) {
            console.error("Error fetching available slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (formData.doctor_id && formData.date) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots([]);
        }
    }, [formData.doctor_id, formData.date]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (name === 'doctor_id' || name === 'date') {
            setAvailableSlots([]);
        }
    };

    const resetForm = () => {
        setFormData({
            patient_id: "",
            doctor_id: "",
            date: "",
            time: "",
            reason: "",
            notes: "",
        });
        setIsEditing(false);
        setEditingId(null);
        setValidationErrors({});
        setShowForm(false);
        setAvailableSlots([]);
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.patient_id) errors.patient_id = "Please select a patient";
        if (!formData.doctor_id) errors.doctor_id = "Please select a doctor";
        if (!formData.date) errors.date = "Please select a date";
        if (!formData.time) errors.time = "Please select a time";
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const url = isEditing 
            ? `/receptionist/appointments/${editingId}` 
            : "/receptionist/appointments";
        
        const method = isEditing ? "put" : "post";
        
        router[method](url, formData, {
            preserveState: true,
            preserveScroll: true,
            // REMOVE the 'only' option to keep full page layout with sidebar
            // only: ['flash', 'appointments'],
            onSuccess: (page) => {
                resetForm();
                // Refresh the list
                fetchAppointments(searchTerm, selectedStatus, selectedDate, selectedPatient, selectedDoctor);
            },
            onError: (errors) => {
                console.error("Form errors:", errors);
                setValidationErrors(errors);
            }
        });
    };

    const handleEdit = (appointment) => {
        setFormData({
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            date: appointment.date,
            time: appointment.time,
            reason: appointment.reason || "",
            notes: appointment.notes || "",
        });
        setIsEditing(true);
        setEditingId(appointment.id);
        setValidationErrors({});
        setShowForm(true);
        // Scroll to form
        setTimeout(() => {
            document.getElementById('appointment-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // MODIFIED: Status update - preserve sidebar
    const handleStatusUpdate = (appointment, status) => {
        if (status === 'cancelled') {
            setStatusAppointment(appointment);
            setNewStatus(status);
            setShowStatusModal(true);
        } else {
            router.put(`/receptionist/appointments/${appointment.id}/status`, { status }, {
                preserveState: true,
                preserveScroll: true,
                // REMOVE the 'only' option
                // only: ['flash', 'appointments'],
                onSuccess: (page) => {
                    fetchAppointments(searchTerm, selectedStatus, selectedDate, selectedPatient, selectedDoctor);
                }
            });
        }
    };

    // MODIFIED: Confirm status update - preserve sidebar
    const confirmStatusUpdate = () => {
        if (!statusAppointment) return;
        
        router.put(`/receptionist/appointments/${statusAppointment.id}/status`, {
            status: newStatus,
            cancellation_reason: cancellationReason
        }, {
            preserveState: true,
            preserveScroll: true,
            // REMOVE the 'only' option
            // only: ['flash', 'appointments'],
            onSuccess: (page) => {
                setShowStatusModal(false);
                setStatusAppointment(null);
                setCancellationReason("");
                fetchAppointments(searchTerm, selectedStatus, selectedDate, selectedPatient, selectedDoctor);
            }
        });
    };

    // MODIFIED: Delete - preserve sidebar
    const handleDelete = (id, patientName) => {
        if (confirm(`Delete appointment for "${patientName}"? This action cannot be undone.`)) {
            router.delete(`/receptionist/appointments/${id}`, {
                preserveState: true,
                preserveScroll: true,
                // REMOVE the 'only' option
                // only: ['flash', 'appointments'],
                onSuccess: (page) => {
                    fetchAppointments(searchTerm, selectedStatus, selectedDate, selectedPatient, selectedDoctor);
                }
            });
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setSelectedStatus("");
        setSelectedDate("");
        setSelectedPatient("");
        setSelectedDoctor("");
        fetchAppointments("", "", "", "", "");
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            rescheduled: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Scheduled';
    };

    const renderError = (field) => {
        const error = validationErrors[field] || serverErrors?.[field];
        if (error) {
            return <p className="text-red-500 text-sm mt-1">{error}</p>;
        }
        return null;
    };

    const renderFlashMessage = () => {
        if (flash?.success) {
            return (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4">
                    {flash.success}
                </div>
            );
        }
        if (flash?.error) {
            return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                    {flash.error}
                </div>
            );
        }
        return null;
    };

    // Format time for display
    const formatTime = (time) => {
        if (!time) return '';
        if (typeof time === 'string' && time.includes(':')) {
            return time.substring(0, 5);
        }
        return time;
    };

    return (
        <div className="space-y-6">
            {renderFlashMessage()}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Total Appointments: {pagination?.total || appointments?.length || 0}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                            setIsEditing(false);
                            setFormData({
                                patient_id: "",
                                doctor_id: "",
                                date: "",
                                time: "",
                                reason: "",
                                notes: "",
                            });
                            setValidationErrors({});
                            setAvailableSlots([]);
                        }
                    }}
                    className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                    {showForm ? "Cancel" : "+ Book Appointment"}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        type="text"
                        placeholder="Search by patient or doctor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                    </select>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    <select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Patients</option>
                        {patients?.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                                {patient.name} ({patient.patient_code})
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">All Doctors</option>
                        {doctors?.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                Dr. {doctor.name}
                            </option>
                        ))}
                    </select>

                    <div className="md:col-span-5 flex gap-2">
                        <button
                            type="button"
                            onClick={() => fetchAppointments(searchTerm, selectedStatus, selectedDate, selectedPatient, selectedDoctor)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                            Apply Filters
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Appointment Form */}
            {showForm && (
                <div id="appointment-form" className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                        {isEditing ? "Edit Appointment" : "Book New Appointment"}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleInputChange}
                                    disabled={isEditing}
                                    className={`w-full border ${
                                        validationErrors.patient_id || serverErrors?.patient_id
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isEditing ? 'bg-gray-50' : ''}`}
                                >
                                    <option value="">Select Patient</option>
                                    {patients?.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} ({patient.patient_code})
                                        </option>
                                    ))}
                                </select>
                                {renderError('patient_id')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.doctor_id || serverErrors?.doctor_id
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors?.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.name} - {doctor.specialization}
                                        </option>
                                    ))}
                                </select>
                                {renderError('doctor_id')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full border ${
                                        validationErrors.date || serverErrors?.date
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                />
                                {renderError('date')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Time <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    disabled={loadingSlots || !formData.doctor_id || !formData.date}
                                    className={`w-full border ${
                                        validationErrors.time || serverErrors?.time
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                >
                                    <option value="">{loadingSlots ? 'Loading...' : 'Select Time'}</option>
                                    {availableSlots.map((slot) => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                                {renderError('time')}
                                {!loadingSlots && formData.doctor_id && formData.date && availableSlots.length === 0 && !validationErrors.time && (
                                    <p className="text-sm text-red-500 mt-1">No available slots for this doctor on this date</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason
                                </label>
                                <input
                                    type="text"
                                    name="reason"
                                    placeholder="Reason for visit"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    placeholder="Additional notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-medium transition"
                            >
                                {isEditing ? "Update Appointment" : "Book Appointment"}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Appointments Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PATIENT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DOCTOR
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DATE & TIME
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    STATUS
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-700"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : !appointments || appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No appointments found
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{appointment.patient_name}</div>
                                            <div className="text-sm text-gray-500">{appointment.patient_code}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">Dr. {appointment.doctor_name}</div>
                                            <div className="text-sm text-gray-500">{appointment.doctor_specialization}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{appointment.date}</div>
                                            <div className="text-sm text-gray-500">{formatTime(appointment.time)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                {getStatusLabel(appointment.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(appointment)}
                                                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(appointment, 'confirmed')}
                                                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(appointment, 'cancelled')}
                                                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(appointment, 'completed')}
                                                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                                                        >
                                                            Complete
                                                        </button>
                                                    </>
                                                )}
                                                {appointment.status === 'cancelled' && (
                                                    <button
                                                        onClick={() => handleDelete(appointment.id, appointment.patient_name)}
                                                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {pagination.links && pagination.links.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0}
                            </div>
                            <div className="flex space-x-2">
                                {pagination.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    // REMOVE the 'only' option for pagination too
                                                    // only: ['appointments']
                                                });
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active ? 'bg-cyan-700 text-white' :
                                            link.url ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' :
                                            'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                        disabled={!link.url}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showStatusModal && statusAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Cancel Appointment</h3>
                        <p className="text-gray-600 mb-4">
                            Cancel appointment for <strong>{statusAppointment.patient_name}</strong>?
                        </p>
                        <textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Reason for cancellation"
                            rows="3"
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={confirmStatusUpdate}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex-1 transition"
                            >
                                Confirm Cancellation
                            </button>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium flex-1 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}