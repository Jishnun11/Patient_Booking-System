// resources/js/Pages/Receptionist/Dashboard.jsx
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import PatientManagement from "./PatientManagement";

export default function Dashboard({ doctors, todayAppointments, pendingAppointments, patients: initialPatients, filters }) {
    const { flash, auth } = usePage().props;
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showAddAppointment, setShowAddAppointment] = useState(false);

    // Form states
    const [appointmentForm, setAppointmentForm] = useState({
        patient_id: "",
        doctor_id: "",
        date: "",
        time: "",
        reason: "",
    });

    const handleLogout = () => {
        router.post("/logout");
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (auth?.user?.name) {
            return auth.user.name.charAt(0).toUpperCase();
        }
        return "R";
    };

    const handleInputChange = (e, formType) => {
        if (formType === "appointment") {
            setAppointmentForm({
                ...appointmentForm,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleAddAppointment = (e) => {
        e.preventDefault();
        router.post("/receptionist/appointments", appointmentForm, {
            onSuccess: () => {
                setShowAddAppointment(false);
                setAppointmentForm({
                    patient_id: "",
                    doctor_id: "",
                    date: "",
                    time: "",
                    reason: "",
                });
            },
        });
    };

    const handleUpdateAppointmentStatus = (id, status) => {
        router.put(`/receptionist/appointments/${id}`, { status });
    };

    const handleDeleteAppointment = (id) => {
        if (confirm("Are you sure you want to cancel this appointment?")) {
            router.delete(`/receptionist/appointments/${id}`);
        }
    };

    // Get patients array
    const patients = Array.isArray(initialPatients) ? initialPatients : (initialPatients?.data || []);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full">
                <div className="p-5 border-b border-slate-700">
                    <h1 className="text-2xl font-bold">
                        Hospital System
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Receptionist Portal
                    </p>
                </div>

                <ul className="mt-4">
                    <li>
                        <button
                            onClick={() => setActiveMenu("dashboard")}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "dashboard" ? "bg-slate-700" : ""
                            }`}
                        >
                            Dashboard
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => setActiveMenu("appointments")}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "appointments" ? "bg-slate-700" : ""
                            }`}
                        >
                            Appointments
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => setActiveMenu("patients")}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "patients" ? "bg-slate-700" : ""
                            }`}
                        >
                            Patients
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => setActiveMenu("doctors")}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "doctors" ? "bg-slate-700" : ""
                            }`}
                        >
                            Doctors
                        </button>
                    </li>
                </ul>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-64">
                {/* Top Navigation Bar with Profile */}
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-6 py-3 flex justify-end items-center">
                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-cyan-700 flex items-center justify-center text-white font-semibold">
                                    {getUserInitials()}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-700">
                                        {auth?.user?.name || "Receptionist"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Receptionist
                                    </p>
                                </div>
                                <svg 
                                    className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                        <div className="p-4 border-b border-gray-200">
                                            <p className="font-medium text-gray-800">{auth?.user?.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{auth?.user?.email}</p>
                                        </div>
                                        
                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    router.visit('/change-password');
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    <span>Change Password</span>
                                                </div>
                                            </button>
                                            
                                            <hr className="my-2" />
                                            
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Logout</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="p-6">
                    {flash?.success && (
                        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {flash.error}
                        </div>
                    )}

                    {/* Dashboard View */}
                    {activeMenu === "dashboard" && (
                        <>
                            <h2 className="text-3xl font-bold mb-6">
                                Receptionist Dashboard
                            </h2>

                            <div className="grid md:grid-cols-4 gap-5 mb-8">
                                <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
                                    <h3>Today's Appointments</h3>
                                    <p className="text-4xl font-bold">
                                        {todayAppointments?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
                                    <h3>Pending Appointments</h3>
                                    <p className="text-4xl font-bold">
                                        {pendingAppointments?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-green-500 text-white p-6 rounded-lg shadow">
                                    <h3>Total Patients</h3>
                                    <p className="text-4xl font-bold">
                                        {patients?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-purple-500 text-white p-6 rounded-lg shadow">
                                    <h3>Total Doctors</h3>
                                    <p className="text-4xl font-bold">
                                        {doctors?.length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowAddAppointment(true)}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        >
                                            Schedule Appointment
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-xl font-bold mb-4">Today's Schedule</h3>
                                    {todayAppointments?.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No appointments today</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {todayAppointments?.slice(0, 3).map((appointment) => (
                                                <div key={appointment.id} className="border-b pb-2">
                                                    <p className="font-semibold">{appointment.patient_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {appointment.time} - Dr. {appointment.doctor_name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Appointments */}
                            <div className="bg-white rounded-lg shadow p-5">
                                <h3 className="text-xl font-bold mb-4">
                                    Recent Appointments
                                </h3>
                                
                                {todayAppointments?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No recent appointments</p>
                                ) : (
                                    <div className="space-y-3">
                                        {todayAppointments?.slice(0, 5).map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="flex justify-between items-center border-b py-3"
                                            >
                                                <div>
                                                    <p className="font-semibold">{appointment.patient_name}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        {appointment.time} • Dr. {appointment.doctor_name} • {appointment.reason}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {appointment.status || 'Scheduled'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Appointments View */}
                    {activeMenu === "appointments" && (
                        <div className="bg-white rounded-lg shadow p-5">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-2xl font-bold">
                                    All Appointments
                                </h2>
                                <button
                                    onClick={() => setShowAddAppointment(true)}
                                    className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition"
                                >
                                    + New Appointment
                                </button>
                            </div>
                            
                            {todayAppointments?.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No appointments found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {todayAppointments?.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{appointment.patient_name}</div>
                                                        <div className="text-sm text-gray-500">{appointment.patient_phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Dr. {appointment.doctor_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {appointment.date} <br/>
                                                        {appointment.time}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {appointment.reason}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select 
                                                            value={appointment.status || 'scheduled'}
                                                            className="text-sm border rounded px-2 py-1"
                                                            onChange={(e) => handleUpdateAppointmentStatus(appointment.id, e.target.value)}
                                                        >
                                                            <option value="scheduled">Scheduled</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => handleDeleteAppointment(appointment.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Patients View */}
                    {activeMenu === "patients" && (
                        <div className="bg-white rounded-lg shadow p-5">
                            <PatientManagement 
                                patients={patients} 
                                filters={filters || {}} 
                            />
                        </div>
                    )}

                    {/* Doctors View */}
                    {activeMenu === "doctors" && (
                        <div className="bg-white rounded-lg shadow p-5">
                            <h2 className="text-2xl font-bold mb-5">
                                Doctors
                            </h2>
                            
                            {doctors?.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No doctors available</p>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {doctors?.map((doctor) => (
                                        <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                                                    {doctor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    Available
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg">Dr. {doctor.name}</h3>
                                            <p className="text-gray-500 text-sm">{doctor.email}</p>
                                            <p className="text-gray-500 text-sm">{doctor.phone || 'No phone'}</p>
                                            {doctor.specialization && (
                                                <p className="text-cyan-600 text-sm mt-2 font-medium">
                                                    {doctor.specialization}
                                                </p>
                                            )}
                                            <button className="mt-3 w-full bg-cyan-600 text-white px-3 py-1 rounded text-sm hover:bg-cyan-700 transition">
                                                Schedule Appointment
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Add Appointment Modal */}
            {showAddAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Schedule Appointment</h3>
                        <form onSubmit={handleAddAppointment}>
                            <div className="space-y-3">
                                <select
                                    name="patient_id"
                                    value={appointmentForm.patient_id}
                                    onChange={(e) => handleInputChange(e, "appointment")}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select Patient</option>
                                    {patients?.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="doctor_id"
                                    value={appointmentForm.doctor_id}
                                    onChange={(e) => handleInputChange(e, "appointment")}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors?.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.name} - {doctor.specialization}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    name="date"
                                    value={appointmentForm.date}
                                    onChange={(e) => handleInputChange(e, "appointment")}
                                    className="w-full border p-2 rounded"
                                    required
                                />
                                <input
                                    type="time"
                                    name="time"
                                    value={appointmentForm.time}
                                    onChange={(e) => handleInputChange(e, "appointment")}
                                    className="w-full border p-2 rounded"
                                    required
                                />
                                <textarea
                                    name="reason"
                                    placeholder="Reason for visit"
                                    value={appointmentForm.reason}
                                    onChange={(e) => handleInputChange(e, "appointment")}
                                    className="w-full border p-2 rounded"
                                    rows="2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddAppointment(false)}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                                >
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}