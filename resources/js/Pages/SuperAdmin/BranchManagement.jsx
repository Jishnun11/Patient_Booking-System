import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function BranchManagement({ branches, departments }) {
    const { flash, errors: serverErrors } = usePage().props;
    const [validationErrors, setValidationErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        branch_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        is_active: true,
        departments: [],
    });

    // Clear validation errors when form data changes
    useEffect(() => {
        if (validationErrors[Object.keys(validationErrors)[0]]) {
            setValidationErrors({});
        }
    }, [formData]);

    // Client-side validation functions - Only required fields
    const validateBranchName = (name) => {
        if (!name) return "Branch name is required";
        if (name.length < 2) return "Branch name must be at least 2 characters";
        if (name.length > 255) return "Branch name must be less than 255 characters";
        return null;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return "Email is required";
        if (!emailRegex.test(email)) return "Please enter a valid email address";
        return null;
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!phone) return "Phone number is required";
        if (!phoneRegex.test(phone)) return "Please enter a valid phone number (10-15 digits)";
        return null;
    };

    const validateAddress = (address) => {
        if (!address) return "Address is required";
        if (address.length < 5) return "Address must be at least 5 characters";
        return null;
    };

    const validateForm = () => {
        const errors = {};
        
        const nameError = validateBranchName(formData.branch_name);
        if (nameError) errors.branch_name = nameError;
        
        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;
        
        const phoneError = validatePhone(formData.phone);
        if (phoneError) errors.phone = phoneError;
        
        const addressError = validateAddress(formData.address);
        if (addressError) errors.address = addressError;
        
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

    const handleDepartmentChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setFormData({
            ...formData,
            departments: selectedOptions,
        });
    };

    const resetForm = () => {
        setFormData({
            branch_name: "",
            phone: "",
            email: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            is_active: true,
            departments: [],
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
            ? `/super-admin/branches/${editingId}` 
            : "/super-admin/branches";
        
        const method = isEditing ? "put" : "post";
        
        router[method](url, formData, {
            onSuccess: () => {
                resetForm();
            },
            onError: (errors) => {
                setValidationErrors(errors);
            }
        });
    };

    const handleEdit = (branch) => {
        setFormData({
            branch_name: branch.branch_name,
            phone: branch.phone || "",
            email: branch.email || "",
            address: branch.address || "",
            city: branch.city || "",
            state: branch.state || "",
            pincode: branch.pincode || "",
            is_active: branch.is_active,
            departments: branch.departments ? branch.departments.map(d => d.id) : [],
        });
        setIsEditing(true);
        setEditingId(branch.id);
        setValidationErrors({});
        setShowForm(true);
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete branch "${name}"? This action cannot be undone.`)) {
            router.delete(`/super-admin/branches/${id}`);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get("/super-admin/branches/search", { search: searchTerm }, {
            preserveState: true,
        });
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

    return (
        <div className="space-y-6">
            {renderFlashMessage()}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Branch Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                    {showForm ? "Cancel" : "+ Add Branch"}
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search branches..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm("");
                            router.get("/super-admin/branches");
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition"
                    >
                        Reset
                    </button>
                </form>
            </div>

            {/* Branch Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                        {isEditing ? "Edit Branch" : "Add New Branch"}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Branch Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="branch_name"
                                    placeholder="Enter branch name"
                                    value={formData.branch_name}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.branch_name || serverErrors?.branch_name 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('branch_name')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('phone')}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Enter address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.address ? 'border-red-500' : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('address')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Enter city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="Enter state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    placeholder="Enter pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    className={`w-full border ${
                                        validationErrors.pincode ? 'border-red-500' : 'border-gray-300'
                                    } px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                                />
                                {renderError('pincode')}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Departments
                                </label>
                                <select
                                    name="departments"
                                    multiple
                                    value={formData.departments}
                                    onChange={handleDepartmentChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent h-[42px] overflow-y-auto"
                                >
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-gray-500 text-xs mt-1">
                                    Hold Ctrl/Cmd to select multiple departments
                                </p>
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
                                {isEditing ? "Update Branch" : "Save Branch"}
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

            {/* Branches Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    BRANCH CODE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    BRANCH NAME
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    CONTACT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DEPARTMENTS
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
                            {branches.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No branches added yet
                                    </td>
                                </tr>
                            ) : (
                                branches.map((branch) => (
                                    <tr key={branch.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-700">
                                                {branch.branch_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {branch.branch_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">
                                                {branch.phone || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {branch.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                {branch.departments && branch.departments.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {branch.departments.map((dept) => (
                                                            <span key={dept.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                                {dept.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    'No departments'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                branch.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {branch.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(branch)}
                                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(branch.id, branch.branch_name)}
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