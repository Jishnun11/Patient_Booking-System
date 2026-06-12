// import { router } from '@inertiajs/react';

// export default function Home() {

//     const handleLogout = () => {
//         router.post('/logout');
//     };

//     return (
//         <div>
//             <h1>Home Page</h1>

//             <button
//                 onClick={handleLogout}
//                 className="px-4 py-2 bg-red-500 text-white rounded"
//             >
//                 Logout
//             </button>
//         </div>
//     );
// }

import { router } from "@inertiajs/react";

export default function Home() {
    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-cyan-700 text-white shadow">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        Healthcare Management System
                    </h1>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="text-center py-12 px-4">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    Welcome to Healthcare ERP
                </h2>

                <p className="text-gray-600 max-w-3xl mx-auto">
                    A complete healthcare management platform designed to
                    streamline hospital operations, patient management,
                    appointments, consultations, and administrative workflows.
                </p>
            </section>

            {/* Modules */}
            <section className="max-w-6xl mx-auto px-6 pb-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Doctor */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold text-cyan-700 mb-3">
                            Doctor
                        </h3>

                        <p className="text-gray-600">
                            Doctors can manage appointments, view patient
                            records, prescribe medications, monitor treatment
                            plans, and update consultation details.
                        </p>
                    </div>

                    {/* Patient */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold text-green-600 mb-3">
                            Patient
                        </h3>

                        <p className="text-gray-600">
                            Patients can book appointments, access medical
                            history, view prescriptions, laboratory reports,
                            and manage personal health information.
                        </p>
                    </div>

                    {/* Receptionist */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold text-purple-600 mb-3">
                            Receptionist
                        </h3>

                        <p className="text-gray-600">
                            Receptionists can register patients, schedule
                            appointments, manage doctor availability, handle
                            billing support, and coordinate hospital operations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t py-4 text-center text-gray-500">
                © 2026 Healthcare ERP System. All Rights Reserved.
            </footer>
        </div>
    );
}