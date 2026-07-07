import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { format } from 'date-fns';

export default function PatientReport({ patients, filters, totalPatients, todayRegistrations, thisMonthRegistrations }) {
    const { auth, flash } = usePage().props;
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [isExporting, setIsExporting] = useState(false);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const getUserInitials = () => {
        if (auth?.user?.name) {
            return auth.user.name.charAt(0).toUpperCase();
        }
        return "R";
    };

    const handleLogout = () => {
        router.post("/logout");
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        router.get('/receptionist/patient-reports?' + params.toString(), {}, { preserveState: true });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = () => {
        applyFilters();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        router.get('/receptionist/patient-reports', {}, { preserveState: true });
    };

    const handleExportExcel = () => {
        setIsExporting(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        window.location.href = '/receptionist/patient-reports/export?' + params.toString();
        setTimeout(() => setIsExporting(false), 2000);
    };

    const handleExportPdf = () => {
        setIsExporting(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        window.location.href = '/receptionist/patient-reports/export-pdf?' + params.toString();
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full overflow-y-auto z-30">
                <div className="p-5 border-b border-slate-700">
                    <h1 className="text-2xl font-bold">Hospital System</h1>
                    <p className="text-sm text-gray-400 mt-2">Receptionist Portal</p>
                </div>

                <ul className="mt-4">
                    <li>
                        <a href="/receptionist/dashboard" className="block px-5 py-3 hover:bg-slate-700 transition">
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span>Dashboard</span>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="/receptionist/patient-reports" className="block px-5 py-3 bg-slate-700 hover:bg-slate-700 transition">
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
                {/* Top Navigation Bar */}
                <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="px-6 py-3 flex justify-end items-center">
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
                                    <p className="text-xs text-gray-500">Receptionist</p>
                                </div>
                                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                                        <div className="p-4 border-b border-gray-200">
                                            <p className="font-medium text-gray-800">{auth?.user?.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{auth?.user?.email}</p>
                                        </div>
                                        <div className="py-2">
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

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Patient Registration Report</h2>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid md:grid-cols-3 gap-5 mb-8">
                        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <h3 className="text-sm font-medium opacity-90">Total Patients</h3>
                            <p className="text-4xl font-bold mt-2">{totalPatients || 0}</p>
                        </div>

                        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <h3 className="text-sm font-medium opacity-90">Today's Registrations</h3>
                            <p className="text-4xl font-bold mt-2">{todayRegistrations || 0}</p>
                        </div>

                        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                            <h3 className="text-sm font-medium opacity-90">This Month</h3>
                            <p className="text-4xl font-bold mt-2">{thisMonthRegistrations || 0}</p>
                        </div>
                    </div>

                    {/* Filters and Export Section */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="grid md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search by name, email, phone..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    onBlur={handleDateChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onBlur={handleDateChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    disabled={isExporting}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {isExporting ? 'Exporting...' : 'Export Excel'}
                                </button>
                                <button
                                    onClick={handleExportPdf}
                                    disabled={isExporting}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {isExporting ? 'Exporting...' : 'Export PDF'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Patients Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {patients?.data?.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                No patients found
                                            </td>
                                        </tr>
                                    ) : (
                                        patients?.data?.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(patient.created_at), 'dd/MM/yyyy HH:mm')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {patients?.links && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-700">
                                        Showing {patients.from || 0} to {patients.to || 0} of {patients.total || 0} results
                                    </p>
                                    <div className="flex space-x-2">
                                        {patients.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (link.url && !link.active) {
                                                        router.get(link.url, {}, { preserveState: true });
                                                    }
                                                }}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1 rounded border ${
                                                    link.active 
                                                        ? 'bg-blue-500 text-white border-blue-500' 
                                                        : link.url 
                                                            ? 'hover:bg-gray-50 border-gray-300 text-gray-700' 
                                                            : 'text-gray-400 cursor-not-allowed border-gray-200'
                                                }`}
                                                disabled={!link.url || link.active}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}