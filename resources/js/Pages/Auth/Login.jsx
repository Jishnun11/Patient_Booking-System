// import { useForm } from "@inertiajs/react";

// export default function Login() {
//     const { data, setData, post, processing, errors } = useForm({
//         email: "",
//         password: "",
//     });

//     const submit = (e) => {
//         e.preventDefault();
//         post("/login");
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center">
//             <div className="w-full max-w-md bg-white p-6 shadow rounded">
//                 <h2 className="text-2xl font-bold mb-6 text-center">
//                     Login
//                 </h2>

//                 <form onSubmit={submit}>
//                     <div className="mb-4">
//                         <label>Email</label>

//                         <input
//                             type="email"
//                             value={data.email}
//                             onChange={(e) =>
//                                 setData("email", e.target.value)
//                             }
//                             className="w-full border p-2 rounded"
//                         />

//                         {errors.email && (
//                             <div className="text-red-500">
//                                 {errors.email}
//                             </div>
//                         )}
//                     </div>

//                     <div className="mb-4">
//                         <label>Password</label>

//                         <input
//                             type="password"
//                             value={data.password}
//                             onChange={(e) =>
//                                 setData("password", e.target.value)
//                             }
//                             className="w-full border p-2 rounded"
//                         />

//                         {errors.password && (
//                             <div className="text-red-500">
//                                 {errors.password}
//                             </div>
//                         )}
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={processing}
//                         className="w-full bg-blue-600 text-white p-2 rounded"
//                     >
//                         Login
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

import { useForm } from "@inertiajs/react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/login");
    };

    return (
        <div className="min-h-screen bg-cyan-700 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        Login
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={submit}>
                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2 font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={data.email}
                            onChange={(e) =>
                                setData("email", e.target.value)
                            }
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                        />

                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                        />

                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center mb-5">
                        <input
                            type="checkbox"
                            id="remember"
                            className="mr-2"
                        />
                        <label
                            htmlFor="remember"
                            className="text-gray-600 text-sm"
                        >
                            Remember Me
                        </label>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-lg transition duration-300"
                    >
                        {processing ? "Signing In..." : "SIGN IN"}
                    </button>

                    {/* Footer Links */}
                    <div className="text-center mt-6">
                        <a
                            href="#"
                            className="text-cyan-700 text-sm hover:underline"
                        >
                            Forgot Password?
                        </a>

                        <p className="mt-3 text-sm text-gray-600">
                            Don't have an account?{" "}
                            <a
                                href="#"
                                className="text-cyan-700 font-medium hover:underline"
                            >
                                Sign Up
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}