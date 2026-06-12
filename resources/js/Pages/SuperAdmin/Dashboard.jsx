import { router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Dashboard({ doctors, receptionists }) {
    const { flash } = usePage().props;
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [showReceptionistForm, setShowReceptionistForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
    });

    const handleLogout = () => {
        router.post("/logout");
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddDoctor = (e) => {
        e.preventDefault();
        router.post("/super-admin/doctors", formData, {
            onSuccess: () => {
                setShowDoctorForm(false);
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    specialization: "",
                });
            },
        });
    };

    const handleAddReceptionist = (e) => {
        e.preventDefault();
        router.post("/super-admin/receptionists", formData, {
            onSuccess: () => {
                setShowReceptionistForm(false);
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    specialization: "",
                });
            },
        });
    };

    const handleDeleteUser = (userId) => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(`/super-admin/users/${userId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-cyan-700 text-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Super Admin Dashboard
                        </h1>
                        <p className="text-sm text-cyan-100">
                            Manage Doctors and Receptionists
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="max-w-7xl mx-auto mt-4 px-6">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {flash.success}
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-7xl mx-auto mt-4 px-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {flash.error}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => {
                            setShowDoctorForm(!showDoctorForm);
                            setShowReceptionistForm(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                    >
                        + Add Doctor
                    </button>
                    <button
                        onClick={() => {
                            setShowReceptionistForm(!showReceptionistForm);
                            setShowDoctorForm(false);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                    >
                        + Add Receptionist
                    </button>
                </div>

                {/* Add Doctor Form */}
                {showDoctorForm && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Add New Doctor
                        </h2>
                        <form onSubmit={handleAddDoctor} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                    placeholder="e.g., Cardiologist, Neurologist"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg"
                                >
                                    Save Doctor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDoctorForm(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Add Receptionist Form */}
                {showReceptionistForm && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Add New Receptionist
                        </h2>
                        <form
                            onSubmit={handleAddReceptionist}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg"
                                >
                                    Save Receptionist
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReceptionistForm(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Doctors List */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        Doctors
                    </h2>
                    <div className="grid gap-4">
                        {doctors.length === 0 ? (
                            <p className="text-gray-500">No doctors added yet.</p>
                        ) : (
                            doctors.map((doctor) => (
                                <div
                                    key={doctor.id}
                                    className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {doctor.name}
                                        </h3>
                                        <p className="text-gray-600">
                                            {doctor.email}
                                        </p>
                                        {doctor.phone && (
                                            <p className="text-gray-500 text-sm">
                                                📞 {doctor.phone}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleDeleteUser(doctor.id)
                                        }
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Receptionists List */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        Receptionists
                    </h2>
                    <div className="grid gap-4">
                        {receptionists.length === 0 ? (
                            <p className="text-gray-500">
                                No receptionists added yet.
                            </p>
                        ) : (
                            receptionists.map((receptionist) => (
                                <div
                                    key={receptionist.id}
                                    className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {receptionist.name}
                                        </h3>
                                        <p className="text-gray-600">
                                            {receptionist.email}
                                        </p>
                                        {receptionist.phone && (
                                            <p className="text-gray-500 text-sm">
                                                📞 {receptionist.phone}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleDeleteUser(receptionist.id)
                                        }
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}