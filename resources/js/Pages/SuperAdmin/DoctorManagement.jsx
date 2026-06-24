import { router, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

export default function DoctorManagement({ doctors: initialDoctors, branches, departments, filters: initialFilters }) {
    const { flash, errors: serverErrors } = usePage().props;
    const [validationErrors, setValidationErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "");
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || "");
    
    // Handle both array and paginated data formats
    const [doctors, setDoctors] = useState(() => {
        if (Array.isArray(initialDoctors)) {
            return initialDoctors;
        }
        return initialDoctors?.data || [];
    });
    
    const [isLoading, setIsLoading] = useState(false);

    // Track if it's the initial render
    const isInitialRender = useRef(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        branch_id: '',
        department_id: '',
        specialization: '',
        is_active: true
    });

    // Clear validation errors when form data changes
    useEffect(() => {
        if (validationErrors[Object.keys(validationErrors)[0]]) {
            setValidationErrors({});
        }
    }, [formData]);

    // Fetch doctors with filters - only for search/filter
    const fetchDoctors = (search = searchTerm, status = statusFilter) => {
        setIsLoading(true);
        const params = new URLSearchParams({
            ...(search && { search }),
            ...(status && { status })
        });
        
        router.get(`/super-admin/doctors?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['doctors', 'filters'],
            onSuccess: (page) => {
                const doctorsData = page.props.doctors;
                if (Array.isArray(doctorsData)) {
                    setDoctors(doctorsData);
                } else {
                    setDoctors(doctorsData?.data || []);
                }
                setIsLoading(false);
            },
            onError: (errors) => {
                console.error('Error fetching doctors:', errors);
                setIsLoading(false);
            }
        });
    };

    // Handle search with debounce - ONLY when user changes filters, not on initial render
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        
        const timer = setTimeout(() => {
            fetchDoctors(searchTerm, statusFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    // Client-side validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return "Email is required";
        if (!emailRegex.test(email)) return "Please enter a valid email address";
        return null;
    };

    const validatePassword = (password) => {
        if (!isEditing && !password) return "Password is required";
        if (password && password.length < 8) return "Password must be at least 8 characters";
        if (password && !/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
        if (password && !/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
        if (password && !/[0-9]/.test(password)) return "Password must contain at least one number";
        return null;
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name) errors.name = "Name is required";
        if (formData.name && formData.name.length < 2) errors.name = "Name must be at least 2 characters";
        
        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;
        
        const passwordError = validatePassword(formData.password);
        if (passwordError) errors.password = passwordError;
        
        if (formData.password && formData.password !== formData.password_confirmation) {
            errors.password_confirmation = "Passwords do not match";
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            phone: '',
            branch_id: '',
            department_id: '',
            specialization: '',
            is_active: true
        });
        setIsEditing(false);
        setEditingId(null);
        setValidationErrors({});
        setShowForm(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const submitData = {
            ...formData,
            is_active: formData.is_active ? 1 : 0
        };

        if (isEditing && !submitData.password) {
            delete submitData.password;
            delete submitData.password_confirmation;
        }

        const url = isEditing
            ? `/super-admin/doctors/${editingId}`
            : '/super-admin/doctors';
        
        const method = isEditing ? 'put' : 'post';

        router[method](url, submitData, {
            preserveState: true,
            preserveScroll: true,
            only: ['flash', 'doctors'],
            onSuccess: (page) => {
                resetForm();
                // Update the doctors list from the response
                const doctorsData = page.props.doctors;
                if (Array.isArray(doctorsData)) {
                    setDoctors(doctorsData);
                } else {
                    setDoctors(doctorsData?.data || []);
                }
                // Show success message
                if (page.props.flash?.success) {
                    // Flash message will be displayed by renderFlashMessage
                }
            },
            onError: (errors) => {
                setValidationErrors(errors);
            }
        });
    };

    const handleEdit = (doctor) => {
        const doctorData = doctor.doctor || {};
        
        setFormData({
            name: doctor.name || '',
            email: doctor.email || '',
            password: '',
            password_confirmation: '',
            phone: doctorData.phone || '',
            branch_id: doctorData.branch_id || '',
            department_id: doctorData.department_id || '',
            specialization: doctorData.specialization || '',
            is_active: doctorData.is_active !== undefined ? doctorData.is_active : true
        });
        setIsEditing(true);
        setEditingId(doctorData.id || doctor.id);
        setValidationErrors({});
        setShowForm(true);
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete Dr. ${name}? This action cannot be undone.`)) {
            router.delete(`/super-admin/doctors/${id}`, {
                preserveState: true,
                preserveScroll: true,
                only: ['flash', 'doctors'],
                onSuccess: (page) => {
                    // Update the doctors list from the response
                    const doctorsData = page.props.doctors;
                    if (Array.isArray(doctorsData)) {
                        setDoctors(doctorsData);
                    } else {
                        setDoctors(doctorsData?.data || []);
                    }
                }
            });
        }
    };

    const handleToggleStatus = (doctor) => {
        const doctorData = doctor.doctor || {};
        const action = doctorData.is_active ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} Dr. ${doctor.name || 'this doctor'}?`)) {
            router.post(`/super-admin/doctors/${doctorData.id}/toggle-status`, {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['flash', 'doctors'],
                onSuccess: (page) => {
                    // Update the doctors list from the response
                    const doctorsData = page.props.doctors;
                    if (Array.isArray(doctorsData)) {
                        setDoctors(doctorsData);
                    } else {
                        setDoctors(doctorsData?.data || []);
                    }
                }
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors(searchTerm, statusFilter);
    };

    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("");
        fetchDoctors("", "");
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

    const getStatusBadge = (isActive) => {
        return isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getBranchName = (branchId) => {
        if (!branchId) return 'N/A';
        const branch = branches?.find(b => b.id === branchId);
        return branch?.branch_name || branch?.name || 'N/A';
    };

    const getDepartmentName = (departmentId) => {
        if (!departmentId) return 'N/A';
        const department = departments?.find(d => d.id === departmentId);
        return department?.department_name || department?.name || 'N/A';
    };

    return (
        <div className="space-y-6">
            {renderFlashMessage()}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Doctor Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                    {showForm ? "Cancel" : "+ Add Doctor"}
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        placeholder="Search by name, email, or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-[200px] border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                        Reset
                    </button>
                </form>
            </div>

            {/* Doctor Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                        {isEditing ? "Edit Doctor" : "Add New Doctor"}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter doctor's full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.name || serverErrors?.name
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('name')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.email || serverErrors?.email
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('email')}
                            </div>

                            {!isEditing && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full border ${
                                                validationErrors.password ? 'border-red-500' : 'border-gray-300'
                                            } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                        />
                                        {renderError('password')}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            placeholder="Confirm password"
                                            value={formData.password_confirmation}
                                            onChange={handleInputChange}
                                            className={`w-full border ${
                                                validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                            } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                        />
                                        {renderError('password_confirmation')}
                                    </div>
                                </>
                            )}

                            {isEditing && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password <span className="text-gray-500 text-xs">(leave blank to keep current)</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter new password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    name="specialization"
                                    placeholder="Enter specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Branch
                                </label>
                                <select
                                    name="branch_id"
                                    value={formData.branch_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Select Branch</option>
                                    {branches?.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.branch_name || branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <select
                                    name="department_id"
                                    value={formData.department_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    {departments?.map(department => (
                                        <option key={department.id} value={department.id}>
                                            {department.department_name || department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-cyan-700 border-gray-300 rounded focus:ring-cyan-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Active
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                            <button
                                type="submit"
                                className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-medium transition"
                            >
                                {isEditing ? "Update Doctor" : "Save Doctor"}
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

            {/* Doctors Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DOCTOR NAME
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CONTACT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SPECIALIZATION
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    BRANCH
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DEPARTMENT
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
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-700"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : doctors.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No doctors found
                                    </td>
                                </tr>
                            ) : (
                                doctors.map((doctor, index) => {
                                    const doctorData = doctor.doctor || {};
                                    
                                    return (
                                        <tr key={doctor.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-500">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    Dr. {doctor.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">
                                                    {doctorData.phone || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {doctor.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">
                                                    {doctorData.specialization || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">
                                                    {getBranchName(doctorData.branch_id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-700">
                                                    {getDepartmentName(doctorData.department_id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    getStatusBadge(doctorData.is_active)
                                                }`}>
                                                    {doctorData.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(doctor)}
                                                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleToggleStatus(doctor)}
                                                        className={`px-3 py-1 text-xs text-white rounded transition ${
                                                            doctorData.is_active
                                                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                                                : 'bg-green-500 hover:bg-green-600'
                                                        }`}
                                                    >
                                                        {doctorData.is_active ? 'Deactivate' : 'Activate'}
                                                    </button> */}
                                                    <button
                                                        onClick={() => handleDelete(doctorData.id, doctor.name || '')}
                                                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}