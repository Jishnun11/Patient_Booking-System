import { useForm } from "@inertiajs/react";

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/forgot-password");
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <form
                onSubmit={submit}
                className="bg-white p-6 shadow rounded w-96"
            >
                <h2 className="text-2xl mb-4">
                    Forgot Password
                </h2>

                <input
                    type="email"
                    placeholder="Enter Email"
                    value={data.email}
                    onChange={(e) =>
                        setData("email", e.target.value)
                    }
                    className="w-full border p-2"
                />

                {errors.email && (
                    <p className="text-red-500">
                        {errors.email}
                    </p>
                )}

                <button
                    className="w-full bg-cyan-700 text-white mt-4 p-2"
                >
                    Send OTP
                </button>
            </form>
        </div>
    );
}