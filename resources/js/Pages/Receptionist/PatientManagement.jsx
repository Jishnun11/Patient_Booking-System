// resources/js/Pages/Receptionist/PatientManagement.jsx
import { router, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

export default function PatientManagement({ patients: initialPatients, filters: initialFilters }) {
    const { flash, errors: serverErrors } = usePage().props;
    const [validationErrors, setValidationErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "");
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || "");
    
    const [patients, setPatients] = useState(() => {
        if (Array.isArray(initialPatients)) {
            return initialPatients;
        }
        return initialPatients?.data || [];
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const isInitialRender = useRef(true);
    const debounceTimer = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gender: '',
        age: '',
        patient_code: '',
        place: '',
        date_of_birth: '',
        emergency_contact: '',
        status: 'active'
    });

    useEffect(() => {
        if (validationErrors[Object.keys(validationErrors)[0]]) {
            setValidationErrors({});
        }
    }, [formData]);

    const fetchPatients = (search = searchTerm, status = statusFilter) => {
        // Clear any pending debounce
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        setIsLoading(true);
        
        // Build query parameters
        const params = {};
        if (search && search.trim() !== '') {
            params.search = search.trim();
        }
        if (status && status.trim() !== '') {
            params.status = status.trim();
        }

        // Use router.get with the correct URL
        router.get(
            '/receptionist/patients',
            params,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true, // This replaces the URL instead of pushing a new entry
                only: ['patients', 'filters'],
                onSuccess: (page) => {
                    const patientsData = page.props.patients;
                    if (Array.isArray(patientsData)) {
                        setPatients(patientsData);
                    } else {
                        setPatients(patientsData?.data || []);
                    }
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error('Error fetching patients:', errors);
                    setIsLoading(false);
                }
            }
        );
    };

    // Handle search with debounce
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        
        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            fetchPatients(searchTerm, statusFilter);
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchTerm, statusFilter]);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name) errors.name = "Patient name is required";
        if (formData.name && formData.name.length < 2) errors.name = "Name must be at least 2 characters";
        if (!formData.phone) errors.phone = "Phone number is required";
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }
        
        if (formData.age && (parseInt(formData.age) < 0 || parseInt(formData.age) > 150)) {
            errors.age = "Age must be between 0 and 150";
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
            phone: '',
            email: '',
            address: '',
            gender: '',
            age: '',
            patient_code: '',
            place: '',
            date_of_birth: '',
            emergency_contact: '',
            status: 'active'
        });
        setIsEditing(false);
        setEditingId(null);
        setValidationErrors({});
        setShowForm(false);
    };

    const generatePatientCode = () => {
        const prefix = "PAT";
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const submitData = { ...formData };
        
        if (!submitData.patient_code) {
            submitData.patient_code = generatePatientCode();
        }

        const url = isEditing
            ? `/receptionist/patients/${editingId}`
            : '/receptionist/patients';
                    
        const method = isEditing ? 'put' : 'post';

        router[method](url, submitData, {
            preserveState: true,
            preserveScroll: true,
            only: ['flash', 'patients'],
            onSuccess: (page) => {
                resetForm();
                const patientsData = page.props.patients;
                if (Array.isArray(patientsData)) {
                    setPatients(patientsData);
                } else {
                    setPatients(patientsData?.data || []);
                }
                // Refresh the search results after successful operation
                fetchPatients(searchTerm, statusFilter);
            },
            onError: (errors) => {
                setValidationErrors(errors);
            }
        });
    };

    const handleEdit = (patient) => {
        setFormData({
            name: patient.name || '',
            phone: patient.phone || '',
            email: patient.email || '',
            address: patient.address || '',
            gender: patient.gender || '',
            age: patient.age || '',
            patient_code: patient.patient_code || '',
            place: patient.place || '',
            date_of_birth: patient.date_of_birth || '',
            emergency_contact: patient.emergency_contact || '',
            status: patient.status || 'active'
        });
        setIsEditing(true);
        setEditingId(patient.id);
        setValidationErrors({});
        setShowForm(true);
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            router.delete(`/receptionist/patients/${id}`, {
                preserveState: true,
                preserveScroll: true,
                only: ['flash', 'patients'],
                onSuccess: (page) => {
                    const patientsData = page.props.patients;
                    if (Array.isArray(patientsData)) {
                        setPatients(patientsData);
                    } else {
                        setPatients(patientsData?.data || []);
                    }
                    // Refresh the search results after successful operation
                    fetchPatients(searchTerm, statusFilter);
                }
            });
        }
    };

    const handleToggleStatus = (patient) => {
        const action = patient.status === 'active' ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} ${patient.name}?`)) {
            router.post(`/receptionist/patients/${patient.id}/toggle-status`, {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['flash', 'patients'],
                onSuccess: (page) => {
                    const patientsData = page.props.patients;
                    if (Array.isArray(patientsData)) {
                        setPatients(patientsData);
                    } else {
                        setPatients(patientsData?.data || []);
                    }
                    // Refresh the search results after successful operation
                    fetchPatients(searchTerm, statusFilter);
                }
            });
        }
    };

    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("");
        // Immediately fetch with empty values
        fetchPatients("", "");
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

    const getStatusBadge = (status) => {
        const statusMap = {
            active: "bg-green-100 text-green-700",
            inactive: "bg-red-100 text-red-700",
            pending: "bg-yellow-100 text-yellow-700",
            archived: "bg-gray-100 text-gray-700"
        };
        return statusMap[status] || "bg-gray-100 text-gray-700";
    };

    const getStatusLabel = (status) => {
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active';
    };

    return (
        <div className="space-y-6">
            {renderFlashMessage()}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Total Patients: {patients?.length || 0}
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
                                name: '',
                                phone: '',
                                email: '',
                                address: '',
                                gender: '',
                                age: '',
                                patient_code: '',
                                place: '',
                                date_of_birth: '',
                                emergency_contact: '',
                                status: 'active'
                            });
                        }
                    }}
                    className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                    {showForm ? "Cancel" : "+ Register Patient"}
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        placeholder="Search by name, code, phone, or place..."
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
                        <option value="pending">Pending</option>
                        <option value="archived">Archived</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Patient Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                        {isEditing ? "Edit Patient" : "Register New Patient"}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient Name <span className="text-red-500">*</span>
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
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('name')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient Code
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        name="patient_code"
                                        placeholder="Auto-generated"
                                        value={formData.patient_code}
                                        onChange={handleInputChange}
                                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50"
                                        readOnly={!isEditing}
                                    />
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const code = generatePatientCode();
                                                setFormData({
                                                    ...formData,
                                                    patient_code: code
                                                });
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap"
                                        >
                                            Generate
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.phone || serverErrors?.phone
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('phone')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Enter age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.age || serverErrors?.age
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                    min="0"
                                    max="150"
                                />
                                {renderError('age')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact"
                                    placeholder="Enter emergency contact number"
                                    value={formData.emergency_contact}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Place
                                </label>
                                <input
                                    type="text"
                                    name="place"
                                    placeholder="Enter city/town"
                                    value={formData.place}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    placeholder="Enter full address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                            <button
                                type="submit"
                                className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-medium transition"
                            >
                                {isEditing ? "Update Patient" : "Register Patient"}
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

            {/* Patients Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PATIENT CODE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NAME
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CONTACT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    GENDER/AGE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                    PLACE
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
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-700"></div>
                                            <span>Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No patients found
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                {patient.patient_code || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {patient.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">
                                                {patient.phone || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {patient.email || 'No email'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                            <div className="text-sm text-gray-700 capitalize">
                                                {patient.gender || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {patient.age || 'N/A'} years
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                            <div className="text-sm text-gray-700">
                                                {patient.place || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {patient.address?.substring(0, 30) || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(patient.status)}`}>
                                                {getStatusLabel(patient.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(patient)}
                                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(patient.id, patient.name)}
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
            </div>
        </div>
    );
}