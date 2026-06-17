import { router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Dashboard({ appointments, patients, todayAppointments }) {
    const { flash, auth } = usePage().props;
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        router.post("/logout");
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (auth?.user?.name) {
            return auth.user.name.charAt(0).toUpperCase();
        }
        return "D";
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full">
                <div className="p-5 border-b border-slate-700">
                    <h1 className="text-2xl font-bold">
                        Hospital System
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Doctor Portal
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
                            My Patients
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => setActiveMenu("schedule")}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "schedule" ? "bg-slate-700" : ""
                            }`}
                        >
                            Schedule
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
                                        {auth?.user?.name || "Doctor"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Dr. {auth?.user?.specialization || "General Physician"}
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
                                            {auth?.user?.specialization && (
                                                <p className="text-xs text-cyan-600 mt-1">
                                                    {auth.user.specialization}
                                                </p>
                                            )}
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
                                Welcome, Dr. {auth?.user?.name}
                            </h2>

                            <div className="grid md:grid-cols-4 gap-5 mb-8">
                                <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
                                    <h3>Today's Appointments</h3>
                                    <p className="text-4xl font-bold">
                                        {todayAppointments?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-green-500 text-white p-6 rounded-lg shadow">
                                    <h3>Total Patients</h3>
                                    <p className="text-4xl font-bold">
                                        {patients?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
                                    <h3>Pending Appointments</h3>
                                    <p className="text-4xl font-bold">
                                        {appointments?.filter(apt => apt.status === 'pending').length || 0}
                                    </p>
                                </div>

                                <div className="bg-purple-500 text-white p-6 rounded-lg shadow">
                                    <h3>Completed Today</h3>
                                    <p className="text-4xl font-bold">
                                        {appointments?.filter(apt => apt.status === 'completed').length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Today's Schedule */}
                            <div className="bg-white rounded-lg shadow p-5 mb-6">
                                <h3 className="text-xl font-bold mb-4">
                                    Today's Schedule
                                </h3>
                                
                                {todayAppointments?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
                                ) : (
                                    <div className="space-y-3">
                                        {todayAppointments?.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="flex justify-between items-center border-b py-3"
                                            >
                                                <div>
                                                    <p className="font-semibold">{appointment.patient_name}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        {appointment.time} • {appointment.reason}
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

                            {/* Recent Patients */}
                            <div className="bg-white rounded-lg shadow p-5">
                                <h3 className="text-xl font-bold mb-4">
                                    Recent Patients
                                </h3>
                                
                                {patients?.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No patients assigned yet</p>
                                ) : (
                                    patients?.slice(0, 5).map((patient) => (
                                        <div
                                            key={patient.id}
                                            className="flex justify-between items-center border-b py-3"
                                        >
                                            <div>
                                                <p className="font-semibold">{patient.name}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {patient.email} • {patient.phone || 'No phone'}
                                                </p>
                                            </div>
                                            <button className="bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700 transition text-sm">
                                                View Details
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {/* Appointments View */}
                    {activeMenu === "appointments" && (
                        <div className="bg-white rounded-lg shadow p-5">
                            <h2 className="text-2xl font-bold mb-5">
                                All Appointments
                            </h2>
                            
                            {appointments?.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No appointments found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {appointments?.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{appointment.patient_name}</div>
                                                        <div className="text-sm text-gray-500">{appointment.patient_email}</div>
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
                                                            onChange={(e) => {
                                                                // Update appointment status
                                                                router.put(`/doctor/appointments/${appointment.id}`, {
                                                                    status: e.target.value
                                                                });
                                                            }}
                                                        >
                                                            <option value="scheduled">Scheduled</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button className="text-cyan-600 hover:text-cyan-900 mr-3">
                                                            View
                                                        </button>
                                                        <button className="text-blue-600 hover:text-blue-900">
                                                            Prescription
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
                            <h2 className="text-2xl font-bold mb-5">
                                My Patients
                            </h2>
                            
                            {patients?.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No patients assigned yet</p>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {patients?.map((patient) => (
                                        <div key={patient.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-lg">
                                                    {patient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <button className="text-cyan-600 text-sm hover:underline">
                                                    View History
                                                </button>
                                            </div>
                                            <h3 className="font-semibold text-lg">{patient.name}</h3>
                                            <p className="text-gray-500 text-sm">{patient.email}</p>
                                            <p className="text-gray-500 text-sm">{patient.phone || 'No phone'}</p>
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-sm text-gray-600">
                                                    Last Visit: {patient.last_visit || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Schedule View */}
                    {activeMenu === "schedule" && (
                        <div className="bg-white rounded-lg shadow p-5">
                            <h2 className="text-2xl font-bold mb-5">
                                My Schedule
                            </h2>
                            
                            <div className="grid md:grid-cols-7 gap-2 mb-6">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                    <div key={day} className="border rounded-lg p-3 text-center">
                                        <h4 className="font-semibold">{day}</h4>
                                        <p className="text-sm text-gray-600 mt-2">
                                            9:00 AM - 5:00 PM
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Available
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">Upcoming Appointments</h3>
                                <div className="space-y-2">
                                    {appointments?.filter(apt => apt.status === 'scheduled').slice(0, 5).map((appointment) => (
                                        <div key={appointment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium">{appointment.patient_name}</p>
                                                <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                                            </div>
                                            <button className="bg-cyan-600 text-white px-3 py-1 rounded text-sm">
                                                Start Consultation
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}