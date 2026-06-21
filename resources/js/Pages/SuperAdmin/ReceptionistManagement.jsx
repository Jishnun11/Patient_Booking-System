// resources/js/Pages/SuperAdmin/ReceptionistManagement.jsx

import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function ReceptionistManagement({ receptionists = [], branches = [], filters = {} }) {
    const { flash, errors: serverErrors } = usePage().props;
    const [validationErrors, setValidationErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [filterBranch, setFilterBranch] = useState(filters?.branch_id || '');
    const [filterShift, setFilterShift] = useState(filters?.shift || '');
    const [filterStatus, setFilterStatus] = useState(filters?.status || '');
    const [showForm, setShowForm] = useState(false);
    const [flashMessage, setFlashMessage] = useState(null);
    
    // Handle both array and paginated data structures
    let receptionistsData = [];
    let paginationData = null;
    
    if (Array.isArray(receptionists)) {
        receptionistsData = receptionists;
    } else if (receptionists && typeof receptionists === 'object') {
        receptionistsData = receptionists.data || [];
        paginationData = receptionists;
    }
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        shift: 'morning',
        branch_id: '',
        is_active: true,
    });

    const shifts = [
        { value: 'morning', label: 'Morning (8:00 AM - 2:00 PM)' },
        { value: 'afternoon', label: 'Afternoon (2:00 PM - 8:00 PM)' },
        { value: 'night', label: 'Night (8:00 PM - 8:00 AM)' },
    ];

    // Handle flash messages with auto-dismiss
    useEffect(() => {
        if (flash?.success) {
            setFlashMessage({ type: 'success', message: flash.success });
            const timer = setTimeout(() => {
                setFlashMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setFlashMessage({ type: 'error', message: flash.error });
            const timer = setTimeout(() => {
                setFlashMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Clear validation errors when form data changes
    useEffect(() => {
        if (validationErrors[Object.keys(validationErrors)[0]]) {
            setValidationErrors({});
        }
    }, [formData]);

    // Client-side validation functions
    const validateName = (name) => {
        if (!name) return "Name is required";
        if (name.length < 2) return "Name must be at least 2 characters";
        if (name.length > 255) return "Name must be less than 255 characters";
        return null;
    };

    const validateEmail = (email) => {
        if (!email) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return "Please enter a valid email address";
        }
        return null;
    };

    const validatePassword = (password) => {
        if (!isEditing && !password) return "Password is required";
        if (password && password.length < 8) return "Password must be at least 8 characters";
        return null;
    };

    const validatePasswordConfirmation = (password_confirmation) => {
        if (!isEditing && !password_confirmation) return "Please confirm password";
        if (formData.password && password_confirmation !== formData.password) {
            return "Passwords do not match";
        }
        return null;
    };

    const validatePhone = (phone) => {
        if (phone && !/^[0-9+\-\s()]{10,15}$/.test(phone)) {
            return "Please enter a valid phone number (10-15 digits)";
        }
        return null;
    };

    const validateBranch = (branch_id) => {
        if (!branch_id) return "Please select a branch";
        return null;
    };

    const validateShift = (shift) => {
        if (!shift) return "Please select a shift";
        return null;
    };

    const validateForm = () => {
        const errors = {};
        
        const nameError = validateName(formData.name);
        if (nameError) errors.name = nameError;
        
        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;
        
        if (!isEditing) {
            const passwordError = validatePassword(formData.password);
            if (passwordError) errors.password = passwordError;
            
            const passwordConfirmationError = validatePasswordConfirmation(formData.password_confirmation);
            if (passwordConfirmationError) errors.password_confirmation = passwordConfirmationError;
        } else if (formData.password) {
            const passwordError = validatePassword(formData.password);
            if (passwordError) errors.password = passwordError;
            
            const passwordConfirmationError = validatePasswordConfirmation(formData.password_confirmation);
            if (passwordConfirmationError) errors.password_confirmation = passwordConfirmationError;
        }
        
        const phoneError = validatePhone(formData.phone);
        if (phoneError) errors.phone = phoneError;
        
        const branchError = validateBranch(formData.branch_id);
        if (branchError) errors.branch_id = branchError;
        
        const shiftError = validateShift(formData.shift);
        if (shiftError) errors.shift = shiftError;
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            phone: '',
            shift: 'morning',
            branch_id: '',
            is_active: true,
        });
        setIsEditing(false);
        setEditingId(null);
        setValidationErrors({});
        setShowForm(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const url = isEditing 
            ? `/super-admin/receptionists/${editingId}` 
            : "/super-admin/receptionists";
        
        const method = isEditing ? "put" : "post";
        
        const data = { ...formData };
        
        router[method](url, data, {
            onSuccess: () => {
                resetForm();
            },
            onError: (errors) => {
                setValidationErrors(errors);
            }
        });
    };

    const handleEdit = (receptionist) => {
        setFormData({
            name: receptionist.name,
            email: receptionist.email,
            password: '',
            password_confirmation: '',
            phone: receptionist.phone || '',
            shift: receptionist.shift || 'morning',
            branch_id: receptionist.branch_id,
            is_active: receptionist.is_active !== undefined ? receptionist.is_active : true,
        });
        setIsEditing(true);
        setEditingId(receptionist.id);
        setValidationErrors({});
        setShowForm(true);
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete receptionist "${name}"? This will also delete their user account. This action cannot be undone.`)) {
            router.delete(`/super-admin/receptionists/${id}`);
        }
    };

    const handleToggleStatus = (id) => {
        router.patch(`/super-admin/receptionists/${id}/toggle-status`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterBranch) params.append('branch_id', filterBranch);
        if (filterShift) params.append('shift', filterShift);
        if (filterStatus) params.append('status', filterStatus);
        
        router.get(`/super-admin/receptionists?${params.toString()}`, {}, {
            preserveState: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterBranch('');
        setFilterShift('');
        setFilterStatus('');
        router.get('/super-admin/receptionists');
    };

    const dismissFlash = () => {
        setFlashMessage(null);
    };

    const renderError = (field) => {
        const error = validationErrors[field] || serverErrors?.[field];
        if (error) {
            return <p className="text-red-500 text-sm mt-1">{error}</p>;
        }
        return null;
    };

    // Get shift badge color
    const getShiftBadgeColor = (shift) => {
        switch(shift) {
            case 'morning': return 'bg-blue-100 text-blue-800';
            case 'afternoon': return 'bg-yellow-100 text-yellow-800';
            case 'night': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Format shift display
    const formatShift = (shift) => {
        if (!shift) return 'N/A';
        return shift.charAt(0).toUpperCase() + shift.slice(1);
    };

    // Get branch name by ID
    const getBranchName = (branchId) => {
        if (!branches || branches.length === 0) return 'N/A';
        const branch = branches.find(b => b.id === branchId);
        return branch ? branch.name : 'N/A';
    };

    // Render flash message
    const renderFlashMessage = () => {
        if (!flashMessage) return null;

        const bgColor = flashMessage.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
        const iconColor = flashMessage.type === 'success' ? 'text-green-500' : 'text-red-500';
        const icon = flashMessage.type === 'success' ? '✓' : '✕';

        return (
            <div className={`${bgColor} border-l-4 p-4 rounded mb-4 flex justify-between items-center`}>
                <div className="flex items-center">
                    <span className={`${iconColor} font-bold mr-2`}>{icon}</span>
                    <span>{flashMessage.message}</span>
                </div>
                <button
                    onClick={dismissFlash}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Dismiss message"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderFlashMessage()}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Receptionist Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                    {showForm ? "Cancel" : "+ Add Receptionist"}
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <select
                        value={filterBranch}
                        onChange={(e) => {
                            setFilterBranch(e.target.value);
                            setTimeout(handleSearch, 100);
                        }}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">All Branches</option>
                        {branches && branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.branch_name || branch.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterShift}
                        onChange={(e) => {
                            setFilterShift(e.target.value);
                            setTimeout(handleSearch, 100);
                        }}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">All Shifts</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="night">Night</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setTimeout(handleSearch, 100);
                        }}
                        className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex-1"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* Receptionist Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                        {isEditing ? "Edit Receptionist" : "Add New Receptionist"}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.name || serverErrors?.name 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
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
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                />
                                {renderError('email')}
                            </div>

                            {!isEditing ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter password (min 8 characters)"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full border ${
                                                validationErrors.password || serverErrors?.password 
                                                    ? 'border-red-500' 
                                                    : 'border-gray-300'
                                            } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
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
                                                validationErrors.password_confirmation || serverErrors?.password_confirmation 
                                                    ? 'border-red-500' 
                                                    : 'border-gray-300'
                                            } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                        />
                                        {renderError('password_confirmation')}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password (leave blank to keep current)
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter new password (min 8 characters)"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`w-full border ${
                                                validationErrors.password || serverErrors?.password 
                                                    ? 'border-red-500' 
                                                    : 'border-gray-300'
                                            } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                        />
                                        {renderError('password')}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            placeholder="Confirm new password"
                                            value={formData.password_confirmation}
                                            onChange={handleInputChange}
                                            className={`w-full border ${
                                                validationErrors.password_confirmation || serverErrors?.password_confirmation 
                                                    ? 'border-red-500' 
                                                    : 'border-gray-300'
                                            } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                        />
                                        {renderError('password_confirmation')}
                                    </div>
                                </>
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
                                    className={`w-full border ${
                                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                />
                                {renderError('phone')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Branch <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="branch_id"
                                    value={formData.branch_id}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.branch_id || serverErrors?.branch_id 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                >
                                    <option value="">Select Branch</option>
                                    {branches && branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.branch_name || branch.name}
                                        </option>
                                    ))}
                                </select>
                                {renderError('branch_id')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Shift <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="shift"
                                    value={formData.shift}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.shift || serverErrors?.shift 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                >
                                    {shifts.map((shift) => (
                                        <option key={shift.value} value={shift.value}>
                                            {shift.label}
                                        </option>
                                    ))}
                                </select>
                                {renderError('shift')}
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-indigo-700 border-gray-300 rounded focus:ring-indigo-500"
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
                                className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg font-medium transition"
                            >
                                {isEditing ? "Update Receptionist" : "Save Receptionist"}
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

            {/* Receptionists Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NAME
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    EMAIL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PHONE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    BRANCH
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SHIFT
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
                            {receptionistsData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No receptionists added yet
                                    </td>
                                </tr>
                            ) : (
                                receptionistsData.map((receptionist) => (
                                    <tr key={receptionist.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {receptionist.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">
                                                {receptionist.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">
                                                {receptionist.phone || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">
                                                {receptionist.branch?.name || receptionist.branch?.branch_name || getBranchName(receptionist.branch_id) || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getShiftBadgeColor(receptionist.shift)}`}>
                                                {formatShift(receptionist.shift)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(receptionist.id)}
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    receptionist.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {receptionist.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(receptionist)}
                                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(receptionist.id, receptionist.name)}
                                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Only show if pagination data exists */}
                {paginationData && paginationData.data && paginationData.data.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing {paginationData.from || 0} to {paginationData.to || 0} of {paginationData.total || 0} results
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.get(paginationData.prev_page_url)}
                                    disabled={!paginationData.prev_page_url}
                                    className={`px-4 py-1 rounded border ${
                                        paginationData.prev_page_url
                                            ? 'hover:bg-gray-100 text-gray-700'
                                            : 'opacity-50 cursor-not-allowed text-gray-400'
                                    }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => router.get(paginationData.next_page_url)}
                                    disabled={!paginationData.next_page_url}
                                    className={`px-4 py-1 rounded border ${
                                        paginationData.next_page_url
                                            ? 'hover:bg-gray-100 text-gray-700'
                                            : 'opacity-50 cursor-not-allowed text-gray-400'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}