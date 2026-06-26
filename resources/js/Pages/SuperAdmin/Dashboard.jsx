import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import BranchManagement from "./BranchManagement";
import DepartmentManagement from "./DepartmentManagement";
import DoctorManagement from "./DoctorManagement"; // Import the DoctorManagement component

export default function Dashboard({ doctors, receptionists, branches, departments }) {
    const { flash, errors: serverErrors, auth } = usePage().props;
    
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [validationErrors, setValidationErrors] = useState({});
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        phone: "",
    });

    // Clear validation errors when form data changes
    useEffect(() => {
        if (validationErrors[Object.keys(validationErrors)[0]]) {
            setValidationErrors({});
        }
    }, [formData]);

    // Client-side validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return "Email is required";
        if (!emailRegex.test(email)) return "Please enter a valid email address (e.g., user@example.com)";
        return null;
    };

    const validatePassword = (password) => {
        if (!password) return "Password is required";
        if (password.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(password)) return "Password must contain at least one number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
        return null;
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (phone && !phoneRegex.test(phone)) return "Please enter a valid phone number (10-15 digits)";
        return null;
    };

    const validateName = (name) => {
        if (!name) return "Name is required";
        if (name.length < 2) return "Name must be at least 2 characters";
        if (name.length > 100) return "Name must be less than 100 characters";
        return null;
    };

    const validateForm = () => {
        const errors = {};
        
        const nameError = validateName(formData.name);
        if (nameError) errors.name = nameError;
        
        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;
        
        const passwordError = validatePassword(formData.password);
        if (passwordError) errors.password = passwordError;
        
        if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = "Passwords do not match";
        }
        
        const phoneError = validatePhone(formData.phone);
        if (phoneError) errors.phone = phoneError;
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogout = () => {
        router.post("/logout");
    };

    const handleAddReceptionist = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const { password_confirmation, ...submitData } = formData;
        
        router.post("/super-admin/receptionists", submitData, {
            onSuccess: () => {
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    password_confirmation: "",
                    phone: "",
                });
                setValidationErrors({});
                setActiveMenu("dashboard");
            },
            onError: (errors) => {
                setValidationErrors(errors);
            }
        });
    };

    const handleDeleteUser = (id, type) => {
        const userType = type === 'doctor' ? 'Doctor' : 'Receptionist';
        if (confirm(`Are you sure you want to delete this ${userType}? This action cannot be undone.`)) {
            router.delete(`/super-admin/users/${id}`);
        }
    };

    const renderError = (field) => {
        const error = validationErrors[field] || serverErrors?.[field];
        if (error) {
            return <p className="text-red-500 text-sm mt-1">{error}</p>;
        }
        return null;
    };

    const getUserInitials = () => {
        if (auth?.user?.name) {
            return auth.user.name.charAt(0).toUpperCase();
        }
        return "A";
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full overflow-y-auto">
                <div className="p-5 border-b border-slate-700">
                    <h1 className="text-2xl font-bold">
                        Hospital System
                    </h1>
                </div>

                <ul className="mt-4">
                    <li>
                        <button
                            onClick={() => {
                                setActiveMenu("dashboard");
                                setValidationErrors({});
                            }}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "dashboard"
                                    ? "bg-slate-700"
                                    : ""
                            }`}
                        >
                            Dashboard
                        </button>
                    </li>

                    {/* Doctor Management Menu Item */}
                    <li>
                        <button
                            onClick={() => {
                                setActiveMenu("doctors");
                                setValidationErrors({});
                            }}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "doctors"
                                    ? "bg-slate-700"
                                    : ""
                            }`}
                        >
                            Doctor Management
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => {
                                setActiveMenu("receptionist");
                                setValidationErrors({});
                            }}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "receptionist"
                                    ? "bg-slate-700"
                                    : ""
                            }`}
                        >
                            Add Receptionist
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => {
                                setActiveMenu("branches");
                                setValidationErrors({});
                            }}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "branches"
                                    ? "bg-slate-700"
                                    : ""
                            }`}
                        >
                            Branch Management
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => {
                                setActiveMenu("departments");
                                setValidationErrors({});
                            }}
                            className={`w-full text-left px-5 py-3 hover:bg-slate-700 ${
                                activeMenu === "departments"
                                    ? "bg-slate-700"
                                    : ""
                            }`}
                        >
                            Department Management
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
                                        {auth?.user?.name || "Admin"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {auth?.user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Super Admin"}
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

                    {/* Dashboard */}
                    {activeMenu === "dashboard" && (
                        <>
                            <h2 className="text-3xl font-bold mb-6">
                                Dashboard
                            </h2>

                            <div className="grid md:grid-cols-3 gap-5 mb-8">
                                <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
                                    <h3>Total Doctors</h3>
                                    <p className="text-4xl font-bold">
                                        {doctors?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-green-500 text-white p-6 rounded-lg shadow">
                                    <h3>Receptionists</h3>
                                    <p className="text-4xl font-bold">
                                        {receptionists?.length || 0}
                                    </p>
                                </div>

                                <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
                                    <h3>Patients</h3>
                                    <p className="text-4xl font-bold">
                                        0
                                    </p>
                                </div>
                            </div>

                            {/* Doctors List */}
                            <div className="bg-white rounded-lg shadow p-5 mb-6">
                                <h3 className="text-xl font-bold mb-4">
                                    Doctors
                                </h3>
                                
                                {!doctors || doctors.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No doctors added yet</p>
                                ) : (
                                    doctors.map((doctor) => (
                                        <div
                                            key={doctor.id}
                                            className="flex justify-between items-center border-b py-3"
                                        >
                                            <div>
                                                <p className="font-semibold">Dr. {doctor.name}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {doctor.email} • {doctor.doctor?.phone || 'No phone'} 
                                                    {doctor.doctor?.specialization && ` • ${doctor.doctor.specialization}`}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(doctor.id, 'doctor')
                                                }
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Receptionists */}
                            <div className="bg-white rounded-lg shadow p-5">
                                <h3 className="text-xl font-bold mb-4">
                                    Receptionists
                                </h3>
                                
                                {!receptionists || receptionists.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No receptionists added yet</p>
                                ) : (
                                    receptionists.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center border-b py-3"
                                        >
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {item.email} • {item.phone || 'No phone'}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(item.id, 'receptionist')
                                                }
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}



                    {/* Receptionist Form */}
                    {activeMenu === "receptionist" && (
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-2xl font-bold mb-5">
                                Add Receptionist
                            </h2>

                            <form
                                onSubmit={handleAddReceptionist}
                                className="space-y-4"
                            >
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Receptionist Name *"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full border p-3 rounded ${
                                            validationErrors.name || serverErrors?.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {renderError('name')}
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email *"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full border p-3 rounded ${
                                            validationErrors.email || serverErrors?.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {renderError('email')}
                                </div>

                                <div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password * (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full border p-3 rounded ${
                                            validationErrors.password || serverErrors?.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {renderError('password')}
                                </div>

                                <div>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        placeholder="Confirm Password *"
                                        value={formData.password_confirmation}
                                        onChange={handleInputChange}
                                        className={`w-full border p-3 rounded ${
                                            validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {renderError('password_confirmation')}
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full border p-3 rounded ${
                                            validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {renderError('phone')}
                                </div>

                                <button 
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                                >
                                    Save Receptionist
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Branch Management */}
                    {activeMenu === "branches" && (
                        <BranchManagement 
                            branches={branches || []} 
                            departments={departments || []} 
                        />
                    )}

                    {/* Department Management */}
                    {activeMenu === "departments" && (
                        <DepartmentManagement 
                            departments={departments || []} 
                            branches={branches || []} 
                        />
                    )}
                    {/* Doctor Management */}
                    {activeMenu === "doctors" && (
                        <DoctorManagement 
                            doctors={{ data: doctors || [] }}  // Wrap in data property
                            branches={branches || []} 
                            departments={departments || []} 
                        />
                    )}
                </main>
            </div>
        </div>
    );
}