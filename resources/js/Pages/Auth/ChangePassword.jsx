import { useForm, usePage, router } from "@inertiajs/react";
import { useState } from "react";

export default function ChangePassword() {
    const { flash, auth } = usePage().props;
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/change-password", {
            onSuccess: () => {
                reset();
                // Redirect based on user role
                setTimeout(() => {
                    if (auth.user.role === 'super_admin') {
                        router.visit('/super-admin/dashboard');
                    } else if (auth.user.role === 'doctor') {
                        router.visit('/doctor/dashboard');
                    } else if (auth.user.role === 'receptionist') {
                        router.visit('/receptionist/dashboard');
                    } else {
                        router.visit('/');
                    }
                }, 1500); // Show success message for 1.5 seconds before redirect
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Change Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Update your password to keep your account secure
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back button */}
                <div className="mb-4">
                    <button
                        onClick={() => router.visit('/super-admin/dashboard')}
                        className="inline-flex items-center text-sm text-cyan-600 hover:text-cyan-700"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={submit}>
                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    id="current_password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={data.current_password}
                                    onChange={(e) => setData("current_password", e.target.value)}
                                    className={`appearance-none relative block w-full px-3 py-2 border ${
                                        errors.current_password ? "border-red-500" : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                                    placeholder="Enter current password"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {showCurrentPassword ? (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.current_password && (
                                <p className="mt-1 text-xs text-red-600">{errors.current_password}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    className={`appearance-none relative block w-full px-3 py-2 border ${
                                        errors.password ? "border-red-500" : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                                    placeholder="Enter new password"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {showNewPassword ? (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Password must be at least 8 characters long
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                    className={`appearance-none relative block w-full px-3 py-2 border ${
                                        errors.password_confirmation ? "border-red-500" : "border-gray-300"
                                    } rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm`}
                                    placeholder="Confirm new password"
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li className="flex items-center">
                                <svg className={`h-4 w-4 mr-2 ${data.password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                At least 8 characters
                            </li>
                            <li className="flex items-center">
                                <svg className={`h-4 w-4 mr-2 ${/[A-Z]/.test(data.password) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                At least one uppercase letter
                            </li>
                            <li className="flex items-center">
                                <svg className={`h-4 w-4 mr-2 ${/[a-z]/.test(data.password) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                At least one lowercase letter
                            </li>
                            <li className="flex items-center">
                                <svg className={`h-4 w-4 mr-2 ${/[0-9]/.test(data.password) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                At least one number
                            </li>
                        </ul>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating Password...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}