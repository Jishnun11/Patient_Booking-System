// resources/js/Pages/Receptionist/Dashboard.jsx
import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import PatientManagement from "./PatientManagement";
import AppointmentManagement from "./AppointmentManagement";

export default function Dashboard({ 
    doctors, 
    todayAppointments, 
    pendingAppointments, 
    patients: initialPatients, 
    appointments: initialAppointments,
    filters 
}) {
    const { flash, auth } = usePage().props;
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        // Set patients data
        if (Array.isArray(initialPatients)) {
            setPatients(initialPatients);
        } else if (initialPatients?.data) {
            setPatients(initialPatients.data);
        } else {
            setPatients([]);
        }

        // Set appointments data
        if (Array.isArray(initialAppointments)) {
            setAppointments(initialAppointments);
        } else if (initialAppointments?.data) {
            setAppointments(initialAppointments.data);
        } else {
            setAppointments([]);
        }
    }, [initialPatients, initialAppointments]);

    const handleLogout = () => {
        router.post("/logout");
    };

    const getUserInitials = () => {
        if (auth?.user?.name) {
            return auth.user.name.charAt(0).toUpperCase();
        }
        return "R";
    };

    // Just set the active menu without router navigation
    const navigateToAppointments = () => {
        setActiveMenu("appointments");
    };

    const navigateToPatients = () => {
        setActiveMenu("patients");
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar - Always visible */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full overflow-y-auto z-30">
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
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 transition ${
                                activeMenu === "dashboard" ? "bg-slate-700" : ""
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span>Dashboard</span>
                            </div>
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={navigateToPatients}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 transition ${
                                activeMenu === "patients" ? "bg-slate-700" : ""
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Patients</span>
                            </div>
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => setActiveMenu("doctors")}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 transition ${
                                activeMenu === "doctors" ? "bg-slate-700" : ""
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Doctors</span>
                            </div>
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={navigateToAppointments}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 transition ${
                                activeMenu === "appointments" ? "bg-slate-700" : ""
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Appointments</span>
                            </div>
                        </button>
                    </li>

                    <li>
                    <a 
                        href="/receptionist/patient-reports" 
                        className={`w-full text-left px-5 py-3 hover:bg-slate-700 transition`}
                    >
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            <span>Patient Reports</span>
                        </div>
                    </a>
                </li>
                </ul>
            </aside>
            

            {/* Main Content Area */}
            <div className="flex-1 ml-64">
                {/* Top Navigation Bar with Profile */}
                <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="px-6 py-3 flex justify-end items-center">
                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 px-3 py-2 rounded-lg transition"
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
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
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
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
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
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
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
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                            {flash.error}
                        </div>
                    )}

                    {/* Dashboard View */}
                    {activeMenu === "dashboard" && (
                        <>
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">
                                Receptionist Dashboard
                            </h2>

                            <div className="grid md:grid-cols-3 gap-5 mb-8">
                                <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                                    <h3 className="text-sm font-medium opacity-90">Total Patients</h3>
                                    <p className="text-4xl font-bold mt-2">
                                        {patients?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                                    <h3 className="text-sm font-medium opacity-90">Total Doctors</h3>
                                    <p className="text-4xl font-bold mt-2">
                                        {doctors?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                                    <h3 className="text-sm font-medium opacity-90">Pending Appointments</h3>
                                    <p className="text-4xl font-bold mt-2">
                                        {pendingAppointments?.length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow p-6 mb-8">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={navigateToPatients}
                                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Manage Patients
                                    </button>
                                    <button
                                        onClick={navigateToAppointments}
                                        className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
                                    >
                                        Manage Appointments
                                    </button>
                                    <button
                                        onClick={() => setActiveMenu("doctors")}
                                        className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                                    >
                                        View Doctors
                                    </button>
                                </div>
                            </div>

                            {/* Recent Patients */}
                            <div className="bg-white rounded-lg shadow p-5">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">
                                    Recent Patients
                                </h3>
                                
                                {patients?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No patients registered</p>
                                ) : (
                                    <div className="space-y-3">
                                        {patients?.slice(0, 5).map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="flex justify-between items-center border-b py-3 hover:bg-gray-50 px-3 rounded transition"
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-800">{patient.name}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        {patient.email} • {patient.phone || 'No phone'}
                                                    </p>
                                                </div>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                                    Patient
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
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

                    {/* Appointments View */}
                    {activeMenu === "appointments" && (
                        <div className="bg-white rounded-lg shadow p-5">
                            <AppointmentManagement 
                                appointments={initialAppointments || []} 
                                patients={patients || []}
                                doctors={doctors || []}
                                filters={filters || {}}
                            />
                        </div>
                    )}

                    {/* Doctors View */}
                    {activeMenu === "doctors" && (
                        <div className="bg-white rounded-lg shadow p-5">
                            <h2 className="text-2xl font-bold mb-5 text-gray-800">
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
                                                    {doctor.name?.charAt(0).toUpperCase() || 'D'}
                                                </div>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    Available
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg text-gray-800">Dr. {doctor.name}</h3>
                                            <p className="text-gray-500 text-sm">{doctor.email}</p>
                                            <p className="text-gray-500 text-sm">{doctor.phone || 'No phone'}</p>
                                            {doctor.specialization && (
                                                <p className="text-cyan-600 text-sm mt-2 font-medium">
                                                    {doctor.specialization}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}